'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useMaterial } from '@/hooks/use-materials';
import { useUpdateMaterial } from '@/hooks/use-materials';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Breadcrumb } from '@/components/navigation/breadcrumb';
import { 
  ArrowLeft, 
  Save,
  Loader2,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { materialSchema, MaterialFormData } from '@/lib/validations';
import { formatDateFull } from '@/lib/utils';

const categories = [
  'lecture-notes',
  'assignments',
  'readings',
  'syllabus',
  'exams',
  'resources',
  'other'
];

export default function EditMaterialPage() {

  const params = useParams();
  const router = useRouter();
  const materialId = params.id as string;
  const { user } = useAuth();
  const { data: materialData, isLoading, error } = useMaterial(materialId);
  const updateMaterialMutation = useUpdateMaterial();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<MaterialFormData>({
    resolver: zodResolver(materialSchema),
  });

  const selectedCategory = watch('category');

  useEffect(() => {
    if (materialData?.data) {
      reset({
        title: materialData.data.title,
        description: materialData.data.description || '',
        category: (materialData.data.category as 'lecture-notes' | 'resources' | 'other') || 'other',
      });
    }
  }, [materialData, reset]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !materialData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Material not found</h3>
          <p className="text-gray-500 mb-6">The material you're trying to edit doesn't exist or you don't have access to it.</p>
          <Link href="/materials">
            <Button>Back to Materials</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const material = materialData.data;
  const isLecturer = user?.role === 'lecturer';
  const isOwner = material.uploadedBy._id === user?._id;

  if (!isLecturer || !isOwner) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500 mb-6">You don't have permission to edit this material.</p>
          <Link href="/materials">
            <Button>Back to Materials</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const onSubmit = async (data: MaterialFormData) => {
    try {
      await updateMaterialMutation.mutateAsync({
        id: materialId,
        data,
      });
      router.push(`/materials/${materialId}`);
    } catch (error) {
    }
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: 'Materials', href: '/materials' },
            { label: material.title, href: `/materials/${materialId}` },
            { label: 'Edit' }
          ]}
        />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/materials/${materialId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Material
              </Button>
            </Link>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Material</h1>
            <p className="text-gray-600 mt-2">Update the material information and metadata.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Edit Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Material Information</CardTitle>
                <CardDescription>
                  Update the material details. Title and category are required.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        {...register('title')}
                        placeholder="Enter material title"
                        className={errors.title ? 'border-red-500' : ''}
                      />
                      {errors.title && (
                        <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        {...register('description')}
                        placeholder="Describe the material content..."
                        rows={4}
                        className={errors.description ? 'border-red-500' : ''}
                      />
                      {errors.description && (
                        <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={selectedCategory}
                        onValueChange={(value) => setValue('category', value as 'lecture-notes' | 'resources' | 'other')}
                      >
                        <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting || updateMaterialMutation.isPending}
                      className="flex-1"
                    >
                      {isSubmitting || updateMaterialMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Link href={`/materials/${materialId}`}>
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* File Information */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>File Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">File Name:</span>
                    <p className="text-sm font-medium">{material.fileName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">File Type:</span>
                    <p className="text-sm font-medium">{material.fileType}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">File Size:</span>
                    <p className="text-sm font-medium">
                      {(material.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Uploaded:</span>
                                          <p className="text-sm font-medium">
                        {formatDateFull(material.createdAt)}
                      </p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    Note: The file itself cannot be changed. You can only update the metadata.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
} 