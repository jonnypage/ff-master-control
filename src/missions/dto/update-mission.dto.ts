import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

@InputType()
export class UpdateMissionDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  creditsAwarded?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  awardsCrystal?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isFinalChallenge?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  missionDuration?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  missionNumber?: number;
}

