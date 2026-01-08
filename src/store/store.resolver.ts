import { Resolver, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { StoreService } from './store.service';
import { Team } from '../teams/schemas/team.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../auth/roles.decorator';

@Resolver()
export class StoreResolver {
  constructor(private storeService: StoreService) {}

  @Mutation(() => Team)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STORE, UserRole.ADMIN)
  async adjustCredits(
    @Args('teamId') teamId: string,
    @Args('amount', { type: () => Int }) amount: number,
  ): Promise<Team> {
    return this.storeService.adjustCredits(teamId, amount);
  }

  @Mutation(() => Team)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STORE, UserRole.ADMIN)
  async addCredits(
    @Args('teamId') teamId: string,
    @Args('amount', { type: () => Int }) amount: number,
  ): Promise<Team> {
    return this.storeService.addCredits(teamId, amount);
  }

  @Mutation(() => Team)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STORE, UserRole.ADMIN)
  async removeCredits(
    @Args('teamId') teamId: string,
    @Args('amount', { type: () => Int }) amount: number,
  ): Promise<Team> {
    return this.storeService.removeCredits(teamId, amount);
  }
}
