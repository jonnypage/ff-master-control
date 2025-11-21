import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Team, TeamDocument } from './schemas/team.schema';
import { CreateTeamDto } from './dto/create-team.dto';

@Injectable()
export class TeamsService {
  constructor(@InjectModel(Team.name) private teamModel: Model<TeamDocument>) {}

  async create(createTeamDto: CreateTeamDto): Promise<TeamDocument> {
    const existingTeam = await this.teamModel.findOne({
      nfcCardId: createTeamDto.nfcCardId,
    });

    if (existingTeam) {
      throw new ConflictException('Team with this NFC card ID already exists');
    }

    const createdTeam = new this.teamModel(createTeamDto);
    return createdTeam.save();
  }

  async findByNfcCardId(nfcCardId: string): Promise<TeamDocument | null> {
    return this.teamModel.findOne({ nfcCardId }).exec();
  }

  async findOne(id: string): Promise<TeamDocument | null> {
    return this.teamModel.findById(id).exec();
  }

  async findAll(): Promise<TeamDocument[]> {
    return this.teamModel.find().exec();
  }

  async update(
    id: string,
    updateData: { name?: string; nfcCardId?: string },
  ): Promise<TeamDocument> {
    const team = await this.teamModel.findById(id);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if NFC card ID is being changed and if it's already taken
    if (updateData.nfcCardId && updateData.nfcCardId !== team.nfcCardId) {
      const existingTeam = await this.teamModel.findOne({
        nfcCardId: updateData.nfcCardId,
      });
      if (existingTeam) {
        throw new ConflictException(
          'Team with this NFC card ID already exists',
        );
      }
      team.nfcCardId = updateData.nfcCardId;
    }

    if (updateData.name !== undefined) {
      team.name = updateData.name;
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

  async findByNameOrNfcCardId(
    searchTerm: string,
  ): Promise<TeamDocument | null> {
    // Try NFC card ID first (exact match)
    const byNfcCardId = await this.teamModel
      .findOne({ nfcCardId: searchTerm })
      .exec();
    if (byNfcCardId) {
      return byNfcCardId;
    }

    // Then try team name (partial match, case-insensitive)
    // This will match if the search term appears anywhere in the team name
    const byName = await this.teamModel
      .findOne({
        name: { $regex: new RegExp(searchTerm, 'i') },
      })
      .exec();

    return byName || null;
  }
}
