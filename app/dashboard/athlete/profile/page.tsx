'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AthleteProfile } from '@/app/types/athlete'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ProfileUpdatePayload {
    name: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    gender: string;
    phone: string;
    location: string;
    bio: string;
    primarySport: string;
    experience: string;
}

export default function AthleteProfilePage() {
    const queryClient = useQueryClient()

    // Form State (still needed for local editing before submission)
    const [formData, setFormData] = useState({
        name: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        phone: '',
        location: '',
        bio: '',
        primarySport: '',
        experience: ''
    })

    const { data: profile, isLoading: loading } = useQuery<AthleteProfile>({
        queryKey: ['athlete-profile'],
        queryFn: async () => {
            const response = await fetch('/api/athlete/profile')
            if (!response.ok) throw new Error('Failed to fetch profile')
            const data = await response.json()

            // Sync form data on load
            setFormData({
                name: data.user?.name || '',
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
                gender: data.gender || '',
                phone: data.phone || '',
                location: data.location || '',
                bio: data.bio || '',
                primarySport: data.primarySport || '',
                experience: data.experience || ''
            })
            return data
        }
    })

    const saveMutation = useMutation({
        mutationFn: async (payload: ProfileUpdatePayload) => {
            const response = await fetch('/api/athlete/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!response.ok) throw new Error('Failed to save profile')
            return response.json()
        },
        onSuccess: () => {
            alert("Profile saved successfully")
            queryClient.invalidateQueries({ queryKey: ['athlete-profile'] })
            queryClient.invalidateQueries({ queryKey: ['athlete-dashboard'] })
        },
        onError: () => {
            alert("Failed to save profile")
        }
    })



    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSave = () => {
        // Format date for Prisma
        const payload = {
            ...formData,
            dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : undefined
        }
        saveMutation.mutate(payload)
    }

    const saving = saveMutation.isPending

    if (loading) return <div className="text-center py-12">Loading profile...</div>
    if (!profile) return <div className="text-center py-12">Profile not found.</div>

    return (
        <div className="min-h-screen">
            <div className="container mx-auto space-y-8">
                {/* <h1 className="text-3xl font-bold">My Profile</h1> */}

                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your basic personal details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>First Name</Label>
                                <Input name="firstName" value={formData.firstName} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>Last Name</Label>
                                <Input name="lastName" value={formData.lastName} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Display Name</Label>
                            <Input name="name" value={formData.name} onChange={handleChange} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Date of Birth</Label>
                                <Input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>Gender</Label>
                                <Select value={formData.gender} onValueChange={(val: string) => handleSelectChange('gender', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MALE">Male</SelectItem>
                                        <SelectItem value="FEMALE">Female</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Phone Number</Label>
                                <Input name="phone" value={formData.phone} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>Location</Label>
                                <Input name="location" value={formData.location} onChange={handleChange} placeholder="City, State" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Bio</Label>
                            <Textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Tell us a bit about yourself..."
                                className="min-h-25"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Athletic Profile</CardTitle>
                        <CardDescription>Details about your sporting career.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Primary Sport</Label>
                                <Select value={formData.primarySport} onValueChange={(val: string) => handleSelectChange('primarySport', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select sport" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='Rugby'>Rugby</SelectItem>
                                        <SelectItem value="Basketball">Basketball</SelectItem>
                                        <SelectItem value="Football">Football</SelectItem>
                                        <SelectItem value="Soccer">Soccer</SelectItem>
                                        <SelectItem value="Baseball">Baseball</SelectItem>
                                        <SelectItem value="Tennis">Tennis</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Experience Level</Label>
                                <Select value={formData.experience} onValueChange={(val: string) => handleSelectChange('experience', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select experience" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Beginner">Beginner</SelectItem>
                                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                                        <SelectItem value="Advanced">Advanced</SelectItem>
                                        <SelectItem value="Professional">Professional</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end pt-4 pb-12">
                    <Button size="lg" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>

            </div>
        </div>
    )
}
