import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { WorkOrderService } from '../service/work-order.service';
import { CreateWorkOrderDto } from '../dto/create-work-order.dto';
import { QueryWorkOrdersDto } from '../dto/query-work-orders.dto';
import { UpdateWorkOrderDto } from '../dto/update-work-order.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('work-orders')
export class WorkOrderController {
  constructor(private readonly workOrdersService: WorkOrderService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.OPERATOR)
  findAll(@Query() query: QueryWorkOrdersDto, @Request() req: any) {
    const { userId, role } = req.user as { userId: number; role: Role };
    return this.workOrdersService.findAll(query, userId, role);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.OPERATOR)
  findOne(@Param('id') id: string, @Request() req: any) {
    const { userId, role } = req.user as { userId: number; role: Role };
    return this.workOrdersService.findOne(Number(id), userId, role);
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @Post()
  create(@Body() dto: CreateWorkOrderDto, @Request() req: any) {
    const userId = req.user.userId as number;
    return this.workOrdersService.create(dto, userId);
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkOrderDto,
    @Request() req: any,
  ) {
    const { userId, role } = req.user as { userId: number; role: Role };
    return this.workOrdersService.update(Number(id), dto, userId, role);
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    const { userId, role } = req.user as { userId: number; role: Role };
    return this.workOrdersService.remove(Number(id), userId, role);
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.OPERATOR)
  @Patch(':id/status')
  changeStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @Request() req: any,
  ) {
    const { userId, role } = req.user as { userId: number; role: Role };
    return this.workOrdersService.changeStatus(Number(id), dto, userId, role);
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @Get(':id/logs')
  getLogs(@Param('id') id: string, @Request() req: any) {
    const { userId, role } = req.user as { userId: number; role: Role };
    return this.workOrdersService.getLogs(Number(id), userId, role);
  }
}

