import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';

export type AppConfigDocument = AppConfig & Document;

@Schema({ collection: 'appconfig' })
@ObjectType()
export class AppConfig {
  @Field(() => ID)
  _id: string;

  @Prop({ required: true, default: 0 })
  @Field()
  requiredMissionsForFinal: number;
}

export const AppConfigSchema = SchemaFactory.createForClass(AppConfig);

