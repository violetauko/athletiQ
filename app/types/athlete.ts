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
}

export interface Application {
  id: string;
  status: ApplicationStatus;
  appliedAt: string;
  opportunity: Opportunity;
  opportunityId: string;
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
