import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';

@ObjectType()
export class LeaderboardTeam {
  @Field(() => ID)
  _id: ObjectId;

  @Field()
  name: string;

  @Field(() => [ID])
  completedMissionIds: ObjectId[];
}
