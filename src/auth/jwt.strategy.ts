import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { TeamsService } from '../teams/teams.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private teamsService: TeamsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret',
    });
  }

  async validate(payload: any) {
    // Back-compat: older tokens won't have actorType; treat them as user tokens.
    const actorType = payload.actorType ?? 'user';

    if (actorType === 'team') {
      const team = await this.teamsService.findOne(payload.sub);
      if (!team) throw new UnauthorizedException();
      return { actorType: 'team', ...team.toObject() };
    }

    const user = await this.usersService.findOne(payload.sub);
    if (!user) throw new UnauthorizedException();
    const { password: _, ...result } = user.toObject();
    return { actorType: 'user', ...result };
  }
}

