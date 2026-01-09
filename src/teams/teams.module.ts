import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { TeamsService } from './teams.service';
import { TeamsResolver } from './teams.resolver';
import { Team, TeamSchema } from './schemas/team.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Team.name, schema: TeamSchema }])],
  providers: [TeamsService, TeamsResolver],
  exports: [TeamsService],
})
export class TeamsModule implements OnModuleInit {
  private readonly logger = new Logger(TeamsModule.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onModuleInit() {
    // Back-compat cleanup: legacy NFC deployments created a UNIQUE index on nfcCardId.
    // Now that nfcCardId is removed, inserts may set nfcCardId=null, which collides under a unique index.
    // We drop this index if present. Safe no-op if already removed.
    try {
      const collection = this.connection.collection('teams');
      const indexes = await collection.indexes();
      const hasLegacyNfcIndex = indexes.some((idx) => idx?.name === 'nfcCardId_1');

      if (hasLegacyNfcIndex) {
        this.logger.warn('Dropping legacy unique index teams.nfcCardId_1');
        await collection.dropIndex('nfcCardId_1');
        this.logger.warn('Dropped legacy unique index teams.nfcCardId_1');
      }
    } catch (err: any) {
      // Don’t block app startup; log and continue.
      this.logger.warn(
        `Failed to drop legacy teams.nfcCardId_1 index: ${err?.message ?? String(err)}`,
      );
    }
  }
}

