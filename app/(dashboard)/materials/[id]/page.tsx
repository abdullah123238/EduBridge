'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useMaterialDetails } from '@/hooks/use-material-details';
import { usePdfPageCount } from '@/hooks/use-material-page-progress';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FilePreview } from '@/components/file-preview/file-preview';
import { MaterialViewer } from '@/components/material-viewer/material-viewer';
import { Breadcrumb } from '@/components/navigation/breadcrumb';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  User, 
  Calendar, 
  BookOpen,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatDateFull, formatDateMedium } from '@/lib/utils';
import { estimatePdfPages } from '@/lib/pdf-utils';

export default function MaterialDetailPage() {
  const params = useParams();
  const materialId = params.id as string;
  const { user } = useAuth();
  const { data: materialData, isLoading, error } = useMaterialDetails(materialId);
  const { data: pageCountData } = usePdfPageCount(materialId);

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
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Material not found</h3>
          <p className="text-muted-foreground mb-6">The material you're looking for doesn't exist or you don't have access to it.</p>
          <Link href="/materials">
            <Button>Back to Materials</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const { material, fileInfo } = materialData.data;
  const isLecturer = user?.role === 'lecturer';
  const isOwner = material.uploadedBy._id === user?._id;

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
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: 'Materials', href: '/materials' },
            { label: material.title }
          ]}
        />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/materials">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Materials
              </Button>
            </Link>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{getFileIcon(material.fileType)}</span>
                <h1 className="text-3xl font-bold text-foreground break-words">{material.title}</h1>
                <Badge variant="secondary" className="text-sm capitalize">
                  {material.category}
                </Badge>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {material.uploadedBy.name}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDateFull(material.createdAt)}
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {material.course.title} ({material.course.code})
                </div>
              </div>
            </div>
            
            {isLecturer && isOwner && (
              <div className="flex gap-2">
                <Link href={`/materials/${materialId}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </Link>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Material Description */}
            {material.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-card-foreground whitespace-pre-wrap break-words">{material.description}</p>
                </CardContent>
              </Card>
            )}

            {/* View Mode Toggle */}
            <Card>
              <CardHeader>
                <CardTitle>Viewing Option</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    className="flex-1"
                    disabled={user?.role === 'lecturer'}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Study Mode
                    {user?.role === 'lecturer' && (
                      <span className="ml-2 text-xs">(Students Only)</span>
                    )}
                  </Button>
                </div>
                {user?.role === 'student' && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Study Mode:</strong> Read each page for 6-12 minutes to unlock the next page. 
                      Complete all pages to download the material.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Material Viewer */}
            <MaterialViewer
              materialId={materialId}
              fileUrl={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${material.fileUrl}`}
              fileName={material.fileName}
              fileType={material.fileType}
              fileSize={material.fileSize}
              totalPages={pageCountData?.data?.pageCount || estimatePdfPages(material.fileSize, material.fileType)}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* File Information */}
            <Card>
              <CardHeader>
                <CardTitle>File Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between gap-2">
                    <span className="text-sm text-muted-foreground">File Name:</span>
                    <span className="text-sm font-medium break-words text-right min-w-0">
                      {material.fileName}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-sm text-muted-foreground">File Type:</span>
                    <span className="text-sm font-medium break-words text-right min-w-0">
                      {material.fileType}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-sm text-muted-foreground">File Size:</span>
                    <span className="text-sm font-medium break-words text-right min-w-0">
                      {formatFileSize(material.fileSize)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2 items-start">
                    <span className="text-sm text-muted-foreground">Category:</span>
                    <Badge variant="outline" className="text-xs capitalize max-w-full break-words">
                      {material.category}
                    </Badge>
                  </div>
                  {fileInfo.lastModified && (
                    <div className="flex justify-between gap-2">
                      <span className="text-sm text-muted-foreground">Last Modified:</span>
                      <span className="text-sm font-medium break-words text-right min-w-0">
                        {formatDateMedium(fileInfo.lastModified)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Course Information */}
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-foreground">{material.course.title}</h3>
                    <p className="text-sm text-muted-foreground">Code: {material.course.code}</p>
                  </div>
                  <Link href={`/courses/${material.course._id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <BookOpen className="mr-2 h-4 w-4" />
                      View Course
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
} 