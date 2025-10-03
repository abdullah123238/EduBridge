'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useMaterials, useDownloadMaterial } from '@/hooks/use-materials';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Search, Calendar, User, BookOpen, Plus, Download, File, Folder } from 'lucide-react';
import { QuickPreview } from '@/components/file-preview/quick-preview';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatDateShort } from '@/lib/utils';

export default function MaterialsPage() {

  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const { data: materialsData, isLoading } = useMaterials(page, 12, search, category);
  const downloadMutation = useDownloadMaterial();

  const isLecturer = user?.role === 'lecturer';
  const materials = materialsData?.data || [];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'lecture-notes', label: 'Lecture Notes' },
    { value: 'assignments', label: 'Assignments' },
    { value: 'readings', label: 'Readings' },
    { value: 'syllabus', label: 'Syllabus' },
    { value: 'exams', label: 'Exams' },
    { value: 'resources', label: 'Resources' },
    { value: 'other', label: 'Other' }
  ];

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('doc')) return '📝';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('video')) return '🎥';
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-10">
          <div>
            <motion.h1 
              className="text-4xl lg:text-5xl font-bold text-gray-900"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Course Materials
            </motion.h1>
            <motion.p 
              className="text-lg text-gray-600 mt-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {isLecturer ? 'Manage and share course materials effectively' : 'Access your course materials easily'}
            </motion.p>
          </div>
          {isLecturer && (
            <Link href="/materials/upload">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-scholiax-purple hover:bg-scholiax-purple/90 text-white shadow-lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Material
                </Button>
              </motion.div>
            </Link>
          )}
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search materials..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Materials Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse h-80">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : materials.length > 0 ? (
          <div className="materials-grid">
            {materials.map((material, index) => (
              <motion.div
                key={material._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-full"
              >
                <div className="bg-card rounded-lg border border-border shadow-sm hover:shadow-lg transition-all duration-300 material-card overflow-hidden">
                  {/* Header */}
                  <div className="p-4 border-b border-border/50 flex-shrink-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold mb-2 truncate text-card-foreground">
                          {material.title}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="truncate">{material.course.title}</span>
                          </div>
                          {material.category && (
                            <Badge variant="secondary" className="text-xs w-fit">
                              {material.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent rounded-lg flex items-center justify-center flex-shrink-0 ml-2 border border-accent/50">
                        <span className="text-lg sm:text-2xl text-accent-foreground">{getFileIcon(material.fileType)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4 material-card-content">
                    {material.description && (
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {material.description}
                      </p>
                    )}
                    
                    <div className="space-y-3 mb-4 flex-1">
                      <QuickPreview
                        fileUrl={`https://scholaria-1.onrender.com${material.fileUrl}`}
                        fileName={material.fileName}
                        fileType={material.fileType}
                        fileSize={material.fileSize}
                        className="text-sm"
                      />
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1 truncate">
                          <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">{material.uploadedBy.name}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                                                                            <span className="hidden sm:inline">{formatDateShort(material.createdAt)}</span>
                          <span className="sm:hidden">{formatDateShort(material.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2 material-card-actions">
                      {isLecturer ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => downloadMutation.mutate(material._id)}
                          disabled={downloadMutation.isPending}
                        >
                          <Download className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">
                            {downloadMutation.isPending ? 'Downloading...' : 'Download'}
                          </span>
                          <span className="sm:hidden">
                            {downloadMutation.isPending ? 'DL...' : 'DL'}
                          </span>
                        </Button>
                      ) : (
                        <Link href={`/materials/${material._id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto"
                          >
                            <BookOpen className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">View Material</span>
                            <span className="sm:hidden">View</span>
                          </Button>
                        </Link>
                      )}
                      
                      {isLecturer && material.uploadedBy._id === user?._id && (
                        <Link href={`/materials/${material._id}/edit`}>
                          <Button variant="outline" size="sm" className="w-full sm:w-auto">
                            Edit
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {search || category ? 'No materials found' : 'No materials available'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {search || category 
                ? 'Try adjusting your search terms or filters'
                : isLecturer 
                  ? 'Upload your first material to get started'
                  : 'Check back later for new materials'
              }
            </p>
            {isLecturer && !search && !category && (
              <Link href="/materials/upload">
                <Button className="bg-scholiax-purple hover:bg-scholiax-purple/90 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Material
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Pagination */}
        {materialsData && materialsData.pagination.pages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-gray-600">
                Page {page} of {materialsData.pagination.pages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(Math.min(materialsData.pagination.pages, page + 1))}
                disabled={page === materialsData.pagination.pages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
} 