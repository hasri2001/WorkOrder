import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkOrderLog } from './entity/work-order-log.entity';
import { WorkOrderLogRepository } from './repository/work-order-log.repository';
import { WorkOrderLogService } from './service/work-order-log.service';
import { WorkOrderLogController } from './controller/work-order-log.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WorkOrderLog])],
  controllers: [WorkOrderLogController],
  providers: [WorkOrderLogRepository, WorkOrderLogService],
  exports: [WorkOrderLogService],
})
export class AuditModule {}
