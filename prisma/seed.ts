import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Mulai seeding data...')

    // 1. Create Categories
    const categories = [
        'Minuman',
        'Makanan',
        'Snack',
        'Obat-obatan',
        'Alat Tulis',
        'Elektronik'
    ]

    const categoryObjects: any = {}
    for (const categoryName of categories) {
        let category = await prisma.category.findFirst({
            where: { name: categoryName }
        })
        if (!category) {
            category = await prisma.category.create({
                data: { name: categoryName }
            })
        }
        categoryObjects[categoryName] = category
    }

    console.log('✓ Kategori berhasil dibuat:', categories.join(', '))

    // 2. Create Suppliers
    const suppliers = [
        { name: 'PT Sumber Rezeki', contact: '021-5551234', email: 'info@sumberrezeki.com', address: 'Jl. Sudirman No. 123, Jakarta' },
        { name: 'CV Maju Jaya', contact: '022-7778888', email: 'maju@jaya.co.id', address: 'Jl. Gatot Subroto 45, Bandung' },
        { name: 'Toko Berkah Selalu', contact: '031-9991122', email: 'berkah@selalu.com', address: 'Jl. Basuki Rahmat 78, Surabaya' },
        { name: 'UD Sinar Terang', contact: '024-3334455', email: 'sinar@terang.id', address: 'Jl. Pemuda 90, Semarang' }
    ]

    const supplierObjects: any = {}
    for (const supplierData of suppliers) {
        let supplier = await prisma.supplier.findFirst({
            where: { name: supplierData.name }
        })
        if (!supplier) {
            supplier = await prisma.supplier.create({
                data: supplierData
            })
        }
        supplierObjects[supplierData.name] = supplier
    }

    console.log('✓ Supplier berhasil dibuat:', suppliers.map(s => s.name).join(', '))

    // 3. Create Products
    const products = [
        // Minuman
        { sku: 'MIN-001', name: 'Kopi Susu Dingin', description: 'Kopi premium dengan susu segar', price: 15000, stock: 100, category: 'Minuman', supplier: 'PT Sumber Rezeki' },
        { sku: 'MIN-002', name: 'Teh Manis Panas', description: 'Teh hangat dengan gula', price: 8000, stock: 150, category: 'Minuman', supplier: 'PT Sumber Rezeki' },
        { sku: 'MIN-003', name: 'Jus Jeruk Segar', description: 'Jus jeruk asli tanpa pengawet', price: 12000, stock: 80, category: 'Minuman', supplier: 'CV Maju Jaya' },
        { sku: 'MIN-004', name: 'Es Teh Manis', description: 'Teh dingin dengan es batu', price: 7000, stock: 200, category: 'Minuman' },
        { sku: 'MIN-005', name: 'Air Mineral Botol', description: 'Air mineral 600ml', price: 5000, stock: 300, category: 'Minuman', supplier: 'Toko Berkah Selalu' },

        // Makanan
        { sku: 'MKN-001', name: 'Nasi Goreng Spesial', description: 'Nasi goreng dengan telur dan ayam', price: 25000, stock: 50, category: 'Makanan', supplier: 'PT Sumber Rezeki' },
        { sku: 'MKN-002', name: 'Mie Goreng', description: 'Mie goreng pedas dengan sayuran', price: 20000, stock: 60, category: 'Makanan', supplier: 'PT Sumber Rezeki' },
        { sku: 'MKN-003', name: 'Ayam Geprek', description: 'Ayam crispy dengan sambal geprek', price: 22000, stock: 45, category: 'Makanan', supplier: 'CV Maju Jaya' },
        { sku: 'MKN-004', name: 'Soto Ayam', description: 'Soto ayam dengan nasi', price: 18000, stock: 40, category: 'Makanan' },
        { sku: 'MKN-005', name: 'Bakso Urat', description: 'Bakso urat sapi dengan mie', price: 20000, stock: 35, category: 'Makanan', supplier: 'Toko Berkah Selalu' },

        // Snack
        { sku: 'SNK-001', name: 'Keripik Singkong', description: 'Keripik singkong pedas manis', price: 10000, stock: 120, category: 'Snack', supplier: 'CV Maju Jaya' },
        { sku: 'SNK-002', name: 'Kacang Kulit', description: 'Kacang kulit goreng asin', price: 8000, stock: 150, category: 'Snack', supplier: 'CV Maju Jaya' },
        { sku: 'SNK-003', name: 'Roti Bakar Coklat', description: 'Roti tawar bakar dengan selai coklat', price: 12000, stock: 80, category: 'Snack' },
        { sku: 'SNK-004', name: 'Pisang Goreng', description: 'Pisang goreng crispy', price: 10000, stock: 90, category: 'Snack', supplier: 'Toko Berkah Selalu' },
        { sku: 'SNK-005', name: 'Gorengan Mix', description: 'Tahu, tempe, bakwan campur', price: 15000, stock: 70, category: 'Snack' },

        // Obat-obatan
        { sku: 'OBT-001', name: 'Paracetamol 500mg', description: 'Obat penurun panas dan pereda nyeri', price: 5000, stock: 200, category: 'Obat-obatan', supplier: 'UD Sinar Terang' },
        { sku: 'OBT-002', name: 'Vitamin C 1000mg', description: 'Suplemen vitamin C', price: 15000, stock: 150, category: 'Obat-obatan', supplier: 'UD Sinar Terang' },
        { sku: 'OBT-003', name: 'Obat Batuk Sirup', description: 'Sirup obat batuk herbal', price: 25000, stock: 80, category: 'Obat-obatan', supplier: 'UD Sinar Terang' },
        { sku: 'OBT-004', name: 'Minyak Angin', description: 'Minyak angin aromaterapi', price: 12000, stock: 100, category: 'Obat-obatan' },
        { sku: 'OBT-005', name: 'Plester Luka', description: 'Plester luka steril 10 pcs', price: 8000, stock: 120, category: 'Obat-obatan', supplier: 'UD Sinar Terang' },

        // Alat Tulis
        { sku: 'ATK-001', name: 'Pulpen Biru', description: 'Pulpen tinta biru 0.7mm', price: 3000, stock: 500, category: 'Alat Tulis', supplier: 'Toko Berkah Selalu' },
        { sku: 'ATK-002', name: 'Buku Tulis 38 Lembar', description: 'Buku tulis bergaris', price: 7000, stock: 300, category: 'Alat Tulis', supplier: 'Toko Berkah Selalu' },
        { sku: 'ATK-003', name: 'Penghapus Putih', description: 'Penghapus karet putih', price: 2000, stock: 400, category: 'Alat Tulis' },
        { sku: 'ATK-004', name: 'Penggaris 30cm', description: 'Penggaris plastik transparan', price: 5000, stock: 200, category: 'Alat Tulis', supplier: 'Toko Berkah Selalu' },
        { sku: 'ATK-005', name: 'Spidol Hitam', description: 'Spidol permanent hitam', price: 8000, stock: 250, category: 'Alat Tulis' },

        // Elektronik
        { sku: 'ELK-001', name: 'Kabel USB Type-C', description: 'Kabel USB Type-C 1 meter', price: 25000, stock: 100, category: 'Elektronik', supplier: 'CV Maju Jaya' },
        { sku: 'ELK-002', name: 'Earphone Basic', description: 'Earphone 3.5mm jack', price: 35000, stock: 80, category: 'Elektronik', supplier: 'CV Maju Jaya' },
        { sku: 'ELK-003', name: 'Powerbank 10000mAh', description: 'Powerbank portable 10000mAh', price: 150000, stock: 50, category: 'Elektronik', supplier: 'CV Maju Jaya' },
        { sku: 'ELK-004', name: 'Charger 2A', description: 'Charger 2 Ampere fast charging', price: 40000, stock: 120, category: 'Elektronik' },
        { sku: 'ELK-005', name: 'Lampu LED 5W', description: 'Lampu LED hemat energi', price: 20000, stock: 150, category: 'Elektronik', supplier: 'UD Sinar Terang' }
    ]

    for (const productData of products) {
        await prisma.product.upsert({
            where: { sku: productData.sku },
            update: {},
            create: {
                sku: productData.sku,
                name: productData.name,
                description: productData.description,
                price: productData.price,
                stock: productData.stock,
                categoryId: categoryObjects[productData.category].id,
                supplierId: productData.supplier ? supplierObjects[productData.supplier]?.id : null
            }
        })
    }

    console.log('✓ Produk berhasil dibuat: ' + products.length + ' items')

    // 4. Create Users (Admin & Cashiers)
    const hashedPassword = await bcrypt.hash('password123', 10)

    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: { password: hashedPassword },
        create: {
            username: 'admin',
            password: hashedPassword,
            name: 'Administrator',
            role: 'ADMIN',
        },
    })

    const cashiers = [
        { username: 'kasir1', name: 'Budi Santoso' },
        { username: 'kasir2', name: 'Siti Nurhaliza' },
        { username: 'kasir3', name: 'Ahmad Fauzi' },
        { username: 'kasir4', name: 'Dewi Lestari' }
    ]

    for (const cashierData of cashiers) {
        await prisma.user.upsert({
            where: { username: cashierData.username },
            update: { password: hashedPassword },
            create: {
                username: cashierData.username,
                password: hashedPassword,
                name: cashierData.name,
                role: 'CASHIER',
            },
        })
    }

    console.log('✓ User berhasil dibuat: 1 admin, ' + cashiers.length + ' kasir')

    // 5. Create Members
    const members = [
        { name: 'Andi Wijaya', phone: '081234567890', email: 'andi.wijaya@email.com', points: 250 },
        { name: 'Rina Kusuma', phone: '081234567891', email: 'rina.kusuma@email.com', points: 180 },
        { name: 'Budi Prabowo', phone: '081234567892', email: 'budi.prabowo@email.com', points: 320 },
        { name: 'Sari Indah', phone: '081234567893', email: 'sari.indah@email.com', points: 150 },
        { name: 'Joko Susanto', phone: '081234567894', email: 'joko.susanto@email.com', points: 420 },
        { name: 'Lina Marlina', phone: '081234567895', email: 'lina.marlina@email.com', points: 90 },
        { name: 'Hendra Gunawan', phone: '081234567896', email: 'hendra.gunawan@email.com', points: 275 },
        { name: 'Maya Sari', phone: '081234567897', email: 'maya.sari@email.com', points: 380 }
    ]

    for (const memberData of members) {
        await prisma.member.upsert({
            where: { phone: memberData.phone },
            update: {},
            create: memberData
        })
    }

    console.log('✓ Member berhasil dibuat: ' + members.length + ' members')

    console.log('\n🎉 Seeding selesai! Database berhasil diisi dengan data.')
    console.log('📝 Login credentials:')
    console.log('   Admin    → username: admin, password: password123')
    console.log('   Kasir 1  → username: kasir1, password: password123')
    console.log('   Kasir 2  → username: kasir2, password: password123')
    console.log('   Kasir 3  → username: kasir3, password: password123')
    console.log('   Kasir 4  → username: kasir4, password: password123')
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
