import { 
  PrismaClient, 
  OpportunityStatus,
} from '@prisma/client'


const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sports
  const sports = [
    { name: 'Rugby', description: 'Team sport'},
    { name: 'Basketball', description: 'Team sport played on a court' },
    { name: 'Soccer', description: 'Football played with feet' },
    { name: 'Track & Field', description: 'Athletics and running events' },
    { name: 'Swimming', description: 'Aquatic sports' },
    { name: 'Tennis', description: 'Racket sport' },
    { name: 'Baseball', description: 'Bat and ball game' },
    { name: 'Volleyball', description: 'Team sport with net' },
    { name: 'American Football', description: 'Contact team sport' },
  ]

  for (const sport of sports) {
    await prisma.sport.upsert({
      where: { name: sport.name },
      update: {},
      create: sport,
    })
  }

  console.log('✅ Sports created')

  // Create categories
  const categories = [
    {
      name: 'Professional Sports',
      description: 'Professional athlete positions',
      imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
    },
    {
      name: 'College Athletics',
      description: 'College-level sports programs',
      imageUrl: 'https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?w=600&q=80',
    },
    {
      name: 'Coaching & Training',
      description: 'Coaching positions',
      imageUrl: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&q=80',
    },
    {
      name: 'Sports Science',
      description: 'Performance analysis and sports science',
      imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
    },
    {
      name: 'Sports Management',
      description: 'Management and administrative roles',
      imageUrl: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=600&q=80',
    },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    })
  }

  console.log('✅ Categories created')

  // Create sample users
  const recruiterUser = await prisma.user.upsert({
    where: { email: 'recruiter@athletiq.com' },
    update: {},
    create: {
      email: 'recruiter@athletiq.com',
      name: 'John Recruiter',
      password: '$2b$12$oJPBFp/WRH6Q0EUtEd/9hOJfyCmwCic4FTmn/zEo4KbZU1zCJY.Ha', // In production, use proper password hashing
      role: 'CLIENT',
    },
  })

  const athleteUser = await prisma.user.upsert({
    where: { email: 'athlete@athletiq.com' },
    update: {},
    create: {
      email: 'athlete@athletiq.com',
      name: 'Jane Athlete',
      password: '$2b$12$oJPBFp/WRH6Q0EUtEd/9hOJfyCmwCic4FTmn/zEo4KbZU1zCJY.Ha',
      role: 'ATHLETE',
    },
  })

  console.log('✅ Users created')

  // Create client profile
  const clientProfile = await prisma.clientProfile.upsert({
    where: { userId: recruiterUser.id },
    update: {},
    create: {
      userId: recruiterUser.id,
      organization: 'Elite Sports Management',
      title: 'Senior Recruiter',
      phone: '+1-555-0100',
      bio: 'Experienced sports recruiter with 10+ years in the industry.',
    },
  })

  console.log('✅ Recruiter profile created')

  // Create athlete profile
  await prisma.athleteProfile.upsert({
    where: { userId: athleteUser.id },
    update: {},
    create: {
      userId: athleteUser.id,
      firstName: 'Jane',
      lastName: 'Athlete',
      dateOfBirth: new Date('2000-01-15'),
      gender: 'FEMALE',
      phone: '+1-555-0101',
      location: 'Los Angeles, CA',
      bio: 'Dedicated athlete with passion for basketball',
      height: 180,
      weight: 70,
      primarySport: 'Basketball',
      secondarySports: ['Track & Field'],
      position: 'Point Guard',
      experience: 'Advanced',
      achievements: [
        'State Championship Winner 2022',
        'MVP Award 2023',
        'All-Star Team 2023',
      ],
      gpa: 3.8,
      graduationYear: 2024,
      currentSchool: 'UCLA',
    },
  })

  console.log('✅ Athlete profile created')

  // Create sample opportunities
  const opportunities = [
    {
      clientId: clientProfile.id,
      title: 'Professional Basketball Player',
      sport: 'Basketball',
      category: 'Professional Sports',
      location: 'Los Angeles, California',
      city: 'Los Angeles',
      type: 'Full Time',
      salaryMin: 60000,
      salaryMax: 80000,
      description: 'Seeking talented basketball players for professional team. Excellent benefits and training facilities.',
      requirements: [
        'Minimum 5 years playing experience',
        'College or professional experience',
        'Excellent physical condition',
        'Team player mentality',
      ],
      benefits: [
        'Health insurance',
        'Performance bonuses',
        'Training facilities access',
        'Career development',
      ],
      status: OpportunityStatus.ACTIVE,
      deadline: new Date('2026-06-01'),
    },
    {
      clientId: clientProfile.id,
      title: 'Swimming Coach',
      sport: 'Swimming',
      category: 'Coaching & Training',
      location: 'Miami, Florida',
      city: 'Miami',
      type: 'Full Time',
      salaryMin: 45000,
      salaryMax: 60000,
      description: 'Lead our competitive swimming program. Experience with youth athletes preferred.',
      requirements: [
        'Coaching certification',
        'Minimum 3 years coaching experience',
        'Strong communication skills',
      ],
      benefits: [
        'Health benefits',
        'Paid vacation',
        'Professional development',
      ],
      status: OpportunityStatus.ACTIVE,
      deadline: new Date('2026-05-15'),
    },
  ]

  for (const opp of opportunities) {
    await prisma.opportunity.create({
      data: opp,
    })
  }

  console.log('✅ Opportunities created')
  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })