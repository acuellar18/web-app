import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Basic dashboard metrics aggregation
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Sales today
    const salesToday = await prisma.sale.aggregate({
      where: {
        createdAt: { gte: today },
        status: 'COMPLETED'
      },
      _sum: { finalAmount: true },
      _count: { id: true }
    });

    // Total metrics across all time for Vision UI top cards
    const totalExpenses = await prisma.expense.aggregate({
      _sum: { amount: true }
    });
    
    const totalSales = await prisma.sale.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { finalAmount: true },
      _count: { id: true }
    });

    // Total products count
    const totalProducts = await prisma.product.count();

    // 2. Low stock products - use raw comparison instead of prisma.product.fields
    const allProducts = await prisma.product.findMany({
      orderBy: { stock: 'asc' }
    });
    const lowStockProducts = allProducts.filter(p => p.stock <= p.minStock).slice(0, 5);

    // 3. Active credits sum
    const activeCredits = await prisma.credit.aggregate({
      where: { status: 'ACTIVE' },
      _sum: { balance: true }
    });

    // 4. recent sales
    const recentSales = await prisma.sale.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } }
    });

    // 5. Build real chart data from expenses by month
    const allExpenses = await prisma.expense.findMany({
      orderBy: { date: 'asc' }
    });

    // Group expenses by month for area chart
    const expensesByMonth = {};
    allExpenses.forEach(exp => {
      const d = new Date(exp.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      expensesByMonth[key] = (expensesByMonth[key] || 0) + exp.amount;
    });

    const areaData = Object.entries(expensesByMonth).map(([name, val]) => ({ name, val: Math.round(val) }));

    // Group expenses by category for bar chart
    const expensesByCategory = {};
    const categoryColors = { INVENTORY: '#0075FF', BILLS: '#02D4E3', SALARY: '#FFFFFF', CASH_WITHDRAWAL: '#FF7070', OTHER: '#A0AEC0' };
    const categoryLabels = { INVENTORY: 'Inventario', BILLS: 'Servicios', SALARY: 'Salarios', CASH_WITHDRAWAL: 'Retiros Caja', OTHER: 'Otros' };
    allExpenses.forEach(exp => {
      expensesByCategory[exp.category] = (expensesByCategory[exp.category] || 0) + exp.amount;
    });

    const barData = Object.entries(expensesByCategory).map(([cat, value]) => ({
      name: categoryLabels[cat] || cat,
      value: Math.round(value),
      fill: categoryColors[cat] || '#A0AEC0'
    }));

    return NextResponse.json({
      salesToday: {
        total: salesToday._sum.finalAmount || 0,
        count: salesToday._count.id || 0
      },
      totalMetrics: {
        totalVentas: (totalSales._sum.finalAmount || 0).toFixed(2),
        totalGastado: (totalExpenses._sum.amount || 0).toFixed(2),
        facturas: totalSales._count.id || 0,
        promedioFactura: totalSales._count.id > 0 ? (totalSales._sum.finalAmount / totalSales._count.id).toFixed(2) : '0.00',
        totalProductos: totalProducts
      },
      lowStockProducts,
      totalCreditsActive: activeCredits._sum.balance || 0,
      recentSales,
      chartData: {
        area: areaData.length > 0 ? areaData : [{ name: 'Sin datos', val: 0 }],
        bar: barData.length > 0 ? barData : [{ name: 'Sin datos', value: 0, fill: '#A0AEC0' }]
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
