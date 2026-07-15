import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const statuses = ['Active', 'Inactive'];

export async function seedUserStatus() {
  try {
    statuses?.map(async (name, index) => {
      await prisma.userStatus.upsert({
        where: { id: index + 1 },
        update: {
          name: name,
          id: index + 1,
        },
        create: {
          name: name,
          id: index + 1,
        },
      });
    });

    console.log('User status seeded successfully.');
  } catch (error) {
    console.error('Error seeding user status:', error);
  }
}

seedUserStatus()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
