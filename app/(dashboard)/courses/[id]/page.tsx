'use client';

import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useCourseDetails } from '@/hooks/use-course-details';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Users, 
  Megaphone, 
  FileText, 
  Calendar, 
  User, 
  ArrowLeft,
  Plus,
  Download,
  Eye
} from 'lucide-react';
import { QuickPreview } from '@/components/file-preview/quick-preview';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatDateMedium, formatDateShort } from '@/lib/utils';

export default function CourseDetailPage() {

  const params = useParams();
  const courseId = params.id as string;
  const { user } = useAuth();
  const { data: courseDetailsData, isLoading, error } = useCourseDetails(courseId);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !courseDetailsData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Course not found</h3>
          <p className="text-muted-foreground mb-6">The course you're looking for doesn't exist or you don't have access to it.</p>
          <Link href="/courses">
            <Button>Back to Courses</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const { course, announcements, materials, stats } = courseDetailsData.data;
  const isLecturer = user?.role === 'lecturer';
  const isOwner = course.lecturer._id === user?._id;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('doc')) return '📝';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('video')) return '🎥';
    return '📎';
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/courses">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Courses
              </Button>
            </Link>
          </div>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
              <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary">{course.code}</Badge>
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-1" />
                  {course.lecturer.name}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  Created {formatDateMedium(course.createdAt)}
                </div>
              </div>
            </div>
            
            {isLecturer && isOwner && (
              <div className="flex gap-2">
                <Link href={`/courses/${courseId}/edit`}>
                  <Button variant="outline">Edit Course</Button>
                </Link>
                <Link href="/announcements/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Announcement
                  </Button>
                </Link>
            </div>
            )}
          </div>
        </div>

        {/* Course Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Announcements</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAnnouncements}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Materials</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMaterials}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.materialsByCategory}</div>
            </CardContent>
          </Card>
        </div>

        {/* Course Description */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Course Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{course.description}</p>
          </CardContent>
        </Card>

        {/* Tabs for Announcements and Materials */}
        <Tabs defaultValue="announcements" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="announcements" className="flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              Announcements
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Materials
            </TabsTrigger>
          </TabsList>

          <TabsContent value="announcements" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Recent Announcements</h2>
              <Link href={`/announcements?courseId=${courseId}`}>
                <Button variant="outline" size="sm">View All</Button>
                </Link>
            </div>
            
            {announcements.length > 0 ? (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <Card key={announcement._id} className={`${
                    announcement.isImportant ? 'border-orange-200 bg-orange-50' : ''
                  }`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg">{announcement.title}</CardTitle>
                            {announcement.isImportant && (
                              <Badge variant="destructive" className="text-xs">Important</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {announcement.createdBy.name}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDateMedium(announcement.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4 line-clamp-3">
                        {announcement.body}
                      </p>
                      <Link href={`/announcements/${announcement._id}`}>
                        <Button variant="outline" size="sm">Read More</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements yet</h3>
                <p className="text-gray-500 mb-6">
                  {isLecturer && isOwner 
                    ? 'Create your first announcement to get started'
                    : 'Check back later for announcements'
                  }
                </p>
                {isLecturer && isOwner && (
                  <Link href="/announcements/create">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Announcement
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="materials" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Course Materials</h2>
              {isLecturer && isOwner && (
                <Link href="/materials/upload">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Upload Material
                  </Button>
                </Link>
              )}
            </div>
            
            {Object.keys(materials).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(materials).map(([category, categoryMaterials]) => (
                  <div key={category}>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 capitalize">
                      {category} ({categoryMaterials.length})
                    </h3>
                                        <div className="materials-grid">
                      {categoryMaterials.map((material) => (
                        <div key={material._id} className="bg-card rounded-lg border border-border shadow-sm hover:shadow-lg transition-all duration-300 material-card overflow-hidden">
                          {/* Header */}
                          <div className="p-4 border-b border-border/50 flex-shrink-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-sm font-semibold mb-2 text-card-foreground">{material.title}</h3>
                                <p className="text-xs text-muted-foreground">
                                   {material.uploadedBy.name} • {formatDateShort(material.createdAt)}
                                </p>
                              </div>
                              <span className="text-2xl">{getFileIcon(material.fileType)}</span>
                            </div>
                          </div>
                          {/* Content */}
                          <div className="p-4 material-card-content">
                            <div className="space-y-3 flex-1">
                              <QuickPreview
                                fileUrl={`https://scholaria-1.onrender.com${material.fileUrl}`}
                                fileName={material.fileName}
                                fileType={material.fileType}
                                fileSize={material.fileSize}
                                className="text-xs"
                                showActions={false}
                              />
                              <div className="flex gap-2 material-card-actions">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => window.open(`https://scholaria-1.onrender.com${material.fileUrl}`, '_blank')}
                                >
                                  <Download className="mr-1 h-3 w-3" />
                                  Download
                                </Button>
                                <Link href={`/materials/${material._id}`}>
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No materials yet</h3>
                <p className="text-gray-500 mb-6">
                  {isLecturer && isOwner 
                    ? 'Upload your first material to get started'
                    : 'Check back later for course materials'
                  }
                </p>
                {isLecturer && isOwner && (
                  <Link href="/materials/upload">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Upload Material
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
} 