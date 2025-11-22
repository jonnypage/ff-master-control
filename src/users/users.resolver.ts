import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../auth/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createUser(@Args('input') createUserDto: CreateUserDto): Promise<User> {
    const user = await this.usersService.create(createUserDto);
    const { password: _, ...result } = user.toObject();
    return result as User;
  }

  @Query(() => [User])
  @UseGuards(JwtAuthGuard)
  async users(): Promise<User[]> {
    const users = await this.usersService.findAll();
    return users.map((user) => {
      const { password: _, ...result } = user.toObject();
      return result as User;
    });
  }

  @Query(() => User, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: User): Promise<User> {
    const { password: _, ...result } = user;
    return result as User;
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.usersService.update(id, updateUserDto);
    const { password: _, ...result } = user.toObject();
    return result as User;
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteUser(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<boolean> {
    await this.usersService.remove(id, currentUser._id.toString());
    return true;
  }
}

