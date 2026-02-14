import { Injectable } from '@nestjs/common';
import { WorkOrderLogRepository } from '../repository/work-order-log.repository';

@Injectable()
export class WorkOrderLogService {
  constructor(private readonly workOrderLogRepository: WorkOrderLogRepository) {}

  async getByWorkOrderId(workOrderId: number) {
    return this.workOrderLogRepository.findByWorkOrderId(workOrderId);
  }
}
