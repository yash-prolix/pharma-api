import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const statuses = ['Available', 'Deleted'];

export async function seedProductStatus() {
  try {
    statuses?.map(async (name, index) => {
      await prisma.productStatus.upsert({
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

    console.log('Product status seeded successfully.');
  } catch (error) {
    console.error('Error seeding product status:', error);
  }
}

seedProductStatus()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
