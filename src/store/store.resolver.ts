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
    @Args('nfcCardId') nfcCardId: string,
    @Args('amount', { type: () => Int }) amount: number,
  ): Promise<Team> {
    return this.storeService.adjustCredits(nfcCardId, amount);
  }

  @Mutation(() => Team)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STORE, UserRole.ADMIN)
  async addCredits(
    @Args('nfcCardId') nfcCardId: string,
    @Args('amount', { type: () => Int }) amount: number,
  ): Promise<Team> {
    return this.storeService.addCredits(nfcCardId, amount);
  }

  @Mutation(() => Team)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STORE, UserRole.ADMIN)
  async removeCredits(
    @Args('nfcCardId') nfcCardId: string,
    @Args('amount', { type: () => Int }) amount: number,
  ): Promise<Team> {
    return this.storeService.removeCredits(nfcCardId, amount);
  }
}
