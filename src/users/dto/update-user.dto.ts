import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../../auth/roles.decorator';

@InputType()
export class UpdateUserDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  username?: string;

  @Field(() => UserRole, { nullable: true })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

