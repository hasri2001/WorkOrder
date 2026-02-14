import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkOrderService } from './service/work-order.service';
import { WorkOrderController } from './controller/work-order.controller';
import { WorkOrder } from './entity/work-order.entity';
import { WorkOrderLog } from '../audit/entity/work-order-log.entity';
import { User } from '../users/entity/user.entity';
import { StatusWorkflowService } from './rules/work-order-status.rules';

@Module({
  imports: [TypeOrmModule.forFeature([WorkOrder, WorkOrderLog, User])],
  controllers: [WorkOrderController],
  providers: [WorkOrderService, StatusWorkflowService],
})
export class WorkOrderModule {}

