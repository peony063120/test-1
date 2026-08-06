import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  const roles = [
    { name: 'ADMIN', description: 'Administrator' },
    { name: 'MANAGER', description: 'Manager' },
    { name: 'WAREHOUSE_STAFF', description: 'Warehouse staff' },
    { name: 'SALES_STAFF', description: 'Sales staff' },
  ];

  const permissions = [
    { code: 'product.read', name: 'Read product' },
    { code: 'product.create', name: 'Create product' },
    { code: 'product.update', name: 'Update product' },
    { code: 'product.delete', name: 'Delete product' },
    { code: 'category.read', name: 'Read category' },
    { code: 'category.create', name: 'Create category' },
    { code: 'category.update', name: 'Update category' },
    { code: 'category.delete', name: 'Delete category' },
    { code: 'brand.read', name: 'Read brand' },
    { code: 'brand.create', name: 'Create brand' },
    { code: 'brand.update', name: 'Update brand' },
    { code: 'brand.delete', name: 'Delete brand' },
    { code: 'supplier.read', name: 'Read supplier' },
    { code: 'supplier.create', name: 'Create supplier' },
    { code: 'supplier.update', name: 'Update supplier' },
    { code: 'supplier.delete', name: 'Delete supplier' },
    { code: 'warehouse.read', name: 'Read warehouse' },
    { code: 'warehouse.create', name: 'Create warehouse' },
    { code: 'warehouse.update', name: 'Update warehouse' },
    { code: 'warehouse.delete', name: 'Delete warehouse' },
    { code: 'inventory.read', name: 'Read inventory' },
    { code: 'inventory.create', name: 'Create inventory' },
    { code: 'inventory.update', name: 'Update inventory' },
    { code: 'inventory.adjust', name: 'Adjust inventory' },
    { code: 'stock-transaction.read', name: 'Read stock transactions' },
    { code: 'purchase.read', name: 'Read purchase order' },
    { code: 'purchase.create', name: 'Create purchase order' },
    { code: 'purchase.update', name: 'Update purchase order' },
    { code: 'purchase.approve', name: 'Approve purchase order' },
    { code: 'purchase.receive', name: 'Receive purchase order' },
    { code: 'purchase.delete', name: 'Delete purchase order' },
    { code: 'sales.read', name: 'Read sales order' },
    { code: 'sales.create', name: 'Create sales order' },
    { code: 'sales.update', name: 'Update sales order' },
    { code: 'sales.ship', name: 'Ship sales order' },
    { code: 'sales.delete', name: 'Delete sales order' },
    { code: 'customer.read', name: 'Read customer' },
    { code: 'customer.create', name: 'Create customer' },
    { code: 'customer.update', name: 'Update customer' },
    { code: 'customer.delete', name: 'Delete customer' },
    { code: 'report.view', name: 'View reports' },
    { code: 'dashboard.read', name: 'View dashboard' },
    { code: 'audit.read', name: 'Read audit logs' },
    { code: 'notification.read', name: 'Read notifications' },
    { code: 'notification.update', name: 'Update notifications' },
    { code: 'notification.create', name: 'Create notifications' },
    { code: 'setting.read', name: 'Read settings' },
    { code: 'setting.create', name: 'Create setting' },
    { code: 'setting.update', name: 'Update setting' },
    { code: 'setting.delete', name: 'Delete setting' },
    { code: 'file.upload', name: 'Upload files' },
    { code: 'file.read', name: 'Read files' },
    { code: 'file.delete', name: 'Delete files' },
    { code: 'user.manage', name: 'Manage users' },
    { code: 'role.manage', name: 'Manage roles' },
    { code: 'permission.manage', name: 'Manage permissions' },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: {},
      create: permission,
    });
  }

  const createdRoles: Array<{ id: string; name: string }> = [];
  for (const role of roles) {
    const created = await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
    createdRoles.push(created);
  }

  const allPermissions = await prisma.permission.findMany();
  const adminRole = createdRoles.find((role) => role.name === 'ADMIN');
  const managerRole = createdRoles.find((role) => role.name === 'MANAGER');
  const warehouseRole = createdRoles.find((role) => role.name === 'WAREHOUSE_STAFF');
  const salesRole = createdRoles.find((role) => role.name === 'SALES_STAFF');

  if (adminRole) {
    for (const permission of allPermissions) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: adminRole.id, permissionId: permission.id } },
        update: {},
        create: { roleId: adminRole.id, permissionId: permission.id },
      });
    }
  }

  const managerPermissions = allPermissions.filter((permission) =>
    [
      'dashboard.read',
      'report.view',
      'product.read',
      'inventory.read',
      'purchase.read',
      'sales.read',
      'stock-transaction.read',
      'supplier.read',
      'warehouse.read',
      'category.read',
      'brand.read',
      'customer.read',
      'audit.read',
      'notification.read',
      'setting.read',
    ].includes(permission.code),
  );
  const warehousePermissions = allPermissions.filter((permission) =>
    [
      'dashboard.read',
      'product.read',
      'inventory.read',
      'inventory.adjust',
      'purchase.read',
      'purchase.create',
      'purchase.update',
      'purchase.receive',
      'supplier.read',
      'supplier.create',
      'supplier.update',
      'warehouse.read',
      'stock-transaction.read',
      'notification.read',
    ].includes(permission.code),
  );
  const salesPermissions = allPermissions.filter((permission) =>
    [
      'dashboard.read',
      'product.read',
      'inventory.read',
      'sales.read',
      'sales.create',
      'sales.update',
      'customer.read',
      'customer.create',
      'notification.read',
    ].includes(permission.code),
  );

  for (const entry of [
    { role: managerRole, permissions: managerPermissions },
    { role: warehouseRole, permissions: warehousePermissions },
    { role: salesRole, permissions: salesPermissions },
  ]) {
    if (!entry.role) continue;
    for (const permission of entry.permissions) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: entry.role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: entry.role.id, permissionId: permission.id },
      });
    }
  }

  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { passwordHash },
    create: {
      username: 'admin',
      passwordHash,
      email: 'admin@example.com',
      status: 'ACTIVE',
    },
  });

  if (adminRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
      update: {},
      create: { userId: adminUser.id, roleId: adminRole.id },
    });
  }

  const defaultSettings = [
    {
      key: 'system.name',
      value: 'Product Management System',
      dataType: 'STRING',
      description: 'Display name of the system',
    },
    {
      key: 'system.timezone',
      value: 'Asia/Ho_Chi_Minh',
      dataType: 'STRING',
      description: 'Default timezone used for reports and logs',
    },
    {
      key: 'system.currency',
      value: 'VND',
      dataType: 'STRING',
      description: 'Default currency for sales and purchase documents',
    },
    {
      key: 'inventory.lowStockThreshold',
      value: '10',
      dataType: 'NUMBER',
      description: 'Global threshold for low stock alert',
    },
    {
      key: 'sales.vatRate',
      value: '8',
      dataType: 'NUMBER',
      description: 'Default VAT rate in percent',
    },
  ];

  for (const setting of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {
        value: setting.value,
        dataType: setting.dataType,
        description: setting.description,
      },
      create: setting,
    });
  }

  console.log('Seed completed successfully');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
