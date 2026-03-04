// components/profile/client-overview.tsx
'use client';

import { format } from 'date-fns';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  Target,
  Users,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

interface ClientOverviewProps {
  profile: any;
}

export function ClientOverview({ profile }: ClientOverviewProps) {
  const getInitials = () => {
    return profile.organization
      ?.split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase() || 'C';
  };

  const getProfileCompletion = () => {
    const fields = [
      profile.organization,
      profile.title,
      profile.phone,
      profile.bio,
      profile.website,
      profile.address,
      profile.logo,
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  const getOpportunityStats = () => {
    const total = profile.opportunities?.length || 0;
    const active = profile.opportunities?.filter((o: any) => o.status === 'ACTIVE').length || 0;
    const totalApplications = profile.opportunities?.reduce(
      (acc: number, opp: any) => acc + (opp.applications?.length || 0),
      0
    ) || 0;

    return { total, active, totalApplications };
  };

  const stats = getOpportunityStats();
  const memberSince = format(new Date(profile.createdAt || profile.User?.createdAt), 'MMMM yyyy');

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Logo/Avatar */}
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.logo || ''} />
              <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
            </Avatar>
            
            {/* Organization Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{profile.organization}</h2>
                {profile.verified ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{profile.User?.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="w-4 h-4" />
                    <span>{profile.website}</span>
                  </div>
                )}
                {profile.address && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Member since {memberSince}</span>
                </div>
              </div>
            </div>

            {/* Profile Completion */}
            <div className="text-center md:text-right">
              <div className="text-3xl font-bold text-blue-600">{getProfileCompletion()}%</div>
              <p className="text-sm text-muted-foreground">Profile Complete</p>
              <Progress value={getProfileCompletion()} className="w-32 mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bio Section */}
      {profile.bio && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{profile.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Organization Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Organization Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Organization</dt>
                <dd className="font-medium">{profile.organization}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Your Title</dt>
                <dd className="font-medium">{profile.title || 'Not specified'}</dd>
              </div>
              {profile.website && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Website</dt>
                  <dd className="font-medium">
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Opportunity Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Opportunity Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total Posted</dt>
                <dd className="font-medium">{stats.total}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Active Listings</dt>
                <dd className="font-medium">{stats.active}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total Applications</dt>
                <dd className="font-medium">{stats.totalApplications}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Contact Information */}
      {(profile.phone || profile.address) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.phone && (
                <div>
                  <dt className="text-sm text-muted-foreground mb-1">Phone</dt>
                  <dd className="font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-stone-400" />
                    {profile.phone}
                  </dd>
                </div>
              )}
              {profile.address && (
                <div>
                  <dt className="text-sm text-muted-foreground mb-1">Address</dt>
                  <dd className="font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-stone-400" />
                    {profile.address}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
}