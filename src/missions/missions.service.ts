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
import { MissionStatus } from '../teams/schemas/team.schema';

@Injectable()
export class MissionsService {
  constructor(
    @InjectModel(Mission.name) private missionModel: Model<MissionDocument>,
    @InjectModel(MissionCompletion.name)
    private missionCompletionModel: Model<MissionCompletionDocument>,
    private teamsService: TeamsService,
  ) { }

  async findAll(): Promise<MissionDocument[]> {
    return this.missionModel.find().sort({ missionNumber: 1 }).exec();
  }

  async findAllForLeaderboard(): Promise<
    Pick<Mission, '_id' | 'name' | 'isFinalChallenge'>[]
  > {
    return this.missionModel
      .aggregate<Pick<Mission, '_id' | 'name' | 'isFinalChallenge'>>([
        {
          $project: {
            _id: 1,
            name: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$name', null] },
                    { $ne: ['$name', ''] },
                  ],
                },
                '$name',
                'Unnamed Mission',
              ],
            },
            isFinalChallenge: { $ifNull: ['$isFinalChallenge', false] },
          },
        },
      ])
      .sort({ missionNumber: 1 })
      .exec();
  }

  async findOne(id: string): Promise<MissionDocument | null> {
    return this.missionModel.findById(id).exec();
  }

  async completeMission(
    teamId: string,
    missionId: string,
    completedBy: string,
    isManualOverride = false,
  ): Promise<MissionCompletionDocument> {
    const team = await this.teamsService.findOne(teamId);
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

    // Update team's mission progress to COMPLETE
    const crystalsToAward = mission.awardsCrystal ? 1 : 0;

    await this.teamsService.completeMission(
      team._id.toString(),
      missionId,
      mission.creditsAwarded,
      crystalsToAward,
    );
    await this.teamsService.addCredits(
      team._id.toString(),
      mission.creditsAwarded,
    );

    // Award crystal if mission awards one
    if (mission.awardsCrystal) {
      await this.teamsService.addCrystals(team._id.toString(), 1);
    }

    // Return without populate since GraphQL expects IDs, not full objects
    return completion as MissionCompletionDocument;
  }

  async startMission(
    teamId: string,
    missionId: string,
  ): Promise<MissionDocument> {
    const team = await this.teamsService.findOne(teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const mission = await this.missionModel.findById(missionId);
    if (!mission) {
      throw new NotFoundException('Mission not found');
    }

    await this.teamsService.startMission(team._id.toString(), missionId);

    return mission;
  }

  async failMission(
    teamId: string,
    missionId: string,
  ): Promise<MissionDocument> {
    const team = await this.teamsService.findOne(teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const mission = await this.missionModel.findById(missionId);
    if (!mission) {
      throw new NotFoundException('Mission not found');
    }

    await this.teamsService.failMission(team._id.toString(), missionId);

    return mission;
  }

  async adjustMissionTime(
    teamId: string,
    missionId: string,
    minutes: number,
  ): Promise<MissionDocument> {
    const team = await this.teamsService.findOne(teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const mission = await this.missionModel.findById(missionId);
    if (!mission) {
      throw new NotFoundException('Mission not found');
    }

    await this.teamsService.adjustMissionStartTime(
      team._id.toString(),
      missionId,
      minutes,
    );

    return mission;
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
      // Existing MissionCompletion record found - ensure team's missions is also synced
      const crystalsToAward = mission.awardsCrystal ? 1 : 0;
      await this.teamsService.completeMission(
        team._id.toString(),
        missionId,
        mission.creditsAwarded,
        crystalsToAward,
      );
      return existingCompletion as MissionCompletionDocument;
    }

    // Create override completion
    return this.completeMission(team._id.toString(), missionId, completedBy, true);
  }

  async findCompletions(teamId?: string): Promise<MissionCompletionDocument[]> {
    const query = teamId ? { teamId } : {};
    return this.missionCompletionModel
      .find(query)
      .populate(['teamId', 'missionId', 'completedBy'])
      .exec();
  }

  async removeMissionCompletion(
    teamId: string,
    missionId: string,
  ): Promise<void> {
    const team = await this.teamsService.findOne(teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const mission = await this.missionModel.findById(missionId);
    if (!mission) {
      throw new NotFoundException('Mission not found');
    }

    // Find and delete the completion record
    const completion = await this.missionCompletionModel.findOneAndDelete({
      teamId: team._id,
      missionId: mission._id,
    });

    if (!completion) {
      throw new NotFoundException('Mission completion not found');
    }

    // Reset mission in team and get the values to reverse
    const removedValues = await this.teamsService.resetMission(
      team._id.toString(),
      missionId,
    );

    // If removedValues is null or has 0 credits (legacy backfill), fall back to current mission values
    const creditsToDeduct =
      removedValues && removedValues.creditsReceived > 0
        ? removedValues.creditsReceived
        : mission.creditsAwarded;

    const crystalsToDeduct =
      removedValues && (removedValues.crystalsReceived || 0) > 0
        ? removedValues.crystalsReceived
        : mission.awardsCrystal
          ? 1
          : 0;

    // Remove credits that were awarded
    await this.teamsService.addCredits(
      team._id.toString(),
      -creditsToDeduct,
    );

    // Remove crystal if mission awarded one
    if (crystalsToDeduct) {
      await this.teamsService.addCrystals(team._id.toString(), -crystalsToDeduct);
    }
  }

  async create(createMissionDto: {
    name: string;
    description?: string;
    creditsAwarded: number;
    isFinalChallenge: boolean;
    missionDuration?: number;
    missionNumber?: number;
    posterURL?: string;
  }): Promise<MissionDocument> {
    const createdMission = new this.missionModel({
      ...createMissionDto,
      missionNumber: createMissionDto.missionNumber || 0,
    });
    return createdMission.save();
  }

  async update(
    id: string,
    updateData: {
      name?: string;
      description?: string;
      creditsAwarded?: number;
      awardsCrystal?: boolean;
      isFinalChallenge?: boolean;
      missionDuration?: number;
      missionNumber?: number;
      posterURL?: string;
    },
  ): Promise<MissionDocument> {
    const mission = await this.missionModel.findById(id);
    if (!mission) {
      throw new NotFoundException('Mission not found');
    }

    if (updateData.name !== undefined) {
      mission.name = updateData.name;
    }
    if (updateData.description !== undefined) {
      mission.description = updateData.description;
    }
    if (updateData.creditsAwarded !== undefined) {
      mission.creditsAwarded = updateData.creditsAwarded;
    }
    if (updateData.awardsCrystal !== undefined) {
      mission.awardsCrystal = updateData.awardsCrystal;
    }
    if (updateData.isFinalChallenge !== undefined) {
      mission.isFinalChallenge = updateData.isFinalChallenge;
    }
    if (updateData.missionDuration !== undefined) {
      mission.missionDuration = updateData.missionDuration;
    }
    if (updateData.missionNumber !== undefined) {
      mission.missionNumber = updateData.missionNumber;
    }
    if (updateData.posterURL !== undefined) {
      mission.posterURL = updateData.posterURL;
    }

    return mission.save();
  }
}
