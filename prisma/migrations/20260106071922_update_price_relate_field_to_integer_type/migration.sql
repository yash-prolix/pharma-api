/*
  Warnings:

  - You are about to alter the column `mrp` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `ptr` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `pts` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "products" ALTER COLUMN "mrp" SET DATA TYPE INTEGER,
ALTER COLUMN "ptr" SET DATA TYPE INTEGER,
ALTER COLUMN "pts" SET DATA TYPE INTEGER;
