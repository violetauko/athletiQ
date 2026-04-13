import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);

    // 1. Athletes Supported (Total Athletes)
    const athletesSupported = await prisma.athleteProfile.count();

    // 2. Raised This Year
    const donationsThisYear = await prisma.donation.aggregate({
      where: {
        status: 'PAID',
        paidAt: {
          gte: startOfYear,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const raisedKes = donationsThisYear._sum.amount ?? 0
    const raisedFormatted = formatCurrency(raisedKes, 'KES', false)

    // 3. Scholarships Funded (Using Applications with ACCEPTED status)
    const scholarshipsFunded = await prisma.application.count({
      where: {
        status: 'ACCEPTED'
      }
    });

    // 4. Placed in Programs (Percentage of ACCEPTED)
    const totalApplications = await prisma.application.count();
    let placedPercentage = "0%";
    if (totalApplications > 0) {
      const percentage = Math.round((scholarshipsFunded / totalApplications) * 100);
      placedPercentage = `${percentage}%`;
    }

    return NextResponse.json({
      athletesSupported: athletesSupported > 0 ? athletesSupported.toString() : '0',
      raisedThisYear: raisedKes > 0 ? raisedFormatted : formatCurrency(0, 'KES', false),
      scholarshipsFunded: scholarshipsFunded > 0 ? scholarshipsFunded.toString() : '0',
      placedInPrograms: totalApplications > 0 ? placedPercentage : '0%',
    });
  } catch (error) {
    console.error('Error fetching donation stats:', error);
    return NextResponse.json({
      athletesSupported: '0',
      raisedThisYear: formatCurrency(0, 'KES', false),
      scholarshipsFunded: '0',
      placedInPrograms: '0%',
    });
  }
}
