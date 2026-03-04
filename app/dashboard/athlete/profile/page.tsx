// 'use client'

// import { useState } from 'react'
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { AthleteProfile } from '@/app/types/athlete'
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
// import { Input } from '@/components/ui/input'
// import { Button } from '@/components/ui/button'
// import { Textarea } from '@/components/ui/textarea'
// import { Label } from '@/components/ui/label'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// interface ProfileUpdatePayload {
//     name: string;
//     firstName: string;
//     lastName: string;
//     dateOfBirth?: string;
//     gender: string;
//     phone: string;
//     location: string;
//     bio: string;
//     primarySport: string;
//     experience: string;
// }

// export default function AthleteProfilePage() {
//     const queryClient = useQueryClient()

//     // Form State (still needed for local editing before submission)
//     const [formData, setFormData] = useState({
//         name: '',
//         firstName: '',
//         lastName: '',
//         dateOfBirth: '',
//         gender: '',
//         phone: '',
//         location: '',
//         bio: '',
//         primarySport: '',
//         experience: ''
//     })

//     const { data: profile, isLoading: loading } = useQuery<AthleteProfile>({
//         queryKey: ['athlete-profile'],
//         queryFn: async () => {
//             const response = await fetch('/api/athlete/profile')
//             if (!response.ok) throw new Error('Failed to fetch profile')
//             const data = await response.json()

//             // Sync form data on load
//             setFormData({
//                 name: data.user?.name || '',
//                 firstName: data.firstName || '',
//                 lastName: data.lastName || '',
//                 dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
//                 gender: data.gender || '',
//                 phone: data.phone || '',
//                 location: data.location || '',
//                 bio: data.bio || '',
//                 primarySport: data.primarySport || '',
//                 experience: data.experience || ''
//             })
//             return data
//         }
//     })

//     const saveMutation = useMutation({
//         mutationFn: async (payload: ProfileUpdatePayload) => {
//             const response = await fetch('/api/athlete/profile', {
//                 method: 'PATCH',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(payload)
//             })

//             if (!response.ok) throw new Error('Failed to save profile')
//             return response.json()
//         },
//         onSuccess: () => {
//             alert("Profile saved successfully")
//             queryClient.invalidateQueries({ queryKey: ['athlete-profile'] })
//             queryClient.invalidateQueries({ queryKey: ['athlete-dashboard'] })
//         },
//         onError: () => {
//             alert("Failed to save profile")
//         }
//     })



//     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//         const { name, value } = e.target
//         setFormData(prev => ({ ...prev, [name]: value }))
//     }

//     const handleSelectChange = (name: string, value: string) => {
//         setFormData(prev => ({ ...prev, [name]: value }))
//     }

//     const handleSave = () => {
//         // Format date for Prisma
//         const payload = {
//             ...formData,
//             dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : undefined
//         }
//         saveMutation.mutate(payload)
//     }

//     const saving = saveMutation.isPending

//     if (loading) return <div className="text-center py-12">Loading profile...</div>
//     if (!profile) return <div className="text-center py-12">Profile not found.</div>

//     return (
//         <div className="min-h-screen">
//             <div className="container mx-auto space-y-8">
//                 {/* <h1 className="text-3xl font-bold">My Profile</h1> */}

//                 <Card>
//                     <CardHeader>
//                         <CardTitle>Personal Information</CardTitle>
//                         <CardDescription>Update your basic personal details.</CardDescription>
//                     </CardHeader>
//                     <CardContent className="space-y-4">
//                         <div className="grid grid-cols-2 gap-4">
//                             <div className="space-y-2">
//                                 <Label>First Name</Label>
//                                 <Input name="firstName" value={formData.firstName} onChange={handleChange} />
//                             </div>
//                             <div className="space-y-2">
//                                 <Label>Last Name</Label>
//                                 <Input name="lastName" value={formData.lastName} onChange={handleChange} />
//                             </div>
//                         </div>

//                         <div className="space-y-2">
//                             <Label>Display Name</Label>
//                             <Input name="name" value={formData.name} onChange={handleChange} />
//                         </div>

//                         <div className="grid grid-cols-2 gap-4">
//                             <div className="space-y-2">
//                                 <Label>Date of Birth</Label>
//                                 <Input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
//                             </div>
//                             <div className="space-y-2">
//                                 <Label>Gender</Label>
//                                 <Select value={formData.gender} onValueChange={(val: string) => handleSelectChange('gender', val)}>
//                                     <SelectTrigger>
//                                         <SelectValue placeholder="Select gender" />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         <SelectItem value="MALE">Male</SelectItem>
//                                         <SelectItem value="FEMALE">Female</SelectItem>
//                                         <SelectItem value="OTHER">Other</SelectItem>
//                                     </SelectContent>
//                                 </Select>
//                             </div>
//                         </div>

//                         <div className="grid grid-cols-2 gap-4">
//                             <div className="space-y-2">
//                                 <Label>Phone Number</Label>
//                                 <Input name="phone" value={formData.phone} onChange={handleChange} />
//                             </div>
//                             <div className="space-y-2">
//                                 <Label>Location</Label>
//                                 <Input name="location" value={formData.location} onChange={handleChange} placeholder="City, State" />
//                             </div>
//                         </div>

//                         <div className="space-y-2">
//                             <Label>Bio</Label>
//                             <Textarea
//                                 name="bio"
//                                 value={formData.bio}
//                                 onChange={handleChange}
//                                 placeholder="Tell us a bit about yourself..."
//                                 className="min-h-25"
//                             />
//                         </div>
//                     </CardContent>
//                 </Card>

//                 <Card>
//                     <CardHeader>
//                         <CardTitle>Athletic Profile</CardTitle>
//                         <CardDescription>Details about your sporting career.</CardDescription>
//                     </CardHeader>
//                     <CardContent className="space-y-4">
//                         <div className="grid grid-cols-2 gap-4">
//                             <div className="space-y-2">
//                                 <Label>Primary Sport</Label>
//                                 <Select value={formData.primarySport} onValueChange={(val: string) => handleSelectChange('primarySport', val)}>
//                                     <SelectTrigger>
//                                         <SelectValue placeholder="Select sport" />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         <SelectItem value='Rugby'>Rugby</SelectItem>
//                                         <SelectItem value="Basketball">Basketball</SelectItem>
//                                         <SelectItem value="Football">Football</SelectItem>
//                                         <SelectItem value="Soccer">Soccer</SelectItem>
//                                         <SelectItem value="Baseball">Baseball</SelectItem>
//                                         <SelectItem value="Tennis">Tennis</SelectItem>
//                                     </SelectContent>
//                                 </Select>
//                             </div>
//                             <div className="space-y-2">
//                                 <Label>Experience Level</Label>
//                                 <Select value={formData.experience} onValueChange={(val: string) => handleSelectChange('experience', val)}>
//                                     <SelectTrigger>
//                                         <SelectValue placeholder="Select experience" />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         <SelectItem value="Beginner">Beginner</SelectItem>
//                                         <SelectItem value="Intermediate">Intermediate</SelectItem>
//                                         <SelectItem value="Advanced">Advanced</SelectItem>
//                                         <SelectItem value="Professional">Professional</SelectItem>
//                                     </SelectContent>
//                                 </Select>
//                             </div>
//                         </div>
//                     </CardContent>
//                 </Card>

//                 <div className="flex justify-end pt-4 pb-12">
//                     <Button size="lg" onClick={handleSave} disabled={saving}>
//                         {saving ? 'Saving...' : 'Save Changes'}
//                     </Button>
//                 </div>

//             </div>
//         </div>
//     )
// }

// app/athlete/profile/page.tsx
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { AthleteProfileForm } from '@/components/athletes/athlete-profile-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle } from 'lucide-react';
import { auth } from '@/auth';
import { AthleteOverview } from '@/components/athletes/athlete-overview';
import { getSports } from '@/lib/sports';

export const metadata: Metadata = {
  title: 'Athlete Profile | Athletic Performance Agency',
  description: 'Manage your athlete profile',
};

async function getAthleteProfile(userId: string) {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    include: {
      User: {
        select: {
          email: true,
          name: true,
          image: true,
        },
      },
      Application: {
        include: {
          Opportunity: {
            include: {
              ClientProfile: {
                select: {
                  organization: true,
                },
              },
            },
          },
        },
        orderBy: { appliedAt: 'desc' },
        take: 5,
      },
      Opportunity: {
        take: 5,
      },
    },
  });

  return profile;
}

export default async function AthleteProfilePage() {
  const session = await auth();
  const sports = await getSports();

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'ATHLETE') {
    redirect('/dashboard');
  }

  const profile = await getAthleteProfile(session.user.id);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <CardTitle className="text-2xl">Profile Not Found</CardTitle>
            <CardDescription>
              Please complete your profile setup to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AthleteProfileForm userId={session.user.id} sports={sports.sports} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Athlete Profile</h1>
          <p className="text-muted-foreground">
            Manage your athlete profile and track your progress
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="edit">Edit Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AthleteOverview profile={profile} />
          </TabsContent>

          <TabsContent value="edit">
            <AthleteProfileForm profile={profile} sports={sports.sports}/>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}