import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { Team, TeamDocument } from './schemas/team.schema';
import { LeaderboardTeam } from './schemas/leaderboard-team.schema';
import { CreateTeamDto } from './dto/create-team.dto';

@Injectable()
export class TeamsService {
  constructor(@InjectModel(Team.name) private teamModel: Model<TeamDocument>) {}

  private async backfillLegacyTeamFields(): Promise<void> {
    // Only backfill teams that truly lack the new fields.
    // Important: pinHash is `select:false`, so never assume `undefined` means missing.
    const legacyTeams = await this.teamModel
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

    if (legacyTeams.length === 0) return;

    const defaultPinHash = await bcrypt.hash('0000', 10);

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
      }
    }
  }

  async create(createTeamDto: CreateTeamDto): Promise<TeamDocument> {
    const teamGuid = randomUUID();
    const pinHash = await bcrypt.hash(createTeamDto.pin, 10);

    const createdTeam = new this.teamModel({
      name: createTeamDto.name,
      teamGuid,
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

  async findByTeamGuidForAuth(teamGuid: string): Promise<TeamDocument | null> {
    // pinHash is excluded by default (`select: false`), so opt-in here.
    return this.teamModel.findOne({ teamGuid }).select('+pinHash').exec();
  }

  async findOne(id: string): Promise<TeamDocument | null> {
    // Ensure legacy teams become schema-compatible before returning to GraphQL.
    await this.backfillLegacyTeamFields();
    return this.teamModel.findById(id).exec();
  }

  async findAll(): Promise<TeamDocument[]> {
    // Ensure legacy teams become schema-compatible before returning to GraphQL.
    await this.backfillLegacyTeamFields();
    return this.teamModel.find().exec();
  }

  async findLeaderboard(): Promise<LeaderboardTeam[]> {
    // Return only the minimal fields required for the public leaderboard
    return this.teamModel.find({}, { name: 1, completedMissionIds: 1 }).lean();
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

  async addCompletedMission(
    teamId: string,
    missionId: string,
  ): Promise<TeamDocument> {
    const team = await this.teamModel.findById(teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (!team.completedMissionIds.includes(missionId as any)) {
      team.completedMissionIds.push(missionId as any);
      return team.save();
    }

    return team;
  }

  async removeCompletedMission(
    teamId: string,
    missionId: string,
  ): Promise<TeamDocument> {
    const team = await this.teamModel.findById(teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    team.completedMissionIds = team.completedMissionIds.filter(
      (id) => id.toString() !== missionId.toString(),
    );
    return team.save();
  }

  async hasCompletedMission(
    teamId: string,
    missionId: string,
  ): Promise<boolean> {
    const team = await this.teamModel.findById(teamId);
    if (!team) {
      return false;
    }

    return team.completedMissionIds.some(
      (id) => id.toString() === missionId.toString(),
    );
  }

  async findByNameOrTeamGuid(
    searchTerm: string,
  ): Promise<TeamDocument | null> {
    // Try team GUID first (exact match)
    const byTeamGuid = await this.teamModel.findOne({ teamGuid: searchTerm }).exec();
    if (byTeamGuid) return byTeamGuid;

    // Then try team name (partial match, case-insensitive)
    // This will match if the search term appears anywhere in the team name
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
}
