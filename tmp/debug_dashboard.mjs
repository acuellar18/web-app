import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugDashboard() {
  try {
    console.log('Testing connection...');
    await prisma.$connect();
    console.log('Connected.');

    console.log('Testing Product count...');
    await prisma.product.count();
    
    console.log('Testing Expense aggregate...');
    await prisma.expense.aggregate({ _sum: { amount: true } });

    console.log('Testing Product findMany...');
    await prisma.product.findMany({ orderBy: { stock: 'asc' } });

    console.log('Testing Sale findMany (recent sales)...');
    await prisma.sale.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } }
    });

    console.log('Testing Expense findMany (chart data)...');
    await prisma.expense.findMany({ orderBy: { date: 'asc' } });

    console.log('Testing Credit aggregate...');
    await prisma.credit.aggregate({ where: { status: 'ACTIVE' }, _sum: { balance: true } });

    console.log('All detailed queries passed.');
  } catch (error) {
    console.error('DEBUG ERROR:', error);
    if (error.code) console.error('ErrorCode:', error.code);
    if (error.meta) console.error('ErrorMeta:', error.meta);
  } finally {
    await prisma.$disconnect();
  }
}

debugDashboard();
