import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { User } from '../users/entity/user.entity';
import { Role } from '../common/enums/role.enum';
import * as bcrypt from 'bcrypt';
import { WorkOrder } from '../work-order/entity/work-order.entity';
import { WorkOrderPriority } from '../common/enums/work-order-priority.enum';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const userRepo = dataSource.getRepository(User);
  const workOrderRepo = dataSource.getRepository(WorkOrder);

  const existingAdmin = await userRepo.findOne({
    where: { email: 'admin@example.com' },
  });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('Admin123!', 10);
    const admin = userRepo.create({
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash,
      role: Role.ADMIN,
    });

    const managerPassword = await bcrypt.hash('Manager123!', 10);
    const manager = userRepo.create({
      name: 'Manager User',
      email: 'manager@example.com',
      passwordHash: managerPassword,
      role: Role.MANAGER,
    });

    const operatorPassword = await bcrypt.hash('Operator123!', 10);
    const operator = userRepo.create({
      name: 'Operator User',
      email: 'operator@example.com',
      passwordHash: operatorPassword,
      role: Role.OPERATOR,
    });

    const [savedAdmin, savedManager, savedOperator] = await userRepo.save([
      admin,
      manager,
      operator,
    ]);

    const sampleWorkOrders = workOrderRepo.create([
      {
        title: 'Fix network issue',
        description: 'Investigate and resolve intermittent network outages.',
        priority: WorkOrderPriority.HIGH,
        createdBy: savedManager,
        assignedTo: savedOperator,
      },
      {
        title: 'Replace printer toner',
        description: 'Toner cartridge replacement in Office 3B.',
        priority: WorkOrderPriority.LOW,
        createdBy: savedManager,
        assignedTo: savedOperator,
      },
    ]);

    await workOrderRepo.save(sampleWorkOrders);

    // eslint-disable-next-line no-console
    console.log('Seed data created.');
  } else {
    // eslint-disable-next-line no-console
    console.log('Seed data already exists, skipping.');
  }

  await app.close();
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

