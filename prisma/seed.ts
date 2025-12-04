import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding...')

    // 1. Create Categories
    let drinks = await prisma.category.findFirst({
        where: { name: 'Drinks' }
    })
    if (!drinks) {
        drinks = await prisma.category.create({
            data: { name: 'Drinks' }
        })
    }

    let food = await prisma.category.findFirst({
        where: { name: 'Food' }
    })
    if (!food) {
        food = await prisma.category.create({
            data: { name: 'Food' }
        })
    }

    let snacks = await prisma.category.findFirst({
        where: { name: 'Snacks' }
    })
    if (!snacks) {
        snacks = await prisma.category.create({
            data: { name: 'Snacks' }
        })
    }

    let medicine = await prisma.category.findFirst({
        where: { name: 'Medicine' }
    })
    if (!medicine) {
        medicine = await prisma.category.create({
            data: { name: 'Medicine' }
        })
    }

    console.log('Created categories:', drinks.name, food.name, snacks.name, medicine.name)

    // 2. Create Products
    const coffee = await prisma.product.upsert({
        where: { sku: 'DRINK-001' },
        update: {},
        create: {
            sku: 'DRINK-001',
            name: 'Iced Coffee',
            description: 'Cold brew with milk',
            price: 15000,
            stock: 100,
            categoryId: drinks.id,
        },
    })

    const friedRice = await prisma.product.upsert({
        where: { sku: 'FOOD-001' },
        update: {},
        create: {
            sku: 'FOOD-001',
            name: 'Fried Rice',
            description: 'Special fried rice with egg',
            price: 25000,
            stock: 50,
            categoryId: food.id,
        },
    })

    console.log('Created products:', coffee.name, friedRice.name)

    // 3. Create Users (Admin & Cashier)
    const hashedPassword = await bcrypt.hash('password123', 10)

    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {
            password: hashedPassword, // Update password if user exists
        },
        create: {
            username: 'admin',
            password: hashedPassword,
            name: 'Admin User',
            role: 'ADMIN',
        },
    })

    const cashier = await prisma.user.upsert({
        where: { username: 'cashier' },
        update: {
            password: hashedPassword, // Update password if user exists
        },
        create: {
            username: 'cashier',
            password: hashedPassword,
            name: 'Cashier User',
            role: 'CASHIER',
        },
    })

    console.log('Created users:', admin.username, cashier.username)

    // 4. Create a Member
    const member = await prisma.member.upsert({
        where: { phone: '08123456789' },
        update: {},
        create: {
            name: 'John Doe',
            phone: '08123456789',
            email: 'john@example.com',
            points: 10,
        },
    })

    console.log('Created member:', member.name)

    console.log('Seeding finished.')
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
