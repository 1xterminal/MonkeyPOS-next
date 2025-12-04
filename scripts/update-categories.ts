
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting category update...');

    const updates = [
        { old: 'Foods', new: 'Makanan' },
        { old: 'Drinks', new: 'Minuman' },
        { old: 'Snacks', new: 'Camilan' },
        { old: 'Medicine', new: 'Obat-obatan' },
    ];

    for (const update of updates) {
        const category = await prisma.category.findFirst({
            where: { name: update.old },
        });

        if (category) {
            await prisma.category.update({
                where: { id: category.id },
                data: { name: update.new },
            });
            console.log(`Updated category: ${update.old} -> ${update.new}`);
        } else {
            console.log(`Category not found: ${update.old}`);
        }
    }

    console.log('Category update finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
