// app/api/admin/donations/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { Prisma } from '@prisma/client'
import { getDonationStats } from '@/lib/donations'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Filters
    const status = searchParams.get('status')
    const tierId = searchParams.get('tierId')
    const donorEmail = searchParams.get('donorEmail')
    const donorName = searchParams.get('donorName')
    const minAmount = searchParams.get('minAmount')
    const maxAmount = searchParams.get('maxAmount')
    const currency = searchParams.get('currency')
    const isCustom = searchParams.get('isCustom')
    const userId = searchParams.get('userId')
    
    // Date range filters
    const dateRange = searchParams.get('dateRange')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build where clause
    let whereClause: any = {}

    // Status filter
    if (status && status !== 'ALL') {
      whereClause.status = status
    }

    // Tier filter
    if (tierId && tierId !== 'ALL') {
      whereClause.tierId = tierId
    }

    // Custom amount filter
    if (isCustom !== null) {
      whereClause.isCustom = isCustom === 'true'
    }

    // Currency filter
    if (currency && currency !== 'ALL') {
      whereClause.currency = currency
    }

    // User filter
    if (userId) {
      whereClause.userId = userId
    }

    // Donor email filter (partial match)
    if (donorEmail) {
      whereClause.donorEmail = {
        contains: donorEmail,
        mode: 'insensitive'
      }
    }

    // Donor name filter (partial match)
    if (donorName) {
      whereClause.donorName = {
        contains: donorName,
        mode: 'insensitive'
      }
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      whereClause.amount = {}
      if (minAmount) {
        whereClause.amount.gte = parseInt(minAmount)
      }
      if (maxAmount) {
        whereClause.amount.lte = parseInt(maxAmount)
      }
    }

    // Date range filter
    let dateFilter: any = {}
    const now = new Date()

    // Predefined date ranges
    if (dateRange) {
      switch (dateRange) {
        case 'today':
          dateFilter = {
            gte: new Date(now.setHours(0, 0, 0, 0))
          }
          break
        case 'yesterday':
          const yesterday = new Date(now)
          yesterday.setDate(yesterday.getDate() - 1)
          dateFilter = {
            gte: new Date(yesterday.setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(0, 0, 0, 0))
          }
          break
        case 'week':
          dateFilter = {
            gte: new Date(now.setDate(now.getDate() - 7))
          }
          break
        case 'month':
          dateFilter = {
            gte: new Date(now.setMonth(now.getMonth() - 1))
          }
          break
        case 'quarter':
          dateFilter = {
            gte: new Date(now.setMonth(now.getMonth() - 3))
          }
          break
        case 'year':
          dateFilter = {
            gte: new Date(now.setFullYear(now.getFullYear() - 1))
          }
          break
        case 'custom':
          if (startDate) {
            dateFilter.gte = new Date(startDate)
          }
          if (endDate) {
            dateFilter.lte = new Date(endDate)
          }
          break
      }
    }

    // Apply date filter
    if (Object.keys(dateFilter).length > 0) {
      whereClause.createdAt = dateFilter
    }

    // Build orderBy clause
    let orderByClause: any = {}
    switch (sortBy) {
      case 'amount':
        orderByClause.amount = sortOrder
        break
      case 'status':
        orderByClause.status = sortOrder
        break
      case 'donorName':
        orderByClause.donorName = sortOrder
        break
      case 'tierId':
        orderByClause.tierId = sortOrder
        break
      case 'createdAt':
      default:
        orderByClause.createdAt = sortOrder
        break
    }

    // Execute queries
    const [donations, totalCount, stats] = await Promise.all([
      prisma.donation.findMany({
        where: whereClause,
        include: {
          user: true
        },
        orderBy: orderByClause,
        skip,
        take: limit,
      }),
      prisma.donation.count({ where: whereClause }),
      getDonationStats(whereClause)
    ])

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      donations,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      stats
    })

  } catch (error) {
    console.error('Error fetching donations:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

