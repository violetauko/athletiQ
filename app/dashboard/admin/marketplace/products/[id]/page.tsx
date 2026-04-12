'use client'

import React, { useState, useEffect, use } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { uploadFile } from '@/lib/upload'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [uploadingImage, setUploadingImage] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'APPAREL',
    imageUrl: '',
  })

  // Ensure ProductCategory values are matching Prisma enum
  const categories = ['APPAREL', 'EQUIPMENT', 'ACCESSORIES', 'NUTRITION', 'SERVICES', 'OTHER']

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/admin/products/${id}`)
        if (res.ok) {
          const data = await res.json()
          setFormData({
            name: data.name,
            description: data.description,
            price: data.price.toString(),
            stock: data.stock.toString(),
            category: data.category,
            imageUrl: data.imageUrl || '',
          })
        } else {
          toast.error('Failed to load product')
          router.push('/dashboard/admin/marketplace/products')
        }
      } catch (error) {
        toast.error('An error occurred loading product details')
      } finally {
        setFetching(false)
      }
    }
    fetchProduct()
  }, [id, router])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    
    try {
      setUploadingImage(true)
      const url = await uploadFile(file, 'product')
      setFormData(prev => ({ ...prev, imageUrl: url }))
      toast.success('Image uploaded successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success('Product updated successfully')
        router.push('/dashboard/admin/marketplace/products')
      } else {
        const errorData = await res.json()
        toast.error(errorData.message || 'Failed to update product')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading...</div>
  }

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/admin/marketplace/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Product</h2>
          <p className="text-muted-foreground text-sm">Update product details and inventory.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(val) => setFormData({...formData, category: val})}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (KES) *</Label>
                <Input 
                  id="price" 
                  type="number" 
                  step="0.01" 
                  min="0"
                  value={formData.price} 
                  onChange={(e) => setFormData({...formData, price: e.target.value})} 
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Inventory Stock *</Label>
                <Input 
                  id="stock" 
                  type="number" 
                  min="0"
                  value={formData.stock} 
                  onChange={(e) => setFormData({...formData, stock: e.target.value})} 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea 
                id="description" 
                rows={5}
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                required 
              />
            </div>

            <div className="space-y-4">
              <Label>Product Image *</Label>
              <div className="flex items-end gap-4">
                <div className="w-32 h-32 relative rounded-md border flex items-center justify-center bg-muted overflow-hidden">
                  {formData.imageUrl ? (
                    <Image src={formData.imageUrl} alt="Preview" fill className="object-cover" />
                  ) : (
                    <span className="text-sm text-muted-foreground">No image</span>
                  )}
                </div>
                <div className="space-y-2 flex-1">
                  <Input 
                    type="file" 
                    accept="image/png, image/jpeg, image/webp" 
                    onChange={handleImageUpload} 
                    disabled={uploadingImage}
                  />
                  <p className="text-xs text-muted-foreground pl-1">
                    {uploadingImage ? 'Uploading...' : 'Upload a .png, .jpg or .webp file (Max 5MB)'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/admin/marketplace/products">Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading || uploadingImage || !formData.imageUrl || !formData.name}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
