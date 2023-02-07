import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { MongooseModule } from '@nestjs/mongoose';
import { JobSchema, upworkjob } from '../Schemas/job.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: upworkjob.name, schema: JobSchema }]),
  ],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
