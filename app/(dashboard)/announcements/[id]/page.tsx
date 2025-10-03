'use client';

import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useAnnouncementDetails } from '@/hooks/use-announcement-details';
import { useDeleteAnnouncement } from '@/hooks/use-announcements';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CommentSection } from '@/components/comments/comment-section';
import { Breadcrumb } from '@/components/navigation/breadcrumb';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  User, 
  Calendar, 
  BookOpen,
  Megaphone,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatDateFull } from '@/lib/utils';

export default function AnnouncementDetailPage() {


  const params = useParams();
  const router = useRouter();
  const announcementId = params.id as string;
  const { user } = useAuth();
  const { data: announcementData, isLoading, error } = useAnnouncementDetails(announcementId);
  const deleteMutation = useDeleteAnnouncement();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !announcementData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Megaphone className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Announcement not found</h3>
          <p className="text-muted-foreground mb-6">The announcement you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
          <Link href="/announcements">
            <Button>Back to Announcements</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const { announcement, comments, commentCount } = announcementData.data;
  const isLecturer = user?.role === 'lecturer';
  const isOwner = announcement.createdBy._id === user?._id;

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) {
      deleteMutation.mutate(announcementId, {
        onSuccess: () => {
          router.push('/announcements');
        }
      });
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
            { label: 'Announcements', href: '/announcements' },
            { label: announcement.title }
          ]}
        />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/announcements">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Announcements
              </Button>
            </Link>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">{announcement.title}</h1>
                {announcement.isImportant && (
                  <Badge variant="destructive" className="text-sm">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Important
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {announcement.createdBy.name}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDateFull(announcement.createdAt)}
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {announcement.course.title} ({announcement.course.code})
                </div>
              </div>
            </div>
            
            {isLecturer && isOwner && (
              <div className="flex gap-2">
                <Link href={`/announcements/${announcementId}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </Link>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Announcement Content */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-card-foreground leading-relaxed">
                {announcement.body}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Link */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Course Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">{announcement.course.title}</h3>
                <p className="text-sm text-muted-foreground">Course Code: {announcement.course.code}</p>
              </div>
              <Link href={`/courses/${announcement.course._id}`}>
                <Button variant="outline" size="sm">
                  View Course
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* Comments Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Comments ({commentCount})</h2>
          </div>
          
          <CommentSection announcementId={announcementId} />
        </div>
      </motion.div>
    </DashboardLayout>
  );
} 