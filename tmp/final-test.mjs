import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { resolve } from 'path'

async function test() {
  console.log('Final verification: Creating a test product...')
  const dbPath = resolve(process.cwd(), 'dev.db').replace(/\\/g, '/')
  const adapter = new PrismaBetterSqlite3({ url: dbPath })
  const prisma = new PrismaClient({ adapter })

  try {
    const testProduct = await prisma.product.create({
      data: {
        name: 'Producto de Prueba',
        salePrice: 10.00,
        costPrice: 5.00,
        stock: 100,
        minStock: 5,
        category: 'PRUEBA'
      }
    })
    console.log('SUCCESS! Created product with ID: ' + testProduct.id)
    
    // Cleanup
    await prisma.product.delete({ where: { id: testProduct.id } })
    console.log('Cleanup successful (deleted test product)')
  } catch (err) {
    console.log('--- ERROR START ---')
    console.log(err.message)
    console.log('--- ERROR END ---')
  } finally {
    await prisma.$disconnect()
  }
}

test()
