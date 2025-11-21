import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Types } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Team } from '../../teams/schemas/team.schema';
import { Mission } from './mission.schema';
import { User } from '../../users/schemas/user.schema';

export type MissionCompletionDocument = MissionCompletion & Document;

@Schema({ timestamps: true })
@ObjectType()
export class MissionCompletion {
  @Field(() => ID)
  _id: ObjectId;

  @Prop({ type: Types.ObjectId, ref: Team.name, required: true })
  @Field(() => ID)
  teamId: ObjectId;

  @Prop({ type: Types.ObjectId, ref: Mission.name, required: true })
  @Field(() => ID)
  missionId: ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  @Field(() => ID)
  completedBy: ObjectId;

  @Prop({ default: Date.now })
  @Field()
  completedAt: Date;

  @Prop({ default: false })
  @Field()
  isManualOverride: boolean;
}

export const MissionCompletionSchema =
  SchemaFactory.createForClass(MissionCompletion);

