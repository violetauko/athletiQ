// components/athletes/athlete-profile-form.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, X, Plus, Video, FileText, Image as ImageIcon, Loader2, ExternalLink, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Sport } from '@/app/types/athlete';
import { useMutation } from '@tanstack/react-query';
import { EXPERIENCE_LEVELS, GENDERS } from '@/lib/enums';
import { uploadFile } from '@/lib/upload';

// ─── Zod schema ────────────────────────────────────────────────────────────────

const athleteProfileSchema = z.object({
    // Personal Information
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    names: z.string().optional(),
    dateOfBirth: z.coerce.date({
        error: 'Date of birth is required',
    }),
    gender: z.enum(GENDERS),
    phone: z.string().optional(),
    location: z.string().optional(),
    bio: z.string().max(500, 'Bio must not exceed 500 characters').optional(),
    profileImage: z.string().optional(),
    resumeUrl: z.string().optional(),

    // Physical Stats
    height: z.number().min(100, 'Height must be at least 100cm').max(250, 'Height must not exceed 250cm').optional(),
    weight: z.number().min(30, 'Weight must be at least 30kg').max(200, 'Weight must not exceed 200kg').optional(),

    // Sports Information
    primarySport: z.string().min(1, 'Primary sport is required'),
    position: z.string().optional(),
    experience: z.enum(EXPERIENCE_LEVELS).optional(),

    // Academic Information
    gpa: z.number().min(0, 'GPA must be at least 0').max(4, 'GPA must not exceed 4').optional(),
    graduationYear: z.number().min(2000).max(2100).optional(),
    currentSchool: z.string().optional(),

    // Achievements and Media
    secondarySports: z.array(z.string()).optional(),
    achievements: z.array(z.string()).optional(),
    videoHighlights: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof athleteProfileSchema>;

// ─── Field → Tab mapping for error redirect ────────────────────────────────────

const FIELD_TAB_MAP: Record<string, string> = {
    firstName: 'personal',
    lastName: 'personal',
    dateOfBirth: 'personal',
    gender: 'personal',
    phone: 'personal',
    location: 'personal',
    bio: 'personal',
    height: 'personal',
    weight: 'personal',
    primarySport: 'sports',
    secondarySports: 'sports',
    position: 'sports',
    experience: 'sports',
    currentSchool: 'academic',
    graduationYear: 'academic',
    gpa: 'academic',
    achievements: 'media',
    videoHighlights: 'media',
    profileImage: 'media',
    resumeUrl: 'media',
};

const TAB_FIELDS: Record<string, Array<keyof FormValues>> = {
    personal: ['firstName', 'lastName', 'dateOfBirth', 'gender', 'phone', 'location', 'bio', 'height', 'weight'],
    sports: ['primarySport', 'position', 'experience', 'secondarySports'],
    academic: ['currentSchool', 'graduationYear', 'gpa'],
    media: ['achievements', 'videoHighlights', 'profileImage', 'resumeUrl'],
};

// ─── Props ─────────────────────────────────────────────────────────────────────

interface AthleteProfileFormProps {
    profile?: any;
    userId?: string;
    sports: Sport[];
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function AthleteProfileForm({ profile, sports }: AthleteProfileFormProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('personal');

    // Upload states
    const [imageUploading, setImageUploading] = useState(false);
    const [resumeUploading, setResumeUploading] = useState(false);
    const [resumeFileName, setResumeFileName] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(profile?.profileImage ?? null);

    // Inline-add inputs
    const [newSecondarySport, setNewSecondarySport] = useState('');
    const [newAchievement, setNewAchievement] = useState('');
    const [newVideo, setNewVideo] = useState('');

    const imageInputRef = useRef<HTMLInputElement>(null);
    const resumeInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(athleteProfileSchema) as Resolver<FormValues>,
        defaultValues: {
            firstName: profile?.firstName ?? '',
            lastName: profile?.lastName ?? '',
            names: `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim(),
            dateOfBirth: profile?.dateOfBirth ? new Date(profile.dateOfBirth) : undefined,
            gender: profile?.gender ?? 'MALE',
            phone: profile?.phone ?? '',
            location: profile?.location ?? '',
            bio: profile?.bio ?? '',
            height: profile?.height ?? undefined,
            weight: profile?.weight ?? undefined,
            profileImage: profile?.profileImage ?? '',
            resumeUrl: profile?.resumeUrl ?? '',
            primarySport: profile?.primarySport ?? '',
            secondarySports: profile?.secondarySports ?? [],
            position: profile?.position ?? '',
            experience: profile?.experience ?? undefined,
            gpa: profile?.gpa ?? undefined,
            graduationYear: profile?.graduationYear ?? undefined,
            currentSchool: profile?.currentSchool ?? '',
            achievements: profile?.achievements ?? [],
            videoHighlights: profile?.videoHighlights ?? [],
        },
    });

    const watchedSecondarySports = form.watch('secondarySports') ?? [];
    const watchedAchievements = form.watch('achievements') ?? [];
    const watchedVideos = form.watch('videoHighlights') ?? [];
    const firstName = form.watch('firstName');
    const lastName = form.watch('lastName');

    useEffect(() => {
        form.setValue('names', `${firstName ?? ''} ${lastName ?? ''}`.trim());
    }, [firstName, lastName, form]);

    // ── Tab error indicators ─────────────────────────────────────────────────

    const formErrors = form.formState.errors;
    const tabsWithErrors = new Set<string>();
    for (const field of Object.keys(formErrors)) {
        const tab = FIELD_TAB_MAP[field];
        if (tab) tabsWithErrors.add(tab);
    }

    // ── Save mutation ────────────────────────────────────────────────────────

    const saveMutation = useMutation({
        mutationFn: async (payload: FormValues) => {
            const response = await fetch('/api/athlete/profile', {
                method: profile ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                let errorDetails = `HTTP ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorDetails = errorData.message ?? errorData.error ?? errorDetails;
                } catch {
                    errorDetails = response.statusText || errorDetails;
                }
                throw new Error(errorDetails);
            }
            return response.json();
        },
        onSuccess: () => {
            toast.success('Profile saved', {
                description: 'Your profile has been saved successfully.',
            });
            router.refresh();
        },
        onError: (error) => {
            toast.error('Failed to save profile', {
                description: error instanceof Error ? error.message : 'Something went wrong.',
            });
        },
    });

    const handleSubmit = (values: FormValues) => {
        saveMutation.mutate(values);
    };

    const handleInvalidSubmit = (errors: typeof formErrors) => {
        // Switch to the first tab that has errors
        for (const tab of ['personal', 'sports', 'academic', 'media']) {
            const fields = TAB_FIELDS[tab];
            if (fields.some((f) => errors[f])) {
                setActiveTab(tab);
                break;
            }
        }
        toast.error('Please fix the errors before saving.');
    };

    // ── Image upload ─────────────────────────────────────────────────────────

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // Show immediate local preview
        setImagePreview(URL.createObjectURL(file));
        try {
            setImageUploading(true);
            const url = await uploadFile(file, 'image');
            form.setValue('profileImage', url, { shouldValidate: true });
            toast.success('Profile photo uploaded');
        } catch (err) {
            toast.error('Image upload failed', {
                description: err instanceof Error ? err.message : 'Unknown error',
            });
            setImagePreview(profile?.profileImage ?? null);
        } finally {
            setImageUploading(false);
            if (imageInputRef.current) imageInputRef.current.value = '';
        }
    };

    // ── Resume upload ────────────────────────────────────────────────────────

    const handleResumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setResumeUploading(true);
            const url = await uploadFile(file, 'resume');
            form.setValue('resumeUrl', url, { shouldValidate: true });
            setResumeFileName(file.name);
            toast.success('Resume uploaded');
        } catch (err) {
            toast.error('Resume upload failed', {
                description: err instanceof Error ? err.message : 'Unknown error',
            });
        } finally {
            setResumeUploading(false);
            if (resumeInputRef.current) resumeInputRef.current.value = '';
        }
    };

    // ── Secondary Sports ─────────────────────────────────────────────────────

    const addSecondarySport = () => {
        const val = newSecondarySport.trim();
        if (!val || watchedSecondarySports.includes(val)) return;
        form.setValue('secondarySports', [...watchedSecondarySports, val]);
        setNewSecondarySport('');
    };

    const removeSecondarySport = (sport: string) => {
        form.setValue('secondarySports', watchedSecondarySports.filter(s => s !== sport));
    };

    // ── Achievements ─────────────────────────────────────────────────────────

    const addAchievement = () => {
        const val = newAchievement.trim();
        if (!val) return;
        form.setValue('achievements', [...watchedAchievements, val]);
        setNewAchievement('');
    };

    const removeAchievement = (index: number) => {
        form.setValue('achievements', watchedAchievements.filter((_, i) => i !== index));
    };

    // ── Video Highlights ─────────────────────────────────────────────────────

    const addVideo = () => {
        const val = newVideo.trim();
        if (!val) return;
        try {
            new URL(val); // validates URL format
        } catch {
            toast.error('Invalid URL', { description: 'Please enter a valid video URL.' });
            return;
        }
        if (watchedVideos.includes(val)) {
            toast.error('Duplicate URL', { description: 'This video is already in your list.' });
            return;
        }
        form.setValue('videoHighlights', [...watchedVideos, val]);
        setNewVideo('');
    };

    const removeVideo = (index: number) => {
        form.setValue('videoHighlights', watchedVideos.filter((_, i) => i !== index));
    };

    const getSportName = (sportId: string) => {
        return sports.find(s => s.id === sportId)?.name ?? sportId;
    };

    const isLoading = saveMutation.isPending || imageUploading || resumeUploading;

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit, handleInvalidSubmit)}
                className="space-y-8"
            >
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        {(['personal', 'sports', 'academic', 'media'] as const).map((tab) => (
                            <TabsTrigger key={tab} value={tab} className="relative capitalize">
                                {tab}
                                {tabsWithErrors.has(tab) && (
                                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
                                )}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* ── Personal Tab ─────────────────────────────────────── */}
                    <TabsContent value="personal" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>Tell us about yourself</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">

                                {/* Profile Image */}
                                <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
                                    <div
                                        className="relative h-24 w-24 shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-muted-foreground/40 bg-muted transition hover:border-primary"
                                        onClick={() => imageInputRef.current?.click()}
                                        title="Click to upload profile photo"
                                    >
                                        {imagePreview ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
                                                <ImageIcon className="h-6 w-6" />
                                                <span className="text-xs">Photo</span>
                                            </div>
                                        )}
                                        {imageUploading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                                                <Loader2 className="h-6 w-6 animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={imageUploading}
                                            onClick={() => imageInputRef.current?.click()}
                                        >
                                            {imageUploading ? (
                                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading…</>
                                            ) : (
                                                <><Upload className="h-4 w-4 mr-2" />Upload Photo</>
                                            )}
                                        </Button>
                                        <span className="text-xs">JPEG, PNG, WebP — max 5 MB</span>
                                    </div>
                                    <input
                                        ref={imageInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="firstName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>First Name *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="lastName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Last Name *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Doe" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="dateOfBirth"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Date of Birth *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="date"
                                                        value={
                                                            field.value
                                                                ? field.value instanceof Date
                                                                    ? field.value.toISOString().split('T')[0]
                                                                    : String(field.value)
                                                                : ''
                                                        }
                                                        onChange={(e) =>
                                                            field.onChange(
                                                                e.target.value ? new Date(e.target.value) : undefined,
                                                            )
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="gender"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Gender *</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select gender" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {GENDERS.map((gender) => (
                                                            <SelectItem key={gender} value={gender}>
                                                                {gender.charAt(0) + gender.slice(1).toLowerCase()}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="+1 234 567 8900" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="location"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Location</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="City, Country" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="bio"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bio</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Tell us about yourself, your journey, and your goals..."
                                                    className="min-h-30"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Maximum 500 characters. {field.value?.length ?? 0}/500
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="height"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Height (cm)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="180"
                                                        value={(field.value as number | '') ?? ''}
                                                        onChange={(e) =>
                                                            field.onChange(e.target.value === '' ? undefined : +e.target.value)
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="weight"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Weight (kg)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="75"
                                                        value={(field.value as number | '') ?? ''}
                                                        onChange={(e) =>
                                                            field.onChange(e.target.value === '' ? undefined : +e.target.value)
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Sports Tab ───────────────────────────────────────── */}
                    <TabsContent value="sports" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Sports Information</CardTitle>
                                <CardDescription>Tell us about your athletic background</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="primarySport"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Primary Sport *</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select sport" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {sports.map((sport) => (
                                                            <SelectItem key={sport.id} value={sport.id}>
                                                                {sport.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="position"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Position</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Point Guard, Forward, etc." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="experience"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Experience Level</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select level" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {EXPERIENCE_LEVELS.map((level) => (
                                                            <SelectItem key={level} value={level}>
                                                                {level}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Secondary Sports */}
                                <FormField
                                    control={form.control}
                                    name="secondarySports"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>Secondary Sports</FormLabel>
                                            <FormDescription>
                                                Add other sports you play (selected from the list)
                                            </FormDescription>

                                            {/* Add row */}
                                            <div className="flex gap-2">
                                                <Select
                                                    value={newSecondarySport}
                                                    onValueChange={setNewSecondarySport}
                                                >
                                                    <SelectTrigger className="flex-1">
                                                        <SelectValue placeholder="Pick a sport to add…" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {sports
                                                            .filter(s => !watchedSecondarySports.includes(s.id))
                                                            .map((sport) => (
                                                                <SelectItem key={sport.id} value={sport.id}>
                                                                    {sport.name}
                                                                </SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={addSecondarySport}
                                                    disabled={!newSecondarySport}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            {/* Badge list */}
                                            {watchedSecondarySports.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {watchedSecondarySports.map((sportId) => (
                                                        <Badge key={sportId} variant="secondary" className="gap-1">
                                                            {getSportName(sportId)}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeSecondarySport(sportId)}
                                                                className="ml-1 hover:text-destructive"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Academic Tab ─────────────────────────────────────── */}
                    <TabsContent value="academic" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Academic Information</CardTitle>
                                <CardDescription>Share your academic achievements</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="currentSchool"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Current School / University</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Stanford University" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="graduationYear"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Graduation Year</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="2024"
                                                        value={(field.value as number | '') ?? ''}
                                                        onChange={(e) =>
                                                            field.onChange(e.target.value === '' ? undefined : +e.target.value)
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="gpa"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>GPA</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="3.8"
                                                        value={(field.value as number | '') ?? ''}
                                                        onChange={(e) =>
                                                            field.onChange(e.target.value === '' ? undefined : +e.target.value)
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Media & Achievements Tab ─────────────────────────── */}
                    <TabsContent value="media" className="space-y-6">

                        {/* Achievements */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Achievements</CardTitle>
                                <CardDescription>List your achievements and awards</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Inline add row */}
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="e.g. State Champion 2023"
                                        value={newAchievement}
                                        onChange={(e) => setNewAchievement(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') { e.preventDefault(); addAchievement(); }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addAchievement}
                                        disabled={!newAchievement.trim()}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                {watchedAchievements.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No achievements added yet. Type above and press Enter or click +.
                                    </p>
                                ) : (
                                    <ul className="space-y-2">
                                        {watchedAchievements.map((achievement, index) => (
                                            <li
                                                key={index}
                                                className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2 text-sm"
                                            >
                                                <span>{achievement}</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                                    onClick={() => removeAchievement(index)}
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>

                        {/* Video Highlights */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Video Highlights</CardTitle>
                                <CardDescription>Add links to your highlight videos (YouTube, Vimeo, etc.)</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        type="url"
                                        placeholder="https://youtube.com/watch?v=…"
                                        value={newVideo}
                                        onChange={(e) => setNewVideo(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') { e.preventDefault(); addVideo(); }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addVideo}
                                        disabled={!newVideo.trim()}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                {watchedVideos.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No videos added yet. Paste a URL above and click +.
                                    </p>
                                ) : (
                                    <ul className="space-y-2">
                                        {watchedVideos.map((video, index) => (
                                            <li
                                                key={index}
                                                className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2 text-sm"
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <Video className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                    <a
                                                        href={video}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="truncate text-primary hover:underline"
                                                    >
                                                        {video}
                                                    </a>
                                                    <ExternalLink className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 ml-2 flex-shrink-0 text-muted-foreground hover:text-destructive"
                                                    onClick={() => removeVideo(index)}
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>

                        {/* Resume Upload */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Resume / CV</CardTitle>
                                <CardDescription>Upload your resume or CV (PDF, DOC, DOCX — max 10 MB)</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex flex-wrap items-center gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={resumeUploading}
                                        onClick={() => resumeInputRef.current?.click()}
                                    >
                                        {resumeUploading ? (
                                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading…</>
                                        ) : (
                                            <><Upload className="h-4 w-4 mr-2" />Upload Resume</>
                                        )}
                                    </Button>

                                    {/* Show current file name or existing URL */}
                                    {(resumeFileName ?? (form.watch('resumeUrl') && !resumeUploading)) && (
                                        <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-1.5 text-sm">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground truncate max-w-48">
                                                {resumeFileName ?? 'Current resume'}
                                            </span>
                                            <a
                                                href={form.watch('resumeUrl')}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline"
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Validation error feedback */}
                                <FormField
                                    control={form.control}
                                    name="resumeUrl"
                                    render={() => (
                                        <FormItem className="hidden">
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <input
                                    ref={resumeInputRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                    className="hidden"
                                    onChange={handleResumeChange}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* ── Actions ─────────────────────────────────────────────── */}
                <div className="flex justify-end gap-4">
                    {Object.keys(formErrors).length > 0 && (
                        <div className="flex items-center gap-1.5 text-sm text-destructive mr-auto">
                            <AlertCircle className="h-4 w-4" />
                            <span>Please fix the highlighted errors</span>
                        </div>
                    )}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {saveMutation.isPending ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
                        ) : (
                            'Save Profile'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}