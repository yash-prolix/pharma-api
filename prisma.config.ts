import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  engine: 'classic',
  datasource: {
    url: env('DATABASE_URL'),
  },
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
});
