import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class CreateTeamDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  nfcCardId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;
}

