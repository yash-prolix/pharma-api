import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    async function main() {
      const duplicate: {
        city: string;
        stateId: number;
        duplicates: {
          id: number;
          name: string;
          createdBy: string | null;
          createdAt: Date;
          updatedBy: string | null;
          updatedAt: Date | null;
          stateId: number;
        }[];
      }[] = [];
      const cities = await prisma.city.findMany({});

      await Promise.all(
        cities.map(async (city) => {
          const DuplicateCities = await prisma.city.findMany({
            where: {
              stateId: city.stateId,
              name: city.name,
              id: { not: city.id },
            },
          });

          if (DuplicateCities.length > 0) {
            duplicate.push({
              city: city.name,
              stateId: city.stateId,
              duplicates: DuplicateCities,
            });
          }
        }),
      );

      console.log(duplicate);
    }

    main().catch((e) => {
      console.error(e);
      process.exit(1);
    });
  } catch (error) {
    console.log(error);
  } finally {
    await prisma.$disconnect();
  }
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
