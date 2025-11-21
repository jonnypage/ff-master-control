import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Mission, MissionDocument } from './schemas/mission.schema';
import {
  MissionCompletion,
  MissionCompletionDocument,
} from './schemas/mission-completion.schema';
import { TeamsService } from '../teams/teams.service';

@Injectable()
export class MissionsService {
  constructor(
    @InjectModel(Mission.name) private missionModel: Model<MissionDocument>,
    @InjectModel(MissionCompletion.name)
    private missionCompletionModel: Model<MissionCompletionDocument>,
    private teamsService: TeamsService,
  ) {}

  async findAll(): Promise<MissionDocument[]> {
    return this.missionModel.find().exec();
  }

  async findOne(id: string): Promise<MissionDocument | null> {
    return this.missionModel.findById(id).exec();
  }

  async completeMission(
    nfcCardId: string,
    missionId: string,
    completedBy: string,
    isManualOverride = false,
  ): Promise<MissionCompletionDocument> {
    const team = await this.teamsService.findByNfcCardId(nfcCardId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const mission = await this.missionModel.findById(missionId);
    if (!mission) {
      throw new NotFoundException('Mission not found');
    }

    // Check if mission already completed (unless manual override)
    if (!isManualOverride) {
      const existingCompletion = await this.missionCompletionModel.findOne({
        teamId: team._id,
        missionId: mission._id,
      });

      if (existingCompletion) {
        throw new ConflictException('Mission already completed');
      }
    }

    // Create completion record
    const completion = new this.missionCompletionModel({
      teamId: team._id,
      missionId: mission._id,
      completedBy,
      completedAt: new Date(),
      isManualOverride,
    });

    await completion.save();

    // Add to team's completed missions and award credits
    await this.teamsService.addCompletedMission(
      team._id.toString(),
      missionId,
    );
    await this.teamsService.addCredits(team._id.toString(), mission.creditsAwarded);

    return completion.populate(['teamId', 'missionId', 'completedBy']) as Promise<MissionCompletionDocument>;
  }

  async overrideMissionCompletion(
    teamId: string,
    missionId: string,
    completedBy: string,
  ): Promise<MissionCompletionDocument> {
    const team = await this.teamsService.findOne(teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const mission = await this.missionModel.findById(missionId);
    if (!mission) {
      throw new NotFoundException('Mission not found');
    }

    // Check if already completed
    const existingCompletion = await this.missionCompletionModel.findOne({
      teamId: team._id,
      missionId: mission._id,
    });

    if (existingCompletion) {
      return existingCompletion.populate(['teamId', 'missionId', 'completedBy']) as Promise<MissionCompletionDocument>;
    }

    // Create override completion
    return this.completeMission(
      team.nfcCardId,
      missionId,
      completedBy,
      true,
    );
  }

  async findCompletions(teamId?: string): Promise<MissionCompletionDocument[]> {
    const query = teamId ? { teamId } : {};
    return this.missionCompletionModel
      .find(query)
      .populate(['teamId', 'missionId', 'completedBy'])
      .exec();
  }
}

