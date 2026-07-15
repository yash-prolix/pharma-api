import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  engine: 'classic',
  datasource: {
    // Use process.env instead of env() to avoid throwing during `prisma generate`
    // where the database URL is not needed (only schema is read)
    url: process.env.DATABASE_URL ?? '',
  },
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
});
