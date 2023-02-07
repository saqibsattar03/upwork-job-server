import { IsOptional } from 'class-validator';

export class FilterDataDto {
  @IsOptional()
  country: string;
  @IsOptional()
  category: string;
  @IsOptional()
  budget: number;
  // @IsOptional()
  // priceRange: number;
}
