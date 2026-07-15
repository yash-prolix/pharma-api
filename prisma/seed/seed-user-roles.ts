import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const roles = [
  'Admin',
  'Manager',
  'Relationship Manager',
  'Medical Representative',
];

export async function seedUserRoles() {
  try {
    roles?.map(async (name, index) => {
      await prisma.userRole.upsert({
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

    console.log('User roles seeded successfully.');
  } catch (error) {
    console.error('Error seeding user roles:', error);
  }
}

seedUserRoles()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
