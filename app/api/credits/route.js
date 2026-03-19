import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const credits = await prisma.credit.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        payments: {
          orderBy: { date: 'desc' }
        }
      }
    });
    return NextResponse.json(credits);
  } catch (error) {
    console.error('Error fetching credits:', error);
    return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, amount, dueDate, notes } = body;

    const credit = await prisma.credit.create({
      data: {
        customerName,
        customerPhone: customerPhone || null,
        amount: parseFloat(amount),
        balance: parseFloat(amount),
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'ACTIVE',
        notes: notes || null,
      },
    });

    return NextResponse.json(credit, { status: 201 });
  } catch (error) {
    console.error('Error creating credit:', error);
    return NextResponse.json({ error: 'Failed to create credit' }, { status: 500 });
  }
}

