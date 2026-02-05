import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Types } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';

export type TeamDocument = Team & Document;

@ObjectType()
export class TeamImage {
  @Field({ nullable: true })
  url?: string;
}

@Schema({ timestamps: true })
@ObjectType()
export class Team {
  @Field(() => ID)
  _id: ObjectId;

  @Prop({ required: true, unique: true, index: true })
  @Field()
  teamGuid: string;

  @Prop({ required: true, unique: true, index: true })
  @Field()
  teamCode: string;

  @Prop({ required: true })
  @Field()
  name: string;

  @Prop({ type: Object, default: null })
  @Field(() => TeamImage, { nullable: true })
  image?: TeamImage | null;

  @Prop({ default: '#7c3aed' })
  @Field()
  bannerColor: string;

  @Prop({ default: 'Shield' })
  @Field()
  bannerIcon: string;

  // Plaintext 4-digit PIN (event-only teams). Expose only to the authenticated team session.
  // Excluded by default from Mongo queries to avoid accidental exposure.
  @Prop({ required: true, select: false })
  @Field({ nullable: true })
  pin?: string;

  // Hashed 4-digit PIN. Never expose via GraphQL.
  @Prop({ required: true, select: false })
  pinHash: string;

  @Prop({ default: 0 })
  @Field()
  credits: number;

  @Prop({ default: 0 })
  @Field()
  crystals: number;

  @Prop({ type: [Types.ObjectId], ref: 'Mission', default: [] })
  @Field(() => [ID])
  completedMissionIds: ObjectId[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

export const TeamSchema = SchemaFactory.createForClass(Team);

