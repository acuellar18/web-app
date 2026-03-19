import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, context) {
  try {
    const { id } = await context.params;
    const product = await prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { barcode, name, description, costPrice, salePrice, stock, minStock, category } = body;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        barcode: barcode || null,
        name,
        description: description || null,
        costPrice: parseFloat(costPrice),
        salePrice: parseFloat(salePrice),
        stock: parseInt(stock, 10),
        minStock: parseInt(minStock, 10),
        category: category || null,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { id } = await context.params;
    await prisma.product.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
