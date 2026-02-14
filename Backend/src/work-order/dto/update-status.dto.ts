import { IsEnum } from 'class-validator';
import { WorkOrderStatus } from '../../common/enums/work-order-status.enum';

export class UpdateStatusDto {
  @IsEnum(WorkOrderStatus)
  newStatus: WorkOrderStatus;
}

