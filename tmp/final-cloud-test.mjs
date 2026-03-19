import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

async function test() {
  console.log('Verificación Final en la NUBE (con dotenv): Creando producto de prueba...')
  const prisma = new PrismaClient()

  try {
    const testProduct = await prisma.product.create({
      data: {
        name: 'Producto en la Nube',
        salePrice: 15.50,
        costPrice: 8.25,
        stock: 50,
        minStock: 10,
        category: 'CLOUD'
      }
    })
    console.log('¡ÉXITO! Producto creado en Supabase con ID: ' + testProduct.id)
    
    // Cleanup
    await prisma.product.delete({ where: { id: testProduct.id } })
    console.log('Limpieza exitosa (producto de prueba borrado)')
  } catch (err) {
    console.log('--- ERROR DE CONEXIÓN ---')
    console.log(err.message)
    console.log('--- FIN ERROR ---')
  } finally {
    await prisma.$disconnect()
  }
}

test()
