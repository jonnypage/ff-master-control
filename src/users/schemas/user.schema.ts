import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { UserRole } from '../../auth/roles.decorator';

export type UserDocument = User & Document;

registerEnumType(UserRole, {
  name: 'UserRole',
});

@Schema({ timestamps: true })
@ObjectType()
export class User {
  @Field(() => ID)
  _id: ObjectId;

  @Prop({ required: true, unique: true })
  @Field()
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: UserRole })
  @Field(() => UserRole)
  role: UserRole;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

