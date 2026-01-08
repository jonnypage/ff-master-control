import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';

@InputType()
export class TeamImageInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  url?: string;
}

@InputType()
export class CreateTeamDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsString()
  @Matches(/^\d{4}$/, { message: 'PIN must be exactly 4 digits' })
  pin: string;

  @Field(() => TeamImageInput, { nullable: true })
  @IsOptional()
  image?: TeamImageInput;
}

