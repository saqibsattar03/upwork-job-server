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
  getMostJobPostedOverTimePeriod(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @Query('categories') categories: [],
  ) {
    return this.jobService.getMostJobPostedOverTimePeriod(
      startDate,
      endDate,
      categories,
    );
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
  getJobCategoryPercentage(
    @Query('categories') categories: [],
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return this.jobService.getJobCategoryPercentage(
      categories,
      startDate,
      endDate,
    );
  }
  @Get('skills-in-demand')
  getSkillsInDemand(@Query('date') date: Date) {
    return this.jobService.getSkillsInDemand(date);
  }

  @Get('all-skills')
  getAllSkills() {
    return this.jobService.getAllSkills();
  }
  @Get('skills-over-time-period')
  getSkillsOverTimePeriod(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @Query('skills') skills: [],
  ) {
    return this.jobService.getSkillsOverTimePeriod(skills, startDate, endDate);
  }
}
