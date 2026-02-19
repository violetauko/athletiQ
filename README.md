
# AthletiQ - Athlete Recruitment Platform

A modern, full-stack athlete recruitment platform built with Next.js 14, React Query, Prisma, and PostgreSQL. AthletiQ connects talented athletes with sports organizations worldwide.

## 🏆 Features

### ✅ Fully Implemented
- **Homepage**: Hero section, featured opportunities, categories, team showcase, testimonials
- **Opportunity System**: 
  - Listing page with search and filters
  - Detailed opportunity pages with full information
  - Application form with file uploads
- **Athlete System**:
  - Athlete listing and search
  - Detailed athlete profiles with stats and achievements
  - Performance analytics display
- **Dashboard**: Athlete dashboard with stats, applications tracking, and profile management
- **Navigation**: Responsive header and footer with complete navigation
- **Static Pages**: About, Contact with forms and information
- **Database**: Complete PostgreSQL schema with Prisma ORM
- **API Routes**: RESTful endpoints for opportunities
- **React Query**: Optimized data fetching with custom hooks
- **Type-Safe**: Full TypeScript implementation throughout
- **Responsive Design**: Mobile-first, works on all devices
- **Animations**: Smooth page transitions and hover effects

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Component Library**: shadcn/ui (Radix UI)
- **State Management**: React Query (TanStack Query)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Language**: TypeScript
- **Icons**: Lucide React

## 📦 Project Structure

```
athletiq/
├── app/                      # Next.js app directory
│   ├── opportunities/        # Opportunities pages
│   ├── athletes/            # Athletes pages
│   ├── about/               # About page
│   ├── contact/             # Contact page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Homepage
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── layout/              # Layout components (Header, Footer)
│   ├── opportunities/       # Opportunity-related components
│   ├── athletes/            # Athlete-related components
│   └── shared/              # Shared components
├── lib/                     # Utility functions
│   ├── prisma.ts           # Prisma client
│   ├── utils.ts            # Helper functions
│   └── react-query-provider.tsx
├── prisma/                  # Database schema and migrations
│   └── schema.prisma       # Prisma schema
├── public/                  # Static assets
├── .env.example            # Environment variables template
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd athletiq
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your database connection string:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/athletiq?schema=public"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev --name init
   
   # (Optional) Seed the database
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

### Key Models

- **User**: Authentication and user management
  - Role-based access (Athlete, Recruiter, Admin)
  
- **AthleteProfile**: Athlete information and stats
  - Personal details, sports, achievements, media
  
- **RecruiterProfile**: Organization and recruiter info
  
- **Opportunity**: Job/opportunity postings
  - Sport, location, salary, requirements
  
- **Application**: Athlete applications to opportunities
  - Status tracking, cover letters, notes

### Database Commands

```bash
# View database in Prisma Studio
npx prisma studio

# Create a new migration
npx prisma migrate dev --name <migration-name>

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Deploy migrations to production
npx prisma migrate deploy
```

## 🎨 Design System

The platform uses a custom design system inspired by athletic aesthetics:

### Color Palette
- **Primary**: Black (#000000) - Bold, professional
- **Secondary**: Amber/Stone gradients - Warm, energetic
- **Accent**: Various sport-specific colors

### Typography
- **Headings**: Bold, impactful
- **Body**: Clean, readable (Inter font family)

### Components
All UI components are built with shadcn/ui and customized for the athletic theme:
- Cards with gradient backgrounds
- Rounded buttons for CTAs
- Hover animations and transitions
- Responsive grid layouts

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Database
npx prisma studio    # Open Prisma Studio
npx prisma generate  # Generate Prisma Client
npx prisma migrate dev  # Run migrations

# Linting
npm run lint         # Run ESLint
```

## 📝 API Routes (To be implemented)

```
/api/opportunities
  - GET: List all opportunities
  - POST: Create new opportunity (Recruiter only)

/api/opportunities/[id]
  - GET: Get single opportunity
  - PATCH: Update opportunity
  - DELETE: Delete opportunity

/api/athletes
  - GET: List all athletes
  - POST: Create athlete profile

/api/applications
  - GET: List applications
  - POST: Submit application
```

## 🔐 Authentication (To be added)

The platform will support:
- Email/Password authentication
- OAuth providers (Google, LinkedIn)
- Role-based access control
- JWT tokens for API authentication

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Environment Variables for Production

```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-key"
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Design inspired by modern recruitment platforms
- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

## 📞 Support

For support, email support@athletiq.com or open an issue in the repository.

---

**Made with ❤️ by the AthletiQ Team**