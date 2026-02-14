import { Controller, Get, Query, Request } from '@nestjs/common';
import { WorkOrderLogService } from '../service/work-order-log.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('work-order-logs')
export class WorkOrderLogController {
  constructor(private readonly workOrderLogService: WorkOrderLogService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  getLogs(
    @Query('workOrderId') workOrderId: string,
    @Request() req: { user?: { userId: number; role: Role } },
  ) {
    const id = parseInt(workOrderId, 10);
    if (Number.isNaN(id)) {
      return [];
    }
    return this.workOrderLogService.getByWorkOrderId(id);
  }
}
