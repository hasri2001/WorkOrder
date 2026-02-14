import { Injectable, BadRequestException } from '@nestjs/common';
import { WorkOrderStatus } from '../../common/enums/work-order-status.enum';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class StatusWorkflowService {
  private readonly transitions: Record<WorkOrderStatus, WorkOrderStatus[]> = {
    [WorkOrderStatus.PENDING]: [
      WorkOrderStatus.APPROVED,
      WorkOrderStatus.REJECTED,
    ],
    [WorkOrderStatus.APPROVED]: [WorkOrderStatus.IN_PROGRESS],
    [WorkOrderStatus.IN_PROGRESS]: [
      WorkOrderStatus.COMPLETED,
      WorkOrderStatus.REJECTED,
    ],
    [WorkOrderStatus.COMPLETED]: [],
    [WorkOrderStatus.REJECTED]: [],
  };

  validateTransition(current: WorkOrderStatus, next: WorkOrderStatus, role: Role) {
    const allowed = this.transitions[current] ?? [];
    if (!allowed.includes(next)) {
      throw new BadRequestException(
        `Invalid status transition from ${current} to ${next}`,
      );
    }

    if (
      current === WorkOrderStatus.PENDING &&
      next === WorkOrderStatus.APPROVED &&
      ![Role.ADMIN, Role.MANAGER].includes(role)
    ) {
      throw new BadRequestException(
        'Only admin/manager can approve pending work orders',
      );
    }
  }
}

