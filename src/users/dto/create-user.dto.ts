import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { UserRole } from '../../auth/roles.decorator';

@InputType()
export class CreateUserDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  username: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  password: string;

  @Field(() => UserRole)
  @IsEnum(UserRole)
  role: UserRole;
}

