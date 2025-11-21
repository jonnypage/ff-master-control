import { Injectable, NotFoundException } from '@nestjs/common';
import { TeamsService } from '../teams/teams.service';

@Injectable()
export class StoreService {
  constructor(private teamsService: TeamsService) {}

  async adjustCredits(nfcCardId: string, amount: number) {
    const team = await this.teamsService.findByNfcCardId(nfcCardId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return this.teamsService.addCredits(team._id.toString(), amount);
  }

  async addCredits(nfcCardId: string, amount: number) {
    return this.adjustCredits(nfcCardId, Math.abs(amount));
  }

  async removeCredits(nfcCardId: string, amount: number) {
    return this.adjustCredits(nfcCardId, -Math.abs(amount));
  }
}

