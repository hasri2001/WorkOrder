import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { WorkOrderPriority } from '../../common/enums/work-order-priority.enum';

export class CreateWorkOrderDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  description: string;

  @IsEnum(WorkOrderPriority)
  priority: WorkOrderPriority;

  @IsOptional()
  assignedToUserId?: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

