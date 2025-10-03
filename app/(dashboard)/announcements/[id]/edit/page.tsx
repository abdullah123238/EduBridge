'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useAnnouncement } from '@/hooks/use-announcements';
import { useUpdateAnnouncement } from '@/hooks/use-announcements';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Breadcrumb } from '@/components/navigation/breadcrumb';
import { 
  ArrowLeft, 
  Save,
  Loader2,
  Megaphone
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { announcementSchema, AnnouncementFormData } from '@/lib/validations';

export default function EditAnnouncementPage() {
  const params = useParams();
  const router = useRouter();
  const announcementId = params.id as string;
  const { user } = useAuth();
  const { data: announcementData, isLoading, error } = useAnnouncement(announcementId);
  const updateAnnouncementMutation = useUpdateAnnouncement();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
  });

  const isImportant = watch('isImportant');

  useEffect(() => {
    if (announcementData?.data) {
      reset({
        title: announcementData.data.title,
        body: announcementData.data.body,
        isImportant: announcementData.data.isImportant,
      });
    }
  }, [announcementData, reset]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !announcementData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Megaphone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Announcement not found</h3>
          <p className="text-gray-500 mb-6">The announcement you&apos;re trying to edit doesn&apos;t exist or you don&apos;t have access to it.</p>
          <Link href="/announcements">
            <Button>Back to Announcements</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const announcement = announcementData.data;
  const isLecturer = user?.role === 'lecturer';
  const isOwner = announcement.createdBy._id === user?._id;

  if (!isLecturer || !isOwner) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Megaphone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500 mb-6">You don&apos;t have permission to edit this announcement.</p>
          <Link href="/announcements">
            <Button>Back to Announcements</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const onSubmit = async (data: AnnouncementFormData) => {
    try {
      await updateAnnouncementMutation.mutateAsync({
        id: announcementId,
        data,
      });
      router.push(`/announcements/${announcementId}`);
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
        <Breadcrumb 
          items={[
            { label: 'Announcements', href: '/announcements' },
            { label: announcement.title, href: `/announcements/${announcementId}` },
            { label: 'Edit' }
          ]}
        />

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/announcements/${announcementId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Announcement
              </Button>
            </Link>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Announcement</h1>
            <p className="text-gray-600 mt-2">Update the announcement content and settings.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Announcement Information</CardTitle>
            <CardDescription>
              Update the announcement details. Title and content are required.
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
                    placeholder="Enter announcement title"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="body">Content</Label>
                  <Textarea
                    id="body"
                    {...register('body')}
                    placeholder="Write your announcement content here..."
                    rows={8}
                    className={errors.body ? 'border-red-500' : ''}
                  />
                  {errors.body && (
                    <p className="text-sm text-red-500 mt-1">{errors.body.message}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isImportant"
                    checked={isImportant}
                    onCheckedChange={(checked) => setValue('isImportant', checked as boolean)}
                  />
                  <Label htmlFor="isImportant" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Mark as Important
                  </Label>
                </div>
                <p className="text-sm text-gray-500">
                  Important announcements will be highlighted and shown first to students.
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || updateAnnouncementMutation.isPending}
                  className="flex-1"
                >
                  {isSubmitting || updateAnnouncementMutation.isPending ? (
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
                <Link href={`/announcements/${announcementId}`}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
} 