import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WorkOrder } from '../../work-order/entity/work-order.entity';
import { User } from '../../users/entity/user.entity';

export enum WorkOrderAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  STATUS_CHANGE = 'STATUS_CHANGE',
  DELETE = 'DELETE',
}

@Entity({ name: 'work_order_logs' })
export class WorkOrderLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => WorkOrder, (wo) => wo.logs, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'work_order_id' })
  workOrder: WorkOrder | null;

  @ManyToOne(() => User, (user) => user.workOrderLogs, { nullable: false })
  @JoinColumn({ name: 'performed_by_id' })
  performedBy: User;

  @Column({ type: 'enum', enum: WorkOrderAction })
  action: WorkOrderAction;

  @Column({ type: 'varchar', name: 'from_status', nullable: true })
  fromStatus?: string | null;

  @Column({ type: 'varchar', name: 'to_status', nullable: true })
  toStatus?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  payload?: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'timestamp' })
  timestamp: Date;
}

