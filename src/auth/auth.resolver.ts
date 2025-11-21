import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthPayload } from './dto/auth-payload.dto';
import { LoginInput } from './dto/login-input.dto';

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
}

