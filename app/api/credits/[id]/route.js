import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request, context) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { paymentAmount } = body;
    
    // We handle a payment towards the credit in a transaction
    const amount = parseFloat(paymentAmount);
    
    // Find the current credit to ensure valid payment
    const credit = await prisma.credit.findUnique({
      where: { id },
    });
    
    if (!credit) {
      return NextResponse.json({ error: 'Credit not found' }, { status: 404 });
    }
    
    if (amount > credit.balance) {
      return NextResponse.json({ error: 'Payment exceeds credit balance' }, { status: 400 });
    }
    
    const updatedCredit = await prisma.$transaction(async (tx) => {
      // Create the payment record
      await tx.creditPayment.create({
        data: {
          creditId: id,
          amount: amount
        }
      });
      
      const newBalance = credit.balance - amount;
      
      // Update the credit balance and status
      const updated = await tx.credit.update({
        where: { id },
        data: {
          balance: newBalance,
          status: newBalance <= 0 ? 'PAID' : 'ACTIVE',
        },
        include: {
          payments: {
            orderBy: { date: 'desc' }
          }
        }
      });
      
      // Also register this payment as Income
      await tx.income.create({
        data: {
          description: `Abono de crédito - ${credit.customerName}`,
          amount: amount,
          source: 'CREDIT_PAYMENT'
        }
      });
      
      return updated;
    });

    return NextResponse.json(updatedCredit);
  } catch (error) {
    console.error('Error processing credit payment:', error);
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
  }
}
