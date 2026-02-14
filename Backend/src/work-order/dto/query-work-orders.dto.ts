import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { WorkOrderPriority } from '../../common/enums/work-order-priority.enum';
import { WorkOrderStatus } from '../../common/enums/work-order-status.enum';

export class QueryWorkOrdersDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  @IsOptional()
  @IsEnum(WorkOrderStatus)
  status?: WorkOrderStatus;

  @IsOptional()
  @IsEnum(WorkOrderPriority)
  priority?: WorkOrderPriority;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  assignedToUserId?: number;

  @IsOptional()
  createdByUserId?: number;

  @IsOptional()
  @IsDateString()
  fromDueDate?: string;

  @IsOptional()
  @IsDateString()
  toDueDate?: string;
}

