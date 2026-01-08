import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, Matches } from 'class-validator';

@InputType()
export class TeamLoginInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  teamGuid: string;

  @Field()
  @IsString()
  @Matches(/^\d{4}$/, { message: 'PIN must be exactly 4 digits' })
  pin: string;
}

