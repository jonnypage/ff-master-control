import {
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { Team, TeamDocument, MissionStatus } from './schemas/team.schema';
import { LeaderboardTeam } from './schemas/leaderboard-team.schema';
import { CreateTeamDto } from './dto/create-team.dto';

@Injectable()
export class TeamsService implements OnModuleInit {
  constructor(@InjectModel(Team.name) private teamModel: Model<TeamDocument>) { }

  async onModuleInit() {
    await this.backfillLegacyTeamFields();
  }

  private deriveTeamCode(teamGuid: string): string {
    // Use last 8 hex chars of UUID (strip hyphens), uppercase for readability.
    const hex = String(teamGuid).replace(/-/g, '').toUpperCase();
    return hex.slice(-8);
  }

  private async backfillLegacyTeamFields(): Promise<void> {
    // Only backfill teams that truly lack the new fields.
    const legacyTeams = await this.teamModel
      .find({
        $or: [
          { teamGuid: { $exists: false } },
          { teamGuid: null },
          { teamGuid: '' },
          { teamCode: { $exists: false } },
          { teamCode: null },
          { teamCode: '' },
          { pin: { $exists: false } },
          { pin: null },
          { pin: '' },
          { pinHash: { $exists: false } },
          { pinHash: null },
          { pinHash: '' },
        ],
      })
      .select('+pin +pinHash')
      .exec();

    if (legacyTeams.length === 0) return;

    const defaultPin = '0000';
    const defaultPinHash = await bcrypt.hash(defaultPin, 10);

    for (const team of legacyTeams) {
      let changed = false;

      if (!team.teamGuid) {
        team.teamGuid = randomUUID();
        changed = true;
      }

      if (!team.teamCode) {
        team.teamCode = this.deriveTeamCode(team.teamGuid);
        changed = true;
      }

      if (!team.pin) {
        team.pin = defaultPin;
        changed = true;
      }

      if (!team.pinHash) {
        team.pinHash = await bcrypt.hash(team.pin ?? defaultPin, 10);
        changed = true;
      }

      if (changed) {
        await team.save();
      }
    }

    // Secondary backfill: Migrate old completedMissions -> missions
    const teamsWithLegacyMissions = await this.teamModel
      .find({
        completedMissions: { $exists: true, $not: { $size: 0 } },
        missions: { $size: 0 },
      })
      .exec();

    for (const team of teamsWithLegacyMissions) {
      if ((team as any).completedMissions && (team as any).completedMissions.length > 0) {
        team.missions = (team as any).completedMissions.map((cm: any) => ({
          missionId: cm.missionId,
          status: MissionStatus.COMPLETE,
          tries: 1,
          startedAt: cm.completedAt,
          completedAt: cm.completedAt,
          creditsReceived: cm.creditsReceived || 0,
          crystalsReceived: cm.crystalsReceived || 0,
        }));
        team.markModified('missions');
        await team.save();
      }
    }
  }

  async create(createTeamDto: CreateTeamDto): Promise<TeamDocument> {
    let teamGuid = randomUUID();
    let teamCode = this.deriveTeamCode(teamGuid);

    // Ensure teamCode uniqueness
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existing = await this.teamModel.findOne({ teamCode }).lean();
      if (!existing) break;
      teamGuid = randomUUID();
      teamCode = this.deriveTeamCode(teamGuid);
    }
    const pinHash = await bcrypt.hash(createTeamDto.pin, 10);

    const createdTeam = new this.teamModel({
      name: createTeamDto.name,
      teamGuid,
      teamCode,
      pin: createTeamDto.pin,
      pinHash,
      image: createTeamDto.image ?? null,
      bannerColor: createTeamDto.bannerColor ?? '#7c3aed',
      bannerIcon: createTeamDto.bannerIcon ?? 'Shield',
    });

    return createdTeam.save();
  }

  async findByTeamGuid(teamGuid: string): Promise<TeamDocument | null> {
    return this.teamModel.findOne({ teamGuid }).exec();
  }

  async findByTeamCodeForAuth(teamCode: string): Promise<TeamDocument | null> {
    return this.teamModel.findOne({ teamCode }).select('+pinHash').exec();
  }

  async findOne(id: string): Promise<TeamDocument | null> {
    await this.backfillLegacyTeamFields();
    const team = await this.teamModel.findById(id).exec();
    if (team && !team.missions) {
      team.missions = [];
    }
    return team;
  }

  async findOneForTeamSession(id: string): Promise<TeamDocument | null> {
    await this.backfillLegacyTeamFields();
    const team = await this.teamModel.findById(id).select('+pin').exec();
    if (team && !team.missions) {
      team.missions = [];
    }
    return team;
  }

  async findAll(): Promise<TeamDocument[]> {
    await this.backfillLegacyTeamFields();
    const teams = await this.teamModel.find().exec();
    return teams.map(team => {
      if (team && !team.missions) {
        team.missions = [];
      }
      return team;
    });
  }

  async findLeaderboard(): Promise<LeaderboardTeam[]> {
    const teams = await this.teamModel
      .find(
        {},
        {
          name: 1,
          missions: 1,
          bannerColor: 1,
          bannerIcon: 1,
        },
      )
      .lean()
      .exec();

    return teams.map((team) => ({
      ...team,
      missions: team.missions || [],
    })) as unknown as LeaderboardTeam[];
  }

  async update(
    id: string,
    updateData: { name?: string; image?: any; bannerColor?: string; bannerIcon?: string },
  ): Promise<TeamDocument> {
    const team = await this.teamModel.findById(id);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (updateData.name !== undefined) {
      team.name = updateData.name;
    }

    if (updateData.image !== undefined) {
      team.image = updateData.image;
    }

    if (updateData.bannerColor !== undefined) {
      team.bannerColor = updateData.bannerColor;
    }

    if (updateData.bannerIcon !== undefined) {
      team.bannerIcon = updateData.bannerIcon;
    }

    return team.save();
  }

  async addCredits(teamId: string, amount: number): Promise<TeamDocument> {
    const team = await this.teamModel.findById(teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    team.credits = Math.max(0, team.credits + amount);
    return team.save();
  }

  async addCrystals(teamId: string, amount: number): Promise<TeamDocument> {
    const team = await this.teamModel.findById(teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    team.crystals = Math.max(0, team.crystals + amount);
    return team.save();
  }

  // Find or create a mission entry for a team
  private getMissionEntry(team: TeamDocument, missionId: string) {
    if (!team.missions) {
      team.missions = [];
    }
    return team.missions.find(
      (m) => m.missionId.toString() === missionId.toString(),
    );
  }

  // Start a mission for a team
  async startMission(
    teamId: string,
    missionId: string,
  ): Promise<TeamDocument> {
    const team = await this.teamModel.findById(teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (!team.missions) {
      team.missions = [];
    }

    let entry = this.getMissionEntry(team, missionId);

    if (!entry) {
      // Create new entry
      team.missions.push({
        missionId: new Types.ObjectId(missionId) as any,
        status: MissionStatus.IN_PROGRESS,
        tries: 1,
        startedAt: new Date(),
        completedAt: undefined,
        creditsReceived: 0,
        crystalsReceived: 0,
      });
    } else if (entry.status === MissionStatus.NOT_ATTEMPTED || entry.status === MissionStatus.FAILED) {
      // Restart mission
      entry.status = MissionStatus.IN_PROGRESS;
      entry.tries += 1;
      entry.startedAt = new Date();
      entry.completedAt = undefined;
    }


    team.markModified('missions');
    return team.save();
  }

  // Complete a mission for a team
  async completeMission(
    teamId: string,
    missionId: string,
    creditsReceived: number,
    crystalsReceived: number = 0,
  ): Promise<TeamDocument> {
    const team = await this.teamModel.findById(teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (!team.missions) {
      team.missions = [];
    }

    let entry = this.getMissionEntry(team, missionId);

    if (!entry) {
      // Direct completion without starting (admin override)
      team.missions.push({
        missionId: new Types.ObjectId(missionId) as any,
        status: MissionStatus.COMPLETE,
        tries: 1,
        startedAt: new Date(),
        completedAt: new Date(),
        creditsReceived,
        crystalsReceived,
      });
    } else {
      entry.status = MissionStatus.COMPLETE;
      entry.completedAt = new Date();
      entry.creditsReceived = creditsReceived;
      entry.crystalsReceived = crystalsReceived;
    }

    team.markModified('missions');
    return team.save();
  }

  // Fail a mission for a team
  async failMission(
    teamId: string,
    missionId: string,
  ): Promise<TeamDocument> {
    const team = await this.teamModel.findById(teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const entry = this.getMissionEntry(team, missionId);
    if (entry && entry.status === MissionStatus.IN_PROGRESS) {
      entry.status = MissionStatus.FAILED;
    }

    team.markModified('missions');
    return team.save();
  }

  // Adjust mission start time (to give more time or reduce time)
  async adjustMissionStartTime(
    teamId: string,
    missionId: string,
    minutes: number,
  ): Promise<TeamDocument> {
    const team = await this.teamModel.findById(teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const entry = this.getMissionEntry(team, missionId);
    if (!entry || !entry.startedAt) {
      throw new NotFoundException('Mission not started or not found for team');
    }

    const newTime = new Date(entry.startedAt.getTime() + minutes * 60000);

    // Use atomic update to ensure it persists
    await this.teamModel.updateOne(
      {
        _id: teamId,
        'missions.missionId': new Types.ObjectId(missionId)
      },
      {
        $set: { 'missions.$.startedAt': newTime }
      }
    );

    // Return updated team
    const updatedTeam = await this.teamModel.findById(teamId);
    return updatedTeam!;
  }

  // Reset a mission (remove completion, revert to NOT_STARTED)
  async resetMission(
    teamId: string,
    missionId: string,
  ): Promise<{ creditsReceived: number; crystalsReceived: number } | null> {
    const team = await this.teamModel.findById(teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (!team.missions) {
      return null;
    }

    const index = team.missions.findIndex(
      (m) => m.missionId.toString() === missionId.toString(),
    );

    if (index === -1) {
      return null;
    }

    const removed = team.missions[index];
    team.missions.splice(index, 1);
    team.markModified('missions');
    await team.save();

    return {
      creditsReceived: removed.creditsReceived,
      crystalsReceived: removed.crystalsReceived || 0,
    };
  }

  // Check if mission is completed
  async hasMissionCompleted(
    teamId: string,
    missionId: string,
  ): Promise<boolean> {
    const team = await this.teamModel.findById(teamId);
    if (!team) {
      return false;
    }

    const entry = team.missions?.find(
      (m) => m.missionId.toString() === missionId.toString(),
    );

    return entry?.status === MissionStatus.COMPLETE;
  }

  // Get mission status
  async getMissionStatus(
    teamId: string,
    missionId: string,
  ): Promise<MissionStatus> {
    const team = await this.teamModel.findById(teamId);
    if (!team) {
      return MissionStatus.NOT_ATTEMPTED;
    }

    const entry = team.missions?.find(
      (m) => m.missionId.toString() === missionId.toString(),
    );

    return entry?.status || MissionStatus.NOT_ATTEMPTED;
  }

  async findByNameOrTeamGuid(
    searchTerm: string,
  ): Promise<TeamDocument | null> {
    const byTeamGuid = await this.teamModel.findOne({ teamGuid: searchTerm }).exec();
    if (byTeamGuid) return byTeamGuid;

    const byName = await this.teamModel
      .findOne({
        name: { $regex: new RegExp(searchTerm, 'i') },
      })
      .exec();

    return byName || null;
  }

  async deleteAll(): Promise<void> {
    await this.teamModel.deleteMany({}).exec();
  }

  async deleteOne(id: string): Promise<boolean> {
    const result = await this.teamModel.deleteOne({ _id: id }).exec();
    return (result.deletedCount ?? 0) > 0;
  }
}
