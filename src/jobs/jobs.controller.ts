import { Controller, Get, Param, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { PaginationQueryDto } from '../common/dto/pagiation-query.dto/pagination-query.dto';
import { FilterDataDto } from '../common/dto/filter-data.dto/filter-data.dto';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobService: JobsService) {}

  @Get('get-all')
  getAllJob(@Query() paginationQueryDto: PaginationQueryDto) {
    return this.jobService.getAllJobs(paginationQueryDto);
  }

  @Get('get-by-id/:jobId')
  getById(@Param('jobId') jobId) {
    return this.jobService.getById(jobId);
  }

  @Get('all-categories')
  getAllCategories() {
    return this.jobService.getAllCategories();
  }

  @Get('most-job-posted-by-day')
  getMostJobPostedByDay() {
    return this.jobService.getMostJobPostedByDay();
  }

  @Get('filter-jobs')
  getJobs(@Query() filterDataDto: FilterDataDto) {
    if (Object.keys(filterDataDto).length) {
      return this.jobService.getJobs(filterDataDto);
    } else {
      return null;
    }
  }

  @Get('get-category-percentage')
  getJobCategoryPercentage() {
    return this.jobService.getJobCategoryPercentage();
  }
  @Get('skills-in-demand')
  getSkillsInDemand(@Query('date') date: Date) {
    return this.jobService.getSkillsInDemand(date);
  }

  @Get('skills-over-time-period')
  getSkillsOverTimePeriod(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return this.jobService.getSkillsOverTimePeriod(startDate, endDate);
  }
}
