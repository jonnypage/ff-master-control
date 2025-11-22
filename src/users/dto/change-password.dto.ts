import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

@InputType()
export class ChangePasswordDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;

  @Field({ nullable: true })
  @IsString()
  @IsNotEmpty()
  oldPassword?: string; // Required for users changing their own password, optional for admins
}

