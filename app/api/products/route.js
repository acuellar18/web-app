import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { barcode, name, description, costPrice, salePrice, stock, minStock, category } = body;

    // Optional: check if barcode already exists
    if (barcode) {
      const existingProduct = await prisma.product.findUnique({ where: { barcode } });
      if (existingProduct) {
        return NextResponse.json({ error: 'Product with this barcode already exists' }, { status: 400 });
      }
    }

    const product = await prisma.product.create({
      data: {
        barcode: barcode || null,
        name,
        description: description || null,
        costPrice: parseFloat(costPrice),
        salePrice: parseFloat(salePrice),
        stock: parseInt(stock, 10) || 0,
        minStock: parseInt(minStock, 10) || 5,
        category: category || null,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
