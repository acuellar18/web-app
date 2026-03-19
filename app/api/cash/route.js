import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const registers = await prisma.cashRegister.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(registers);
  } catch (error) {
    console.error('Error fetching cash registers:', error);
    return NextResponse.json({ error: 'Failed to fetch cash registers' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, openingAmount, actualTotal, notes } = body;

    if (action === 'OPEN') {
      // Create a new cash register session (sencillo)
      const register = await prisma.cashRegister.create({
        data: {
          openingAmount: parseFloat(openingAmount),
          expectedTotal: parseFloat(openingAmount), // Will go up with sales
          status: 'OPEN',
          notes: notes || null
        }
      });
      return NextResponse.json(register, { status: 201 });
    } else if (action === 'CLOSE') {
      // Close the currently open register
      const activeRegister = await prisma.cashRegister.findFirst({
        where: { status: 'OPEN' },
        orderBy: { createdAt: 'desc' }
      });

      if (!activeRegister) {
        return NextResponse.json({ error: 'No open cash register found' }, { status: 400 });
      }

      const closedRegister = await prisma.cashRegister.update({
        where: { id: activeRegister.id },
        data: {
          actualTotal: parseFloat(actualTotal),
          closingAmount: parseFloat(actualTotal),
          status: 'CLOSED',
          notes: notes || activeRegister.notes
        }
      });
      return NextResponse.json(closedRegister);
    } else if (action === 'WITHDRAW') {
      // Record a withdrawal from the active register
      const { amount, description } = body;
      
      const activeRegister = await prisma.cashRegister.findFirst({
        where: { status: 'OPEN' },
        orderBy: { createdAt: 'desc' }
      });

      if (!activeRegister) {
        return NextResponse.json({ error: 'No hay caja abierta para realizar retiros' }, { status: 400 });
      }

      const result = await prisma.$transaction(async (tx) => {
        // 1. Create the expense linked to the register
        const expense = await tx.expense.create({
          data: {
            description: `Retiro de Caja: ${description}`,
            amount: parseFloat(amount),
            category: 'CASH_WITHDRAWAL',
            cashRegisterId: activeRegister.id
          }
        });

        // 2. Decrement the expected total of the register
        await tx.cashRegister.update({
          where: { id: activeRegister.id },
          data: {
            expectedTotal: {
              decrement: parseFloat(amount)
            }
          }
        });

        return expense;
      });

      return NextResponse.json(result);
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error managing cash register:', error);
    return NextResponse.json({ error: 'Failed to manage cash register' }, { status: 500 });
  }
}

