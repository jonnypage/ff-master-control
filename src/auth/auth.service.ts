import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { TeamsService } from '../teams/teams.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private teamsService: TeamsService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...result } = user.toObject();
    return result;
  }

  async login(user: any) {
    const payload = { actorType: 'user', username: user.username, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async validateTeam(teamGuid: string, pin: string): Promise<any> {
    const team = await this.teamsService.findByTeamGuidForAuth(teamGuid);
    if (!team) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPinValid = await bcrypt.compare(pin, team.pinHash);
    if (!isPinValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { pinHash: _pinHash, ...result } = team.toObject();
    return result;
  }

  async teamLogin(team: any) {
    const payload = { actorType: 'team', sub: team._id };
    return {
      access_token: this.jwtService.sign(payload),
      team,
    };
  }
}

