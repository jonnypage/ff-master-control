import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Team, TeamDocument } from '../src/teams/schemas/team.schema';
import type { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const teamModel = app.get<Model<TeamDocument>>(getModelToken(Team.name));

  const defaultPin = process.env.DEFAULT_TEAM_PIN ?? '0000';
  if (!/^\d{4}$/.test(defaultPin)) {
    console.error('❌ DEFAULT_TEAM_PIN must be exactly 4 digits');
    await app.close();
    process.exit(1);
  }

  const legacyTeams = await teamModel
    .find({
      $or: [
        { teamGuid: { $exists: false } },
        { teamGuid: null },
        { teamGuid: '' },
        { pinHash: { $exists: false } },
        { pinHash: null },
        { pinHash: '' },
      ],
    })
    .select('+pinHash')
    .exec();

  if (legacyTeams.length === 0) {
    console.log('✅ No legacy teams found. Nothing to migrate.');
    await app.close();
    process.exit(0);
  }

  const defaultPinHash = await bcrypt.hash(defaultPin, 10);

  let updated = 0;
  for (const team of legacyTeams) {
    let changed = false;
    if (!team.teamGuid) {
      team.teamGuid = randomUUID();
      changed = true;
    }
    if (!team.pinHash) {
      team.pinHash = defaultPinHash;
      changed = true;
    }
    if (changed) {
      await team.save();
      updated += 1;
    }
  }

  console.log(
    `✅ Migrated legacy teams: updated ${updated} / ${legacyTeams.length}.`,
  );
  console.log(
    `ℹ️ Legacy teams missing a PIN were assigned the default PIN: ${defaultPin}`,
  );

  await app.close();
  process.exit(0);
}

bootstrap();

