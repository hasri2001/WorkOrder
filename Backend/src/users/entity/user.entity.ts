import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../../common/enums/role.enum';
import { WorkOrder } from '../../work-order/entity/work-order.entity';
import { WorkOrderLog } from '../../audit/entity/work-order-log.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ type: 'enum', enum: Role })
  role: Role;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => WorkOrder, (wo) => wo.createdBy)
  createdWorkOrders: WorkOrder[];

  @OneToMany(() => WorkOrder, (wo) => wo.assignedTo)
  assignedWorkOrders: WorkOrder[];

  @OneToMany(() => WorkOrderLog, (log) => log.performedBy)
  workOrderLogs: WorkOrderLog[];
}

