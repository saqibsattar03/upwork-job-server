import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { upworkjob, UpworkJobDocument } from '../Schemas/job.schema';
import { PaginationQueryDto } from '../common/dto/pagiation-query.dto/pagination-query.dto';
import { FilterDataDto } from '../common/dto/filter-data.dto/filter-data.dto';
import * as moment from 'moment';

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
    // this.jobModel.collection('upworkjobs').distinct('categories');
    const categories = await this.jobModel.distinct('categories');
    // const categories = await this.jobModel
    //   .find({})
    //   .select('categories')
    //   .limit(10);
    return categories;
  }
  async getMostJobPostedByDay(): Promise<any> {
    const res = await this.jobModel
      .aggregate(
        [
          {
            $match: {
              publishedAt: {
                $gte: new Date('2021-01-01'),
                $lt: new Date('2023-02-03'),
              },
            },
          },
          {
            $addFields: {
              uniqueHour: {
                $dateToString: {
                  format: '%Y-%m-%d-%H',
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

              //*** To Get Documents also uncomment line below*** //

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
      )
      .limit(24);

    return res;
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

  async getJobCategoryPercentage(categories): Promise<any> {
    console.log('categories = ', categories);
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
    // .limit(5000);
    return res;
  }

  // async getJobCategoryPercentageWithParameter(categories): Promise<any> {
  //   console.log('categoreis  =', categories);
  //   const res = await this.jobModel.aggregate([
  //     {
  //       $facet: {
  //         total: [
  //           {
  //             $count: 'count',
  //           },
  //         ],
  //         jobTitle: [
  //           {
  //             $match: {
  //               categories: {
  //                 $in: categories,
  //               },
  //             },
  //           },
  //           {
  //             $group: {
  //               _id: '$categories',
  //               jobCount: {
  //                 $sum: 1,
  //               },
  //             },
  //           },
  //         ],
  //       },
  //     },
  //     {
  //       $addFields: {
  //         total: {
  //           $first: '$total.count',
  //         },
  //       },
  //     },
  //     {
  //       $unwind: {
  //         path: '$jobTitle',
  //       },
  //     },
  //     {
  //       $addFields: {
  //         percentageOfTotal: {
  //           $multiply: [
  //             {
  //               $divide: ['$jobTitle.jobCount', '$total'],
  //             },
  //             100,
  //           ],
  //         },
  //       },
  //     },
  //     {
  //       $sort: { _id: -1 },
  //     },
  //   ]);
  //   // .limit(5000);
  //   return res;
  // }

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
            $sort: { _id: -1 },
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

  async getSkillsOverTimePeriod(startDate, endDate): Promise<any> {
    if (startDate && endDate) {
      console.log('in date condition ');
      //console.log('date = ', date);
      const res = await this.jobModel.aggregate(
        [
          { $unwind: '$skills' },
          {
            $match: {
              publishedAt: {
                //Replace with date variable to get the exact result

                $lt: new Date(startDate),
                $gt: new Date(endDate),
                // $gt: new Date('2022-12-07T06:46:25.000Z'),
                // $lt: new Date('2023-01-07T06:46:25.000Z'),
              },
            },
          },
          {
            $group: {
              _id: '$skills',
              SkillsCount: { $sum: 1 },
            },
          },
          {
            $sort: { _id: -1 },
          },
        ],
        { allowDiskUse: true },
      );
      return res;
    } else {
      const date = new Date();
      console.log('date = ', date);
      const res = await this.jobModel.aggregate(
        [
          { $unwind: '$skills' },
          {
            $match: {
              publishedAt: {
                $lt: new Date(),
                $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
              },
            },
          },
          {
            $group: {
              _id: '$skills',
              SkillsCount: { $sum: 1 },
            },
          },
          {
            $sort: { _id: -1 },
          },
        ],
        { allowDiskUse: true },
      );
      return res;
    }
    // return null;
  }
}
