import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobsModule } from './jobs/jobs.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    JobsModule,
    MongooseModule.forRoot(
      'mongodb://useradmin:useradminpassword@api-acadletics.postredi.com/upwork-jobs-data?authSource=admin&retryWrites=true&w=majority',
    ),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
