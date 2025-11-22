import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MissionsService } from './missions.service';
import { Mission } from './schemas/mission.schema';
import { MissionCompletion } from './schemas/mission-completion.schema';
import { CreateMissionDto } from './dto/create-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../auth/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/schemas/user.schema';

@Resolver(() => Mission)
export class MissionsResolver {
  constructor(private missionsService: MissionsService) {}

  @Query(() => [Mission])
  @UseGuards(JwtAuthGuard)
  async missions(): Promise<Mission[]> {
    return this.missionsService.findAll();
  }

  @Query(() => Mission, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async mission(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Mission | null> {
    return this.missionsService.findOne(id);
  }

  @Query(() => [MissionCompletion])
  @UseGuards(JwtAuthGuard)
  async missionCompletions(
    @Args('teamId', { type: () => ID, nullable: true }) teamId?: string,
  ): Promise<MissionCompletion[]> {
    return this.missionsService.findCompletions(teamId);
  }

  @Mutation(() => MissionCompletion)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MISSION_LEADER, UserRole.ADMIN)
  async completeMission(
    @Args('nfcCardId') nfcCardId: string,
    @Args('missionId', { type: () => ID }) missionId: string,
    @CurrentUser() user: User,
  ): Promise<MissionCompletion> {
    return this.missionsService.completeMission(
      nfcCardId,
      missionId,
      user._id.toString(),
      false,
    );
  }

  @Mutation(() => MissionCompletion)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async overrideMissionCompletion(
    @Args('teamId', { type: () => ID }) teamId: string,
    @Args('missionId', { type: () => ID }) missionId: string,
    @CurrentUser() user: User,
  ): Promise<MissionCompletion> {
    return this.missionsService.overrideMissionCompletion(
      teamId,
      missionId,
      user._id.toString(),
    );
  }

  @Mutation(() => Mission)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createMission(
    @Args('input') createMissionDto: CreateMissionDto,
  ): Promise<Mission> {
    return this.missionsService.create(createMissionDto);
  }

  @Mutation(() => Mission)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateMission(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') updateMissionDto: UpdateMissionDto,
  ): Promise<Mission> {
    return this.missionsService.update(id, updateMissionDto);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async removeMissionCompletion(
    @Args('teamId', { type: () => ID }) teamId: string,
    @Args('missionId', { type: () => ID }) missionId: string,
  ): Promise<boolean> {
    await this.missionsService.removeMissionCompletion(teamId, missionId);
    return true;
  }
}

