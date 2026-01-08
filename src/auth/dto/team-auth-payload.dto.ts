import { ObjectType, Field } from '@nestjs/graphql';
import { Team } from '../../teams/schemas/team.schema';

@ObjectType()
export class TeamAuthPayload {
  @Field()
  access_token: string;

  @Field(() => Team)
  team: Team;
}

