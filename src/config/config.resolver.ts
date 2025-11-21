import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ConfigService } from './config.service';
import { AppConfig } from './schemas/app-config.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../auth/roles.decorator';

@Resolver(() => AppConfig)
export class ConfigResolver {
  constructor(private configService: ConfigService) {}

  @Query(() => AppConfig)
  @UseGuards(JwtAuthGuard)
  async config(): Promise<AppConfig> {
    return this.configService.getConfig();
  }

  @Mutation(() => AppConfig)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateConfig(
    @Args('requiredMissionsForFinal', { type: () => Int })
    requiredMissionsForFinal: number,
  ): Promise<AppConfig> {
    return this.configService.updateRequiredMissionsForFinal(
      requiredMissionsForFinal,
    );
  }
}

