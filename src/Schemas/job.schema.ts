import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UpworkJobDocument = HydratedDocument<upworkjob>;
@Schema({ timestamps: true })
export class upworkjob {
  @Prop()
  guid: string;

  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  budget: number;

  @Prop()
  country: string;

  @Prop({ type: Date })
  publishedAt: { type: Date };

  @Prop()
  skills: [string];

  @Prop()
  categories: [string];

  @Prop({ type: Object })
  raw: { type: object };
}

export const JobSchema = SchemaFactory.createForClass(upworkjob);
