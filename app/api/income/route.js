import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    
    let where = {};
    if (dateParam) {
      const startOfDay = new Date(dateParam);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dateParam);
      endOfDay.setHours(23, 59, 59, 999);
      
      where = {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      };
    } else {
      // Default to today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      
      where = {
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      };
    }

    const incomes = await prisma.income.findMany({
      where,
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

