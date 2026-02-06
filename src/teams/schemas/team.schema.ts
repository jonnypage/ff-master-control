import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Types } from 'mongoose';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

export type TeamDocument = Team & Document;

// Mission status enum
export enum MissionStatus {
  NOT_STARTED = 'NOT_STARTED',
  INCOMPLETE = 'INCOMPLETE',
  FAILED = 'FAILED',
  COMPLETE = 'COMPLETE',
}

registerEnumType(MissionStatus, {
  name: 'MissionStatus',
  description: 'Status of a mission for a team',
});

@ObjectType()
export class TeamImage {
  @Field({ nullable: true })
  url?: string;
}

@ObjectType()
export class TeamMission {
  @Field(() => ID)
  missionId: ObjectId;

  @Field(() => MissionStatus)
  status: MissionStatus;

  @Field()
  tries: number;

  @Field({ nullable: true })
  startedAt?: Date;

  @Field({ nullable: true })
  completedAt?: Date;

  @Field()
  creditsReceived: number;

  @Field()
  crystalsReceived: number;
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

  // Mission progress tracking
  @Prop({
    type: [
      {
        missionId: { type: Types.ObjectId, ref: 'Mission' },
        status: { type: String, enum: Object.values(MissionStatus), default: MissionStatus.NOT_STARTED },
        tries: { type: Number, default: 0 },
        startedAt: { type: Date },
        completedAt: { type: Date },
        creditsReceived: { type: Number, default: 0 },
        crystalsReceived: { type: Number, default: 0 },
      },
    ],
    default: [],
  })
  @Field(() => [TeamMission])
  missions: TeamMission[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
