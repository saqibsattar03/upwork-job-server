import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { upworkjob, UpworkJobDocument } from '../Schemas/job.schema';
import { PaginationQueryDto } from '../common/dto/pagiation-query.dto/pagination-query.dto';
import { FilterDataDto } from '../common/dto/filter-data.dto/filter-data.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(upworkjob.name)
    private readonly jobModel: Model<UpworkJobDocument>,
  ) {}

  async getAllJobs(
    paginationQueryDto: PaginationQueryDto,
  ): Promise<UpworkJobDocument[]> {
    const { limit, offset } = paginationQueryDto;
    console.log(limit, offset);

    const jobs = this.jobModel
      .find()
      .skip(offset)
      .limit(limit)
      .sort({ _id: 1 })
      .exec();

    // const result = await jobs;
    const jobsCount = await this.jobModel.count();
    console.log(jobsCount);
    return jobs;
  }

  async getById(jobId): Promise<UpworkJobDocument> {
    return this.jobModel.findById({ _id: jobId }).exec();
  }
  async getAllCategories(): Promise<any> {
    const categories = await this.jobModel.distinct('categories');
    return categories;
  }
  async getMostJobPostedOverTimePeriod(
    startDate,
    endDate,
    categories,
  ): Promise<any> {
    if (categories && startDate && endDate) {
      const res = await this.jobModel.aggregate(
        [
          {
            $match: {
              publishedAt: {
                $lt: new Date(startDate),
                $gte: new Date(endDate),
              },
            },
          },

          //*** uncomment the lines below to get the specific job data ***//
          {
            $match: {
              categories: {
                $in: categories,
              },
            },
          },
          {
            $addFields: {
              uniqueHour: {
                $dateToString: {
                  format: '%H',

                  //*** uncomment the line below to get the daily jobs on hourly basis with date ***//
                  // format: '%Y-%m-%d-%H',
                  date: '$publishedAt',
                },
              },
            },
          },
          {
            $group: {
              _id: '$uniqueHour',
              // _id: {
              //   // "year":{"$year":"$date"},
              //   hour: { $hour: '$publishedAt' },
              // },

              //*** below lines are to get data for specific minutes range like 60 minutes ***///

              // first: { $first: '$$ROOT' },
              // _id: {
              //   // year: { $year: '$publishedAt' },
              //   // dayOfYear: { $dayOfYear: '$publishedAt' },
              //   // hour: { $hour: '$publishedAt' },
              //   // interval: [
              //   //   {
              //   //     $minute: '$publishedAt',
              //   //   },
              //   //   { $mod: [{ $minute: '$publishedAt' }, 60] },
              //   // ],
              //   $dateToString: {
              //     format: '%Y-%m-%d-%H',
              //     date: '$publishedAt',
              //   },
              //   // hour: '$hour',
              // },

              //*** To Get Documents also, uncomment line below *** //

              //totalJobPosted: { $push: '$$ROOT' },
              count: { $sum: 1 },
            },
          },

          //*** below group is to get data on hourly basis for time period provided, Time should be provided in match section ***//

          // {
          //   $group: {
          //     _id: {
          //       hour: '$_id.hour',
          //     },
          //
          //     //dailyCount: { $sum: '$count' },
          //     hourlyData: {
          //       $push: { hour: '$_id.hour', count: '$count' },
          //     },
          //   },
          // },
          {
            $sort: { _id: -1 },
          },
        ],
        { allowDiskUse: true },
      );
      // .limit(1000);

      return res;
    } else if (categories && !startDate && !endDate) {
      const res = await this.jobModel.aggregate(
        [
          //*** uncomment the lines below to get the specific job data ***//
          {
            $match: {
              categories: {
                $in: categories,
              },
            },
          },
          {
            $addFields: {
              uniqueHour: {
                $dateToString: {
                  format: '%H',

                  //*** uncomment the line below to get the daily jobs on hourly basis with date ***//
                  // format: '%Y-%m-%d-%H',
                  date: '$publishedAt',
                },
              },
            },
          },
          {
            $addFields: {
              categories: categories,
            },
          },
          {
            $group: {
              _id: '$uniqueHour',

              //*** below lines are to get data for specific minutes range like 60 minutes ***///

              // first: { $first: '$$ROOT' },
              // _id: {
              //   // year: { $year: '$publishedAt' },
              //   // dayOfYear: { $dayOfYear: '$publishedAt' },
              //   // hour: { $hour: '$publishedAt' },
              //   // interval: [
              //   //   {
              //   //     $minute: '$publishedAt',
              //   //   },
              //   //   { $mod: [{ $minute: '$publishedAt' }, 60] },
              //   // ],
              //   $dateToString: {
              //     format: '%Y-%m-%d-%H',
              //     date: '$publishedAt',
              //   },
              //   // hour: '$hour',
              // },

              //*** To Get Documents also, uncomment line below *** //

              //totalJobPosted: { $push: '$$ROOT' },
              count: { $sum: 1 },
            },
          },
          //*** below group is to get data on hourly basis for time period provided, Time should be provided in match section ***//

          // {
          //   $group: {
          //     _id: {
          //       hour: '$_id.hour',
          //     },
          //
          //     //dailyCount: { $sum: '$count' },
          //     hourlyData: {
          //       $push: { hour: '$_id.hour', count: '$count' },
          //     },
          //   },
          // },
          {
            $sort: { _id: -1 },
          },
        ],

        { allowDiskUse: true },
      );
      // .limit(1000);

      return res;
    }
  }

  async getJobs(filterDataDto: FilterDataDto): Promise<any> {
    const { country, category, budget } = filterDataDto;
    if (country) {
      const basedOnCountry = await this.jobModel
        .find({ country: country })
        .limit(10);
      return basedOnCountry;
    } else if (category) {
      const basedOnCategory = await this.jobModel
        .find({ categories: category })
        .limit(10);
      return basedOnCategory;
    } else if (budget) {
      const basedOnBudget = await this.jobModel
        .find({ budget: budget })
        .limit(10);
      return basedOnBudget;
    } else {
      return 'Query parameter is required to filter data';
    }
  }

  async getJobCategoryPercentage(categories, startDate, endDate): Promise<any> {
    if (categories && !startDate && !endDate) {
      const res = await this.jobModel.aggregate([
        {
          $facet: {
            total: [
              {
                $count: 'count',
              },
            ],
            jobTitle: [
              {
                $match: {
                  categories: {
                    $in: categories,
                  },
                },
              },
              {
                $group: {
                  _id: '$categories',
                  jobCount: {
                    $sum: 1,
                  },
                },
              },
            ],
          },
        },
        {
          $addFields: {
            total: {
              $first: '$total.count',
            },
          },
        },
        {
          $unwind: {
            path: '$jobTitle',
          },
        },
        {
          $addFields: {
            percentageOfTotal: {
              $multiply: [
                {
                  $divide: ['$jobTitle.jobCount', '$total'],
                },
                100,
              ],
            },
          },
        },
        {
          $sort: { _id: -1 },
        },
      ]);
      return res;
    } else if (categories && startDate && endDate) {
      const res = await this.jobModel.aggregate([
        {
          $facet: {
            total: [
              {
                $count: 'count',
              },
            ],
            jobTitle: [
              {
                $match: {
                  publishedAt: {
                    $lt: new Date(startDate),
                    $gte: new Date(endDate),
                  },
                },
              },
              {
                $match: {
                  categories: {
                    $in: categories,
                  },
                },
              },
              {
                $group: {
                  _id: '$categories',
                  jobCount: {
                    $sum: 1,
                  },
                },
              },
            ],
          },
        },
        {
          $addFields: {
            total: {
              $first: '$total.count',
            },
          },
        },
        {
          $unwind: {
            path: '$jobTitle',
          },
        },
        {
          $addFields: {
            percentageOfTotal: {
              $multiply: [
                {
                  $divide: ['$jobTitle.jobCount', '$total'],
                },
                100,
              ],
            },
          },
        },
        {
          $sort: { _id: -1 },
        },
      ]);
      return res;
    }
    // .limit(5000);
    // return res;
  }

  async getJobPostedWeekly(categories, startDate, endDate): Promise<any> {
    if (categories && startDate && endDate) {
      const res = await this.jobModel
        .aggregate([
          {
            $match: {
              publishedAt: {
                $lt: new Date(startDate),
                $gte: new Date(endDate),
              },
            },
          },
          {
            $match: {
              categories: {
                $in: categories,
              },
            },
          },
          {
            $group: {
              _id: { $dayOfWeek: '$publishedAt' },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .limit(10);
      return res;
    } else if (categories && !startDate && !endDate) {
      const res = await this.jobModel.aggregate([
        {
          $match: {
            publishedAt: {
              //*** calculating previous 1 week ***//
              $lt: new Date(),
              $gte: new Date(new Date().setDate(new Date().getDate() - 8)),
            },
          },
        },
        {
          $match: {
            categories: {
              $in: categories,
            },
          },
        },
        {
          $group: {
            _id: { $dayOfWeek: '$publishedAt' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);
      return res;
    }
  }
  async getAllSkills() {
    const skills = await this.jobModel.distinct('skills');
    return skills;
  }
  async getSkillsInDemand(date): Promise<any> {
    if (date) {
      console.log('in date condition ');
      console.log('date = ', date);
      const res = await this.jobModel.aggregate(
        [
          { $unwind: '$skills' },
          {
            // $gt: [
            //   "publishedAt": new Date('2022-12-07T06:46:25.000Z'),
            // ],
            $match: {
              publishedAt: {
                //Replace with date variable to get the exact result

                $gt: new Date('2022-12-07T06:46:25.000Z'),
                // $gt: date,
              },
            },
          },
          {
            $group: {
              _id: '$skills',
              SkillsCount: { $sum: 1 },

              //UniqueCategories: { $addToSet: '$categories' },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ],
        { allowDiskUse: true },
      );
      return res;
    } else {
      const res = await this.jobModel.aggregate(
        [
          { $unwind: '$skills' },
          {
            $group: {
              _id: '$skills',
              SkillsCount: { $sum: 1 },

              //UniqueCategories: { $addToSet: '$categories' },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ],
        { allowDiskUse: true },
      );

      return res;
    }
  }

  async getSkillsOverTimePeriod(skills, startDate, endDate): Promise<any> {
    if (startDate && endDate) {
      const res = await this.jobModel.aggregate(
        [
          { $unwind: '$skills' },
          {
            $match: {
              skills: {
                $in: skills,
              },
            },
          },
          {
            $match: {
              publishedAt: {
                //Replace with date variable to get the exact result

                $lt: new Date(startDate),
                $gt: new Date(endDate),
              },
            },
          },
          {
            $group: {
              _id: '$skills',
              skillsCount: { $sum: 1 },
            },
          },
          {
            $sort: { skillsCount: -1 },
          },
        ],
        { allowDiskUse: true },
      );
      return res;
    } else if (skills && !startDate && !endDate) {
      const res = await this.jobModel.aggregate([
        { $unwind: '$skills' },
        {
          $match: {
            skills: {
              $in: skills,
            },
          },
        },
        {
          $group: {
            _id: '$skills',
            skillsCount: { $sum: 1 },
          },
        },
        {
          $sort: { skillsCount: -1 },
        },
      ]);
      return res;
    } else {
      const res = await this.jobModel
        .aggregate([
          { $unwind: '$skills' },
          {
            $group: {
              _id: '$skills',
              skillsCount: { $sum: 1 },
            },
          },
          {
            $sort: { skillsCount: -1 },
          },
        ])
        .limit(10);
      return res;
    }
  }
}
