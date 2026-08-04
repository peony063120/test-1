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
    { code: 'purchase.create', name: 'Create purchase order' },
    { code: 'purchase.approve', name: 'Approve purchase order' },
    { code: 'sales.create', name: 'Create sales order' },
    { code: 'sales.ship', name: 'Ship sales order' },
    { code: 'inventory.adjust', name: 'Adjust inventory' },
    { code: 'user.manage', name: 'Manage users' },
    { code: 'role.manage', name: 'Manage roles' },
    { code: 'report.view', name: 'View reports' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
  }

  const createdRoles = [] as Array<{ id: string; name: string }>;
  for (const role of roles) {
    const created = await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
    createdRoles.push(created);
  }

  const allPermissions = await prisma.permission.findMany();
  const adminRole = createdRoles.find((r) => r.name === 'ADMIN');
  const managerRole = createdRoles.find((r) => r.name === 'MANAGER');
  const warehouseRole = createdRoles.find((r) => r.name === 'WAREHOUSE_STAFF');
  const salesRole = createdRoles.find((r) => r.name === 'SALES_STAFF');

  if (adminRole) {
    for (const permission of allPermissions) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: adminRole.id, permissionId: permission.id } },
        update: {},
        create: { roleId: adminRole.id, permissionId: permission.id },
      });
    }
  }

  const managerPermissions = allPermissions.filter((p) => ['product.read', 'purchase.create', 'purchase.approve', 'sales.create', 'report.view'].includes(p.code));
  const warehousePermissions = allPermissions.filter((p) => ['product.read', 'inventory.adjust', 'purchase.create'].includes(p.code));
  const salesPermissions = allPermissions.filter((p) => ['product.read', 'sales.create', 'sales.ship'].includes(p.code));

  const rolePermissionMap = [
    { role: managerRole, permissions: managerPermissions },
    { role: warehouseRole, permissions: warehousePermissions },
    { role: salesRole, permissions: salesPermissions },
  ];

  for (const entry of rolePermissionMap) {
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

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
