import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Connecting to database...");
        const products = await prisma.product.findMany({ take: 1 });
        console.log("Success! Found products:", products.length);
    } catch (e) {
        console.error("Error connecting to database:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
