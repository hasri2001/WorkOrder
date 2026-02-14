import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WorkOrderStatus } from '../../common/enums/work-order-status.enum';
import { WorkOrderPriority } from '../../common/enums/work-order-priority.enum';
import { User } from '../../users/entity/user.entity';
import { WorkOrderLog } from '../../audit/entity/work-order-log.entity';

@Entity({ name: 'work_orders' })
export class WorkOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: WorkOrderStatus, default: WorkOrderStatus.PENDING })
  status: WorkOrderStatus;

  @Column({ type: 'enum', enum: WorkOrderPriority, default: WorkOrderPriority.MEDIUM })
  priority: WorkOrderPriority;

  @ManyToOne(() => User, (user) => user.assignedWorkOrders, { nullable: true })
  @JoinColumn({ name: 'assigned_to_id' })
  assignedTo?: User | null;

  @ManyToOne(() => User, (user) => user.createdWorkOrders, { nullable: false })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ type: 'timestamp with time zone', name: 'due_date', nullable: true })
  dueDate?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => WorkOrderLog, (log) => log.workOrder)
  logs: WorkOrderLog[];
}

