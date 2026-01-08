import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthPayload } from './dto/auth-payload.dto';
import { LoginInput } from './dto/login-input.dto';
import { TeamAuthPayload } from './dto/team-auth-payload.dto';
import { TeamLoginInput } from './dto/team-login-input.dto';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthPayload)
  async login(@Args('input') loginInput: LoginInput): Promise<AuthPayload> {
    const user = await this.authService.validateUser(
      loginInput.username,
      loginInput.password,
    );
    return this.authService.login(user);
  }

  @Mutation(() => TeamAuthPayload)
  async teamLogin(
    @Args('input') teamLoginInput: TeamLoginInput,
  ): Promise<TeamAuthPayload> {
    const team = await this.authService.validateTeam(
      teamLoginInput.teamGuid,
      teamLoginInput.pin,
    );
    return this.authService.teamLogin(team);
  }
}

