import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { Team } from './schemas/team.schema';
import { LeaderboardTeam } from './schemas/leaderboard-team.schema';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../auth/roles.decorator';

@Resolver(() => Team)
export class TeamsResolver {
  constructor(private teamsService: TeamsService) {}

  @Query(() => Team, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async team(@Args('nfcCardId') nfcCardId: string): Promise<Team | null> {
    return this.teamsService.findByNfcCardId(nfcCardId);
  }

  @Query(() => Team, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async searchTeam(
    @Args('searchTerm') searchTerm: string,
  ): Promise<Team | null> {
    return this.teamsService.findByNameOrNfcCardId(searchTerm);
  }

  @Query(() => [Team])
  @UseGuards(JwtAuthGuard)
  async teams(): Promise<Team[]> {
    return this.teamsService.findAll();
  }

  @Query(() => [LeaderboardTeam])
  async leaderboardTeams(): Promise<LeaderboardTeam[]> {
    return this.teamsService.findLeaderboard();
  }

  @Query(() => Team, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async teamById(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Team | null> {
    return this.teamsService.findOne(id);
  }

  @Mutation(() => Team)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createTeam(@Args('input') createTeamDto: CreateTeamDto): Promise<Team> {
    return this.teamsService.create(createTeamDto);
  }

  @Mutation(() => Team)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateTeam(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') updateTeamDto: UpdateTeamDto,
  ): Promise<Team> {
    return this.teamsService.update(id, updateTeamDto);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteAllTeams(): Promise<boolean> {
    await this.teamsService.deleteAll();
    return true;
  }
}
