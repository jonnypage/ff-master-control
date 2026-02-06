import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { Team, TeamDocument } from './schemas/team.schema';
import { LeaderboardTeam } from './schemas/leaderboard-team.schema';
import { CreateTeamDto } from './dto/create-team.dto';

@Injectable()
export class TeamsService {
  constructor(@InjectModel(Team.name) private teamModel: Model<TeamDocument>) {}

  private deriveTeamCode(teamGuid: string): string {
    // Use last 8 hex chars of UUID (strip hyphens), uppercase for readability.
    const hex = String(teamGuid).replace(/-/g, '').toUpperCase();
    return hex.slice(-8);
  }

  private async backfillLegacyTeamFields(): Promise<void> {
    // Only backfill teams that truly lack the new fields.
    // Important: pinHash is `select:false`, so never assume `undefined` means missing.
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
        // If we have a plaintext pin, prefer hashing that; otherwise fall back.
        team.pinHash = await bcrypt.hash(team.pin ?? defaultPin, 10);
        changed = true;
      }

      if (changed) {
        await team.save();
      }
    }

    // Secondary backfill: Migrate completedMissionIds -> completedMissions
    // We do this separately or as part of the loop. Let's do a targeted query.
    const teamsWithLegacyMissions = await this.teamModel
      .find({
        completedMissionIds: { $exists: true, $not: { $size: 0 } },
        completedMissions: { $size: 0 },
      })
      .exec();

    for (const team of teamsWithLegacyMissions) {
      if (team.completedMissionIds && team.completedMissionIds.length > 0) {
        team.completedMissions = team.completedMissionIds.map((missionId) => ({
          missionId: missionId,
          completedAt: new Date(), // Approximate
          creditsReceived: 0, // Unknown, will fallback to current value on reversal
          crystalsReceived: 0,
        }));
        // Clean up legacy field? Maybe keep for safety until confirmed.
        // team.completedMissionIds = [];
        await team.save();
      }
    }
  }

  async create(createTeamDto: CreateTeamDto): Promise<TeamDocument> {
    let teamGuid = randomUUID();
    let teamCode = this.deriveTeamCode(teamGuid);

    // Ensure teamCode uniqueness (rare collisions, but handle safely).
    // If collision occurs, regenerate GUID until unique.
    // Note: for an annual event, this is more than sufficient.
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
    // pinHash is excluded by default (`select: false`), so opt-in here.
    return this.teamModel.findOne({ teamCode }).select('+pinHash').exec();
  }

  async findOne(id: string): Promise<TeamDocument | null> {
    // Ensure legacy teams become schema-compatible before returning to GraphQL.
    await this.backfillLegacyTeamFields();
    const team = await this.teamModel.findById(id).exec();
    if (team && !team.completedMissions) {
      team.completedMissions = [];
    }
    return team;
  }

  async findOneForTeamSession(id: string): Promise<TeamDocument | null> {
    // Ensure legacy teams become schema-compatible before returning to GraphQL.
    await this.backfillLegacyTeamFields();
    const team = await this.teamModel.findById(id).select('+pin').exec();
    if (team && !team.completedMissions) {
      team.completedMissions = [];
    }
    return team;
  }

  async findAll(): Promise<TeamDocument[]> {
    // Ensure legacy teams become schema-compatible before returning to GraphQL.
    await this.backfillLegacyTeamFields();
    const teams = await this.teamModel.find().exec();
    return teams.map(team => {
        if (team && !team.completedMissions) {
            team.completedMissions = [];
        }
        return team;
    });
  }

  async findLeaderboard(): Promise<LeaderboardTeam[]> {
    // Return only the minimal fields required for the public leaderboard
    // We must ensure completedMissions is returned even if the backfill hasn't run fully or if it's empty
    const teams = await this.teamModel
      .find(
        {},
        {
          name: 1,
          completedMissions: 1, // Ensure this field is projected
          completedMissionIds: 1, // Keep this for now just in case
          bannerColor: 1,
          bannerIcon: 1,
        },
      )
      .lean()
      .exec();

    // Map to ensure completedMissions is never null/undefined
    return teams.map((team) => ({
      ...team,
      completedMissions: team.completedMissions || [],
      // If completedMissions is empty but completedMissionIds exists, we could map it on the fly,
      // but ideally the backfill handles this. For now, preventing the crash is priority.
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

  async addCompletedMission(
    teamId: string,
    missionId: string,
    creditsReceived: number,
    crystalsReceived: number = 0,
  ): Promise<TeamDocument> {
    const team = await this.teamModel.findById(teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Ensure array exists
    if (!team.completedMissions) {
      team.completedMissions = [];
    }

    // Check if already completed to avoid duplicates
    const exists = team.completedMissions.some(
      (cm) => cm.missionId.toString() === missionId.toString(),
    );

    if (!exists) {
      team.completedMissions.push({
        missionId: new Types.ObjectId(missionId) as any,
        completedAt: new Date(),
        creditsReceived,
        crystalsReceived,
      });
      return team.save();
    }

    return team;
  }

  async removeCompletedMission(
    teamId: string,
    missionId: string,
  ): Promise<{ creditsReceived: number; crystalsReceived: number } | null> {
    const team = await this.teamModel.findById(teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (!team.completedMissions) {
      return null;
    }

    const index = team.completedMissions.findIndex(
      (cm) => cm.missionId.toString() === missionId.toString(),
    );

    if (index === -1) {
      // Check legacy field just in case
      if (
        team.completedMissionIds &&
        team.completedMissionIds.some((id) => id.toString() === missionId.toString())
      ) {
        team.completedMissionIds = team.completedMissionIds.filter(
          (id) => id.toString() !== missionId.toString(),
        );
        await team.save();
        // Return 0s so caller knows to use current mission values as fallback
        return { creditsReceived: 0, crystalsReceived: 0 };
      }
      return null;
    }

    const removed = team.completedMissions[index];
    team.completedMissions.splice(index, 1);
    await team.save();

    return {
      creditsReceived: removed.creditsReceived,
      crystalsReceived: removed.crystalsReceived || 0,
    };
  }

  async hasCompletedMission(
    teamId: string,
    missionId: string,
  ): Promise<boolean> {
    const team = await this.teamModel.findById(teamId);
    if (!team) {
      return false;
    }

    const inNew = team.completedMissions?.some(
      (cm) => cm.missionId.toString() === missionId.toString(),
    );
    const inOld = team.completedMissionIds?.some(
      (id) => id.toString() === missionId.toString(),
    );

    return !!(inNew || inOld);
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
