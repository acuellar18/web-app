import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const sales = await prisma.sale.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
    return NextResponse.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { totalAmount, discount, finalAmount, paymentMethod, items } = body;

    // We use a transaction to ensure both the sale is recorded and stock is updated.
    const sale = await prisma.$transaction(async (tx) => {
      // 1. Create the sale and its items
      const newSale = await tx.sale.create({
        data: {
          totalAmount: parseFloat(totalAmount),
          discount: parseFloat(discount) || 0,
          finalAmount: parseFloat(finalAmount),
          paymentMethod: paymentMethod || 'CASH',
          items: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: parseInt(item.quantity, 10),
              price: parseFloat(item.price),
              subtotal: parseFloat(item.subtotal)
            }))
          }
        },
        include: {
          items: true
        }
      });

      // 2. Update stock for each product
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: parseInt(item.quantity, 10)
            }
          }
        });
      }

      // 3. Update the daily cash register if the payment is in CASH
      // This logic finds the 'OPEN' cash register for the day and adds to ExpectedTotal
      if (paymentMethod === 'CASH') {
        const activeRegister = await tx.cashRegister.findFirst({
          where: { status: 'OPEN' },
          orderBy: { createdAt: 'desc' }
        });

        if (activeRegister) {
          await tx.cashRegister.update({
            where: { id: activeRegister.id },
            data: {
              expectedTotal: {
                increment: parseFloat(finalAmount)
              }
            }
          });
        }
      }

      return newSale;
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error('Error creating sale:', error);
    return NextResponse.json({ error: 'Failed to create sale' }, { status: 500 });
  }
}

