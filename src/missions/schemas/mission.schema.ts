import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';

export type MissionDocument = Mission & Document;

@Schema({ timestamps: true })
@ObjectType()
export class Mission {
  @Field(() => ID)
  _id: ObjectId;

  @Prop({ required: true })
  @Field()
  name: string;

  @Prop()
  @Field({ nullable: true })
  description?: string;

  @Prop({ required: true, default: 0 })
  @Field()
  creditsAwarded: number;

  @Prop({ default: false })
  @Field()
  awardsCrystal: boolean;

  @Prop({ default: false })
  @Field()
  isFinalChallenge: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

export const MissionSchema = SchemaFactory.createForClass(Mission);

