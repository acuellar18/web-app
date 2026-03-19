import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { resolve } from 'path'

async function test() {
  console.log('Starting test with better-sqlite3 factory (v7 fix attempt 2)...')
  const dbPath = resolve(process.cwd(), 'dev.db').replace(/\\/g, '/')
  
  // Attempt 2: Pass the factory DIRECTLY
  const adapter = new PrismaBetterSqlite3({ url: dbPath })
  const prisma = new PrismaClient({ adapter })

  try {
    console.log('Attempting to count products...')
    const count = await prisma.product.count()
    console.log('SUCCESS! Found ' + count + ' products')
  } catch (err) {
    console.log('--- ERROR START ---')
    console.log('Name:', err.name)
    console.log('Message:', err.message)
    console.log('--- ERROR END ---')
  } finally {
    await prisma.$disconnect()
  }
}

test()
