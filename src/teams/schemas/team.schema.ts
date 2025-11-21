import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Types } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';

export type TeamDocument = Team & Document;

@Schema({ timestamps: true })
@ObjectType()
export class Team {
  @Field(() => ID)
  _id: ObjectId;

  @Prop({ required: true, unique: true })
  @Field()
  nfcCardId: string;

  @Prop({ required: true })
  @Field()
  name: string;

  @Prop({ default: 0 })
  @Field()
  credits: number;

  @Prop({ type: [Types.ObjectId], ref: 'Mission', default: [] })
  @Field(() => [ID])
  completedMissionIds: ObjectId[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

export const TeamSchema = SchemaFactory.createForClass(Team);

