import { prisma } from '../lib/prisma';

// ─── Seed Data ───────────────────────────────────────────────

const userRoles = ['Admin', 'Manager', 'Relationship Manager', 'Medical Representative'];
const userStatuses = ['Active', 'Inactive'];
const productStatuses = ['Available', 'Deleted'];

// ─── Seed Functions ──────────────────────────────────────────

async function seedUserRoles() {
  for (const [index, name] of userRoles.entries()) {
    await prisma.userRole.upsert({
      where: { id: index + 1 },
      update: { name },
      create: { id: index + 1, name },
    });
  }
  console.log(`  ✅ UserRoles seeded (${userRoles.length} rows)`);
}

async function seedUserStatuses() {
  for (const [index, name] of userStatuses.entries()) {
    await prisma.userStatus.upsert({
      where: { id: index + 1 },
      update: { name },
      create: { id: index + 1, name },
    });
  }
  console.log(`  ✅ UserStatuses seeded (${userStatuses.length} rows)`);
}

async function seedProductStatuses() {
  for (const [index, name] of productStatuses.entries()) {
    await prisma.productStatus.upsert({
      where: { id: index + 1 },
      update: { name },
      create: { id: index + 1, name },
    });
  }
  console.log(`  ✅ ProductStatuses seeded (${productStatuses.length} rows)`);
}

// ─── Main ────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding database...\n');

  await seedUserRoles();
  await seedUserStatuses();
  await seedProductStatuses();

  console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
