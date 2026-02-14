import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkOrderLog } from '../entity/work-order-log.entity';

@Injectable()
export class WorkOrderLogRepository {
  constructor(
    @InjectRepository(WorkOrderLog)
    private readonly repo: Repository<WorkOrderLog>,
  ) {}

  async findByWorkOrderId(workOrderId: number): Promise<WorkOrderLog[]> {
    return this.repo.find({
      where: { workOrder: { id: workOrderId } },
      relations: ['performedBy'],
      order: { timestamp: 'DESC' },
    });
  }
}
