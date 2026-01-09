import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsHexColor } from 'class-validator';
import { TeamImageInput } from './create-team.dto';

@InputType()
export class UpdateTeamDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => TeamImageInput, { nullable: true })
  @IsOptional()
  image?: TeamImageInput;

  @Field({ nullable: true })
  @IsOptional()
  @IsHexColor()
  bannerColor?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  bannerIcon?: string;
}

