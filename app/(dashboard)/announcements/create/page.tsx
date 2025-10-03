'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useCourses } from '@/hooks/use-courses';
import { useCreateAnnouncement } from '@/hooks/use-announcements';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Megaphone, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { announcementSchema, AnnouncementFormData } from '@/lib/validations';

export default function CreateAnnouncementPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: coursesData } = useCourses(1, 50); 
  const createAnnouncement = useCreateAnnouncement();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      isImportant: false,
    },
  });

  const watchedIsImportant = watch('isImportant');

  const onSubmit = async (data: AnnouncementFormData) => {
    setIsSubmitting(true);
    try {
      await createAnnouncement.mutateAsync(data);
      router.push('/announcements');
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const courses = coursesData?.data || [];

  return (
    <DashboardLayout requireRole="lecturer">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/announcements">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Announcements
              </Button>
            </Link>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Announcement</h1>
            <p className="text-gray-600 mt-2">
              Share important updates and information with your students
            </p>
          </div>
        </div>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                New Announcement
              </CardTitle>
              <CardDescription>
                Fill in the details below to create a new announcement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Course Selection */}
                <div className="space-y-2">
                  <Label htmlFor="courseId">Course *</Label>
                  <Select onValueChange={(value) => setValue('courseId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course._id} value={course._id}>
                          {course.title} ({course.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.courseId && (
                    <p className="text-sm text-red-600">{errors.courseId.message}</p>
                  )}
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter announcement title"
                    {...register('title')}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="body">Content *</Label>
                  <Textarea
                    id="body"
                    placeholder="Write your announcement content here..."
                    rows={6}
                    {...register('body')}
                  />
                  {errors.body && (
                    <p className="text-sm text-red-600">{errors.body.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {watch('body')?.length || 0}/1000 characters
                  </p>
                </div>

                {/* Important Flag */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isImportant"
                    checked={watchedIsImportant}
                    onCheckedChange={(checked) => setValue('isImportant', checked as boolean)}
                  />
                  <Label htmlFor="isImportant" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Mark as important
                  </Label>
                </div>
                <p className="text-xs text-gray-500">
                  Important announcements will be highlighted and may trigger notifications
                </p>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Announcement
                  </Button>
                  <Link href="/announcements">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </DashboardLayout>
  );
} 