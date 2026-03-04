// components/profile/athlete-overview.tsx
'use client';

import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Trophy,
  GraduationCap,
  Eye,
  Award,
  Target,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

interface AthleteOverviewProps {
  profile: any;
}

export function AthleteOverview({ profile }: AthleteOverviewProps) {
  const getInitials = () => {
    return `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase();
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getProfileCompletion = () => {
    const fields = [
      profile.firstName,
      profile.lastName,
      profile.dateOfBirth,
      profile.gender,
      profile.phone,
      profile.location,
      profile.bio,
      profile.height,
      profile.weight,
      profile.primarySport,
      profile.position,
      profile.experience,
      profile.gpa,
      profile.currentSchool,
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.profileImage || ''} />
              <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">
                  {profile.firstName} {profile.lastName}
                </h2>
                <Badge className="bg-green-100 text-green-800">
                  <Eye className="w-3 h-3 mr-1" />
                  {profile.profileViews} views
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{profile.User.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{calculateAge(profile.dateOfBirth)} years old</span>
                </div>
              </div>
            </div>

            <div className="text-center md:text-right">
              <div className="text-3xl font-bold text-amber-600">{getProfileCompletion()}%</div>
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
            <CardTitle>About Me</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{profile.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Physical Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Physical Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              {profile.height && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Height</dt>
                  <dd className="font-medium">{profile.height} cm</dd>
                </div>
              )}
              {profile.weight && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Weight</dt>
                  <dd className="font-medium">{profile.weight} kg</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Sports Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Sports Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Primary Sport</dt>
                <dd className="font-medium">{profile.primarySport}</dd>
              </div>
              {profile.position && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Position</dt>
                  <dd className="font-medium">{profile.position}</dd>
                </div>
              )}
              {profile.experience && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Experience Level</dt>
                  <dd className="font-medium">{profile.experience}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Academic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              {profile.currentSchool && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">School</dt>
                  <dd className="font-medium">{profile.currentSchool}</dd>
                </div>
              )}
              {profile.graduationYear && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Graduation Year</dt>
                  <dd className="font-medium">{profile.graduationYear}</dd>
                </div>
              )}
              {profile.gpa && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">GPA</dt>
                  <dd className="font-medium">{profile.gpa.toFixed(1)}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Secondary Sports */}
        {profile.secondarySports?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Secondary Sports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.secondarySports.map((sport: string) => (
                  <Badge key={sport} variant="outline">{sport}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Achievements */}
      {profile.achievements?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {profile.achievements.map((achievement: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <Trophy className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>{achievement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}