import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { WorkOrder } from '../entity/work-order.entity';
import { CreateWorkOrderDto } from '../dto/create-work-order.dto';
import { UpdateWorkOrderDto } from '../dto/update-work-order.dto';
import { QueryWorkOrdersDto } from '../dto/query-work-orders.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';
import { User } from '../../users/entity/user.entity';
import {
  WorkOrderAction,
  WorkOrderLog,
} from '../../audit/entity/work-order-log.entity';
import { StatusWorkflowService } from '../rules/work-order-status.rules';
import { WorkOrderStatus } from '../../common/enums/work-order-status.enum';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class WorkOrderService {
  constructor(
    @InjectRepository(WorkOrder)
    private readonly workOrdersRepository: Repository<WorkOrder>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(WorkOrderLog)
    private readonly logsRepository: Repository<WorkOrderLog>,
    private readonly workflow: StatusWorkflowService,
  ) {}

  async findAll(
    query: QueryWorkOrdersDto,
    currentUserId: number,
    currentUserRole: Role,
  ) {
    const { page = 1, limit = 20 } = query;
    
    try {
      const qb = this.workOrdersRepository
        .createQueryBuilder('wo')
        .leftJoin('wo.assignedTo', 'assignedTo')
        .leftJoin('wo.createdBy', 'createdBy')
        .addSelect([
          'assignedTo.id',
          'assignedTo.name',
          'assignedTo.email',
          'assignedTo.role',
        ])
        .addSelect([
          'createdBy.id',
          'createdBy.name',
          'createdBy.email',
          'createdBy.role',
        ]);

      // Apply filters
      if (query.status) {
        qb.andWhere('wo.status = :status', { status: query.status });
      }

      if (query.priority) {
        qb.andWhere('wo.priority = :priority', { priority: query.priority });
      }

      if (query.assignedToUserId) {
        qb.andWhere('assignedTo.id = :assignedToId', {
          assignedToId: query.assignedToUserId,
        });
      }

      if (query.createdByUserId) {
        qb.andWhere('createdBy.id = :createdById', {
          createdById: query.createdByUserId,
        });
      }

      // Operators only see their assigned work orders
      if (currentUserRole === Role.OPERATOR) {
        qb.andWhere('assignedTo.id = :operatorId', {
          operatorId: currentUserId,
        });
      }

      if (query.search) {
        qb.andWhere('wo.title ILIKE :search', {
          search: `%${query.search}%`,
        });
      }

      if (query.fromDueDate) {
        qb.andWhere('wo.dueDate >= :fromDueDate', {
          fromDueDate: query.fromDueDate,
        });
      }

      if (query.toDueDate) {
        qb.andWhere('wo.dueDate <= :toDueDate', {
          toDueDate: query.toDueDate,
        });
      }

      qb.orderBy('wo.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      const [items, total] = await qb.getManyAndCount();

      return {
        items,
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error in findAll:', error);
      throw error;
    }
  }

  async findOne(id: number, currentUserId: number, role: Role) {
    const workOrder = await this.workOrdersRepository.findOne({
      where: { id },
      relations: ['assignedTo', 'createdBy'],
    });
    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    if (role === Role.OPERATOR && workOrder.assignedTo?.id !== currentUserId) {
      throw new ForbiddenException(
        'Operators can only view their assigned work orders',
      );
    }

    return workOrder;
  }

  async create(createDto: CreateWorkOrderDto, currentUserId: number) {
    const creator = await this.usersRepository.findOne({
      where: { id: currentUserId },
    });

    const assignedTo =
      createDto.assignedToUserId != null
        ? await this.usersRepository.findOne({
            where: { id: createDto.assignedToUserId },
          })
        : null;

    const workOrder = this.workOrdersRepository.create({
      title: createDto.title,
      description: createDto.description,
      priority: createDto.priority,
      createdBy: creator!,
      assignedTo: assignedTo ?? null,
      dueDate: createDto.dueDate ? new Date(createDto.dueDate) : null,
    });

    const saved = await this.workOrdersRepository.save(workOrder);

    await this.logsRepository.save(
      this.logsRepository.create({
        workOrder: saved,
        performedBy: creator!,
        action: WorkOrderAction.CREATE,
      }),
    );

    return saved;
  }

  async update(
    id: number,
    dto: UpdateWorkOrderDto,
    currentUserId: number,
    role: Role,
  ) {
    const workOrder = await this.workOrdersRepository.findOne({
      where: { id },
      relations: ['assignedTo', 'createdBy'],
    });
    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    if (role === Role.OPERATOR) {
      throw new ForbiddenException('Operators cannot edit work orders');
    }

    if (dto.assignedToUserId != null) {
      const assignedTo = await this.usersRepository.findOne({
        where: { id: dto.assignedToUserId },
      });
      workOrder.assignedTo = assignedTo ?? null;
    }

    if (dto.title != null) workOrder.title = dto.title;
    if (dto.description != null) workOrder.description = dto.description;
    if (dto.priority != null) workOrder.priority = dto.priority;
    if (dto.dueDate !== undefined) {
      workOrder.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    }

    const saved = await this.workOrdersRepository.save(workOrder);

    await this.logsRepository.save(
      this.logsRepository.create({
        workOrder: saved,
        performedBy: { id: currentUserId } as User,
        action: WorkOrderAction.UPDATE,
      }),
    );

    return saved;
  }

  async remove(id: number, currentUserId: number, role: Role) {
    if (role === Role.OPERATOR) {
      throw new ForbiddenException('Operators cannot delete work orders');
    }

    const workOrder = await this.workOrdersRepository.findOne({
      where: { id },
    });
    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    // Log BEFORE removing the work order
    await this.logsRepository.save(
      this.logsRepository.create({
        workOrder,
        performedBy: { id: currentUserId } as User,
        action: WorkOrderAction.DELETE,
      }),
    );

    await this.workOrdersRepository.remove(workOrder);

    return { success: true };
  }

  async changeStatus(
    id: number,
    dto: UpdateStatusDto,
    currentUserId: number,
    role: Role,
  ) {
    const workOrder = await this.workOrdersRepository.findOne({
      where: { id },
      relations: ['assignedTo'],
    });
    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    if (
      role === Role.OPERATOR &&
      workOrder.assignedTo?.id !== currentUserId
    ) {
      throw new ForbiddenException(
        'Operators can only change status of their assigned work orders',
      );
    }

    this.workflow.validateTransition(workOrder.status, dto.newStatus, role);

    const previousStatus = workOrder.status;
    workOrder.status = dto.newStatus;

    const saved = await this.workOrdersRepository.save(workOrder);

    await this.logsRepository.save(
      this.logsRepository.create({
        workOrder: saved,
        performedBy: { id: currentUserId } as User,
        action: WorkOrderAction.STATUS_CHANGE,
        fromStatus: previousStatus,
        toStatus: dto.newStatus,
      }),
    );

    return saved;
  }

  async getLogs(id: number, currentUserId: number, role: Role) {
    const workOrder = await this.workOrdersRepository.findOne({
      where: { id },
    });
    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    if (role === Role.OPERATOR) {
      throw new ForbiddenException('Operators cannot view work order logs');
    }

    return this.logsRepository.find({
      where: { workOrder: { id } },
      relations: ['performedBy'],
      order: { timestamp: 'DESC' },
    });
  }
}

