import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        // 1. Get Today's Date Range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // 2. Run queries in parallel for performance
        const [
            totalSalesAllTime,
            totalSalesToday,
            totalTransactions,
            lowStockCount,
            recentTransactions
        ] = await Promise.all([
            // A. Total Sales (All Time)
            prisma.transaction.aggregate({
                _sum: { total: true },
            }),

            // B. Total Sales (Today)
            prisma.transaction.aggregate({
                _sum: { total: true },
                where: {
                    createdAt: {
                        gte: today,
                        lt: tomorrow,
                    },
                },
            }),

            // C. Total Transactions Count
            prisma.transaction.count(),

            // D. Low Stock Products (<= 5)
            prisma.product.count({
                where: {
                    stock: { lte: 5 },
                },
            }),

            // E. Recent Transactions (Limit 5)
            prisma.transaction.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                include: {
                    user: { select: { name: true } },
                },
            }),
        ]);

        // 5. Chart Data (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const recentSales = await prisma.transaction.groupBy({
            by: ['createdAt'],
            where: {
                createdAt: {
                    gte: sevenDaysAgo,
                },
            },
            _sum: {
                total: true,
            },
        });

        // Format data for chart
        const chartData = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD

            // Find sales for this date
            const salesForDay = recentSales.filter(s =>
                s.createdAt.toISOString().split('T')[0] === dateStr
            ).reduce((acc, curr) => acc + (curr._sum.total || 0), 0);

            chartData.push({
                date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                sales: salesForDay
            });
        }
        chartData.reverse(); // Show oldest to newest

        return NextResponse.json({
            totalSales: totalSalesAllTime._sum.total || 0,
            todaySales: totalSalesToday._sum.total || 0,
            totalTransactions,
            lowStockCount,
            recentTransactions,
            chartData // Add chart data to response
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch dashboard statistics" },
            { status: 500 }
        );
    }
}
