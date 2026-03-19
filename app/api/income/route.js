import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const incomes = await prisma.income.findMany({
      orderBy: { date: 'desc' }
    });
    return NextResponse.json(incomes);
  } catch (error) {
    console.error('Error fetching incomes:', error);
    return NextResponse.json({ error: 'Failed to fetch incomes' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { description, amount, source } = body;

    const income = await prisma.income.create({
      data: {
        description,
        amount: parseFloat(amount),
        source: source || 'OTHER',
      },
    });

    return NextResponse.json(income, { status: 201 });
  } catch (error) {
    console.error('Error creating income:', error);
    return NextResponse.json({ error: 'Failed to create income' }, { status: 500 });
  }
}

