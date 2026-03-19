import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { description, amount, category } = body;

    const expense = await prisma.expense.create({
      data: {
        description,
        amount: parseFloat(amount),
        category: category || 'OTHER',
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}

