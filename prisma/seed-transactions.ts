import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding dummy transactions...')

    // Get users and products
    const admin = await prisma.user.findUnique({ where: { username: 'admin' } })
    const cashier1 = await prisma.user.findUnique({ where: { username: 'kasir1' } })
    const products = await prisma.product.findMany()

    if (!admin || !cashier1 || products.length === 0) {
        console.error('Please run the main seed first to create users and products.')
        return
    }

    const users = [admin, cashier1]

    // Create transactions for the last 7 days
    for (let i = 0; i < 10; i++) {
        const user = users[Math.floor(Math.random() * users.length)]
        const numItems = Math.floor(Math.random() * 3) + 1
        let total = 0
        const items = []

        for (let j = 0; j < numItems; j++) {
            const product = products[Math.floor(Math.random() * products.length)]
            const quantity = Math.floor(Math.random() * 2) + 1
            total += product.price * quantity
            items.push({
                productId: product.id,
                quantity,
                price: product.price
            })
        }

        const date = new Date()
        date.setDate(date.getDate() - Math.floor(Math.random() * 7)) // Random date within last 7 days

        const transaction = await prisma.transaction.create({
            data: {
                invoiceId: `INV-DUMMY-${Date.now()}-${i}`,
                total,
                subtotal: total,
                tax: 0,
                discount: 0,
                paymentMethod: 'CASH',
                amountReceived: total,
                change: 0,
                userId: user.id,
                createdAt: date,
                items: {
                    create: items
                }
            }
        })
        console.log(`Created transaction ${transaction.invoiceId} for ${user.username} on ${date.toISOString()}`)
    }

    console.log('Dummy transactions seeded successfully!')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
