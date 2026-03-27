export type UserRole = 'ATHLETE' | 'CLIENT' | 'ADMIN';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type OpportunityStatus = 'ACTIVE' | 'CLOSED' | 'DRAFT' | 'PENDING_APPROVAL';
export type ApplicationStatus = 'PENDING' | 'REVIEWING' | 'SHORTLISTED' | 'INTERVIEWED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: UserRole;
}

export interface ClientProfile {
  id: string;
  organization: string;
  title: string;
  user?: User;
}

export interface Opportunity {
  id: string;
  title: string;
  sport: string;
  type: string;
  location: string;
  description: string;
  status: OpportunityStatus;
  postedDate: string;
  salaryMin?: number;
  salaryMax?: number;
  category: string;
  requirements: string[];
  benefits: string[];
  deadline?: string;
  client: ClientProfile;
  ClientProfile?: ClientProfile;
  responsibilities: string[];
  imageUrl?: string;
  createdAt?: string;
  count?: number;
}

// app/types/athlete.ts

export interface Application {
  id: string;
  athleteId: string;
  opportunityId: string;
  userId: string;
  status: ApplicationStatus;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  city?: string;
  state?: string;
  address?: string;
  height?: number;
  weight?: number;
  position?: string;
  experience?: number;
  currentTeam?: string;
  achievements?: string;
  stats?: string;
  coverLetter?: string;
  resumeFileName?: string;
  portfolioFileNames?: string;
  additionalDocsFileNames?: string;
  notes?: string | null;
  appliedAt: string;
  updatedAt: string;
  Opportunity?: Opportunity
}
export interface AthleteProfile {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  phone: string | null;
  location: string | null;
  bio: string | null;
  primarySport: string;
  experience: string | null;
  profileImage: string | null;
  videoHighlights: string[];
  profileViews: number;
  user?: User;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  sender: User;
  receiver: User;
  opportunity?: {
    id: string;
    title: string;
  };
  createdAt: string;
}

export interface Conversation {
  counterpart: User;
  messages: Message[];
  lastUpdated: string;
}

export interface DashboardStats {
  profileViews: number;
  activeApplications: number;
  savedOpportunities: number;
  profileCompletion: number;
}

export interface AthleteDashboardData {
  stats: DashboardStats;
  recentApplications: {
    id: string;
    title: string;
    organization: string;
    status: string;
    appliedDate: string;
    location: string;
  }[];
  recommendedOpportunities: {
    id: string;
    title: string;
    organization: string;
    location: string;
    type: string;
    postedDate: string;
  }[];
}
export interface Sport {
  id: string
  name: string
  description?: string | null
  icon?: string | null
  category?: string | null
}
export interface OpportunityCardProps {
  id: string
  title: string
  sport: string
  category: string
  location: string
  city: string
  type: string
  salaryMin?: number | null
  salaryMax?: number | null
  description: string
  postedDate: Date
  isNew?: boolean
}