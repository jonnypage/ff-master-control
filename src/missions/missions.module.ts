import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MissionsService } from './missions.service';
import { MissionsResolver } from './missions.resolver';
import { Mission, MissionSchema } from './schemas/mission.schema';
import {
  MissionCompletion,
  MissionCompletionSchema,
} from './schemas/mission-completion.schema';
import { TeamsModule } from '../teams/teams.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Mission.name, schema: MissionSchema },
      { name: MissionCompletion.name, schema: MissionCompletionSchema },
    ]),
    TeamsModule,
  ],
  providers: [MissionsService, MissionsResolver],
  exports: [MissionsService],
})
export class MissionsModule {}

