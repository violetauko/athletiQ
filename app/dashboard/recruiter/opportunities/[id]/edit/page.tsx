'use client'

import { useState, useEffect, use } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Plus, X } from 'lucide-react'
import Link from 'next/link'

const SPORTS = [
  'Rugby', 'Basketball', 'Soccer', 'Tennis', 'Swimming', 'Track & Field',
  'Baseball', 'Volleyball', 'Multi-Sport', 'Other',
]

const CATEGORIES = [
  'Professional Sports', 'Coaching', 'Sports Management', 'Sports Science',
  'Training', 'Management', 'College Athletics', 'Other',
]

const JOB_TYPES = ['Full Time', 'Part Time', 'Contract', 'Scholarship', 'Internship']

type StringListField = 'requirements' | 'benefits' | 'responsibilities'

interface FormData {
  title: string
  sport: string
  category: string
  location: string
  city: string
  state: string
  type: string
  salaryMin: string
  salaryMax: string
  description: string
  requirements: string[]
  benefits: string[]
  responsibilities: string[]
  deadline: string
  imageUrl: string
}

export default function EditOpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [form, setForm] = useState<FormData | null>(null)
  const { id } = use(params);

  const { data: opportunity, isLoading } = useQuery({
    queryKey: ['opportunity-edit', id],
    queryFn: async () => {
      const res = await fetch(`/api/opportunities/${id}`)
      if (!res.ok) throw new Error('Failed to load')
      return res.json()
    },
  })

  // Populate form when data loads
  useEffect(() => {
    if (!opportunity) return
    setForm({
      title: opportunity.title ?? '',
      sport: opportunity.sport ?? '',
      category: opportunity.category ?? '',
      location: opportunity.location ?? '',
      city: opportunity.city ?? '',
      state: opportunity.state ?? '',
      type: opportunity.type ?? '',
      salaryMin: opportunity.salaryMin != null ? String(opportunity.salaryMin) : '',
      salaryMax: opportunity.salaryMax != null ? String(opportunity.salaryMax) : '',
      description: opportunity.description ?? '',
      requirements: opportunity.requirements?.length ? opportunity.requirements : [''],
      benefits: opportunity.benefits?.length ? opportunity.benefits : [''],
      responsibilities: opportunity.responsibilities?.length ? opportunity.responsibilities : [''],
      deadline: opportunity.deadline
        ? new Date(opportunity.deadline).toISOString().split('T')[0]
        : '',
      imageUrl: opportunity.imageUrl ?? '',
    })
  }, [opportunity])

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async (payload: object) => {
      const res = await fetch(`/api/client/opportunities/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Failed to update')
      }
      return res.json()
    },
    onSuccess: () => router.push('/dashboard'),
  })

  const set = (field: keyof FormData, value: string) =>
    setForm((prev) => prev ? { ...prev, [field]: value } : prev)

  const setListItem = (field: StringListField, index: number, value: string) =>
    setForm((prev) => {
      if (!prev) return prev
      const arr = [...prev[field]]
      arr[index] = value
      return { ...prev, [field]: arr }
    })

  const addListItem = (field: StringListField) =>
    setForm((prev) => prev ? { ...prev, [field]: [...prev[field], ''] } : prev)

  const removeListItem = (field: StringListField, index: number) =>
    setForm((prev) =>
      prev ? { ...prev, [field]: prev[field].filter((_, i) => i !== index) } : prev
    )

  const handleSubmit = () => {
    if (!form) return
    mutate({
      ...form,
      salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
      requirements: form.requirements.filter(Boolean),
      benefits: form.benefits.filter(Boolean),
      responsibilities: form.responsibilities.filter(Boolean),
      deadline: form.deadline || null,
    })
  }

  const isValid = form && form.title && form.sport && form.category && form.type && form.description

  if (isLoading || !form) {
    return (
      <div className="container py-12 max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="border-b sticky top-16 z-30">
        <div className="container py-4 flex items-center justify-between">
          <Button asChild variant="ghost" className="gap-2 text-muted-foreground">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">Edit Opportunity</h1>
          <Button
            className="bg-black hover:bg-black/90 rounded-full"
            onClick={handleSubmit}
            disabled={!isValid || isPending}
          >
            {isPending ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="py-12 mx-auto w-full space-y-8">
        {isError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {(error as Error).message}
          </div>
        )}

        {/* Basic Info */}
        <Card>
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Job Title *</Label>
              <Input value={form.title} onChange={(e) => set('title', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sport *</Label>
                <Select value={form.sport} onValueChange={(v) => set('sport', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SPORTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={(v) => set('category', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Employment Type *</Label>
                <Select value={form.type} onValueChange={(v) => set('type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{JOB_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Salary Min</Label>
                <Input type="number" value={form.salaryMin} onChange={(e) => set('salaryMin', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Salary Max</Label>
                <Input type="number" value={form.salaryMax} onChange={(e) => set('salaryMax', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader><CardTitle>Location & Deadline</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => set('city', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>State / Region</Label>
                <Input value={form.state} onChange={(e) => set('state', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Deadline</Label>
                <Input type="date" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader><CardTitle>Description *</CardTitle></CardHeader>
          <CardContent>
            <Textarea
              className="min-h-45 resize-none"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Dynamic Lists */}
        {(
          [
            { field: 'responsibilities' as StringListField, label: 'Responsibilities' },
            { field: 'requirements' as StringListField, label: 'Requirements' },
            { field: 'benefits' as StringListField, label: 'Benefits & Perks' },
          ] as const
        ).map(({ field, label }) => (
          <Card key={field}>
            <CardHeader><CardTitle>{label}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {form[field].map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input value={item} onChange={(e) => setListItem(field, index, e.target.value)} />
                  {form[field].length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeListItem(field, index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" className="gap-2" onClick={() => addListItem(field)}>
                <Plus className="w-4 h-4" /> Add Item
              </Button>
            </CardContent>
          </Card>
        ))}

        {/* Image */}
        <Card>
          <CardHeader><CardTitle>Cover Image</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input value={form.imageUrl} onChange={(e) => set('imageUrl', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pb-8">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/recruiter">Cancel</Link>
          </Button>
          <Button
            className="bg-black hover:bg-black/90 rounded-full"
            onClick={handleSubmit}
            disabled={!isValid || isPending}
            size="lg"
          >
            {isPending ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}