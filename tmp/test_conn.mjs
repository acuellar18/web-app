import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing connection to Supabase (v5 client)...');
    const result = await prisma.user.count();
    console.log('Connection successful! User count:', result);
  } catch (e) {
    console.error('--- CONNECTION ERROR ---');
    console.error(e.message);
    console.error('------------------------');
  } finally {
    await prisma.$disconnect();
  }
}

main();
