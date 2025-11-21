import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { Team } from './schemas/team.schema';
import { CreateTeamDto } from './dto/create-team.dto';
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

  @Query(() => [Team])
  @UseGuards(JwtAuthGuard)
  async teams(): Promise<Team[]> {
    return this.teamsService.findAll();
  }

  @Mutation(() => Team)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createTeam(@Args('input') createTeamDto: CreateTeamDto): Promise<Team> {
    return this.teamsService.create(createTeamDto);
  }
}

