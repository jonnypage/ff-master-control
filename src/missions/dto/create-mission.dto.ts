import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from 'class-validator';

@InputType()
export class CreateMissionDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Int, { defaultValue: 0 })
  @IsNumber()
  creditsAwarded: number;

  @Field({ defaultValue: false })
  @IsBoolean()
  awardsCrystal: boolean;

  @Field({ defaultValue: false })
  @IsBoolean()
  isFinalChallenge: boolean;

  @Field(() => Int, { defaultValue: 0 })
  @IsNumber()
  missionDuration: number;
}

