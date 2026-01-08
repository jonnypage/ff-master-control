import { Injectable } from '@nestjs/common';
import { TeamsService } from '../teams/teams.service';

@Injectable()
export class StoreService {
  constructor(private teamsService: TeamsService) {}

  async adjustCredits(teamId: string, amount: number) {
    return this.teamsService.addCredits(teamId, amount);
  }

  async addCredits(teamId: string, amount: number) {
    return this.adjustCredits(teamId, Math.abs(amount));
  }

  async removeCredits(teamId: string, amount: number) {
    return this.adjustCredits(teamId, -Math.abs(amount));
  }
}

