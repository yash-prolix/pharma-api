import { prisma } from '../lib/prisma';

async function verify() {
  try {
    // Simple read query to verify connection
    const roleCount = await prisma.userRole.count();
    const statusCount = await prisma.userStatus.count();
    const productStatusCount = await prisma.productStatus.count();

    console.log('');
    console.log('✅ Connected to Prisma Postgres successfully!');
    console.log('');
    console.log('   Database contents:');
    console.log(`   • UserRoles:       ${roleCount} rows`);
    console.log(`   • UserStatuses:    ${statusCount} rows`);
    console.log(`   • ProductStatuses: ${productStatusCount} rows`);
    console.log('');
  } catch (error) {
    console.error('');
    console.error('❌ Connection failed:', error);
    console.error('');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
