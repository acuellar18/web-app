import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateSchema() {
  try {
    console.log('Updating schema...');
    
    // Add purchaseDate to Credit
    console.log('Adding purchaseDate to Credit...');
    await prisma.$executeRawUnsafe(`ALTER TABLE "Credit" ADD COLUMN IF NOT EXISTS "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;`);

    // Add balanceAfter to CreditPayment
    console.log('Adding balanceAfter to CreditPayment...');
    await prisma.$executeRawUnsafe(`ALTER TABLE "CreditPayment" ADD COLUMN IF NOT EXISTS "balanceAfter" DOUBLE PRECISION;`);

    // Add cashRegisterId to Expense
    console.log('Adding cashRegisterId to Expense...');
    await prisma.$executeRawUnsafe(`ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "cashRegisterId" TEXT;`);

    // Add Foreign Key (ignore if already exists)
    try {
      console.log('Adding foreign key constraint to Expense...');
      await prisma.$executeRawUnsafe(`ALTER TABLE "Expense" ADD CONSTRAINT "Expense_cashRegisterId_fkey" FOREIGN KEY ("cashRegisterId") REFERENCES "CashRegister"("id") ON DELETE SET NULL ON UPDATE CASCADE;`);
    } catch (e) {
      console.log('Foreign key might already exist, skipping...');
    }

    console.log('Schema updated successfully.');
  } catch (error) {
    console.error('ERROR UPDATING SCHEMA:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSchema();
