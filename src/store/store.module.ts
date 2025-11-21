import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreResolver } from './store.resolver';
import { TeamsModule } from '../teams/teams.module';

@Module({
  imports: [TeamsModule],
  providers: [StoreService, StoreResolver],
})
export class StoreModule {}

