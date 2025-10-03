'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useAnnouncements, useDeleteAnnouncement } from '@/hooks/use-announcements';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Search, Calendar, User, BookOpen, Plus, AlertTriangle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatDate, formatDateShort, formatDateMedium } from '@/lib/utils';

export default function AnnouncementsPage() {


  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data: announcementsData, isLoading } = useAnnouncements(page, 10, search);
  const deleteMutation = useDeleteAnnouncement();
  const isLecturer = user?.role === 'lecturer';
  const announcements = announcementsData?.data || [];

  const handleDelete = (announcementId: string) => {
    if (confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) {
      deleteMutation.mutate(announcementId);
    }
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
              Announcements
            </motion.h1>
            <motion.p 
              className="text-lg text-gray-600 mt-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {isLecturer ? 'Manage course announcements effectively' : 'Stay updated with important course announcements'}
            </motion.p>
          </div>
          {isLecturer && (
            <Link href="/announcements/create">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-scholiax-purple hover:bg-scholiax-purple/90 shadow-lg">
                  <Plus className="mr-2 h-4 w-4" />
                  New Announcement
                </Button>
              </motion.div>
            </Link>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search announcements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Announcements List */}
        {isLoading ? (
          <div className="space-y-4 sm:space-y-6">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
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
        ) : announcements.length > 0 ? (
          <div className="space-y-4 sm:space-y-6">
            {announcements.map((announcement, index) => (
              <motion.div
                key={announcement._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`hover:shadow-lg transition-shadow duration-300 ${
                  announcement.isImportant ? 'border-orange-200 bg-orange-50' : ''
                }`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <CardTitle className="text-base sm:text-lg truncate">{announcement.title}</CardTitle>
                          {announcement.isImportant && (
                            <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                              <AlertTriangle className="h-3 w-3" />
                              Important
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="truncate">{announcement.course.title}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="truncate">{announcement.createdBy.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">{formatDateMedium(announcement.createdAt)}</span>
                            <span className="sm:hidden">{formatDateShort(announcement.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                        <Megaphone className="h-5 w-5 sm:h-6 sm:w-6 text-accent-foreground" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-card-foreground text-xs sm:text-sm mb-4 whitespace-pre-wrap line-clamp-3">
                      {announcement.body}
                    </p>
                    
                    {announcement.attachments && announcement.attachments.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs sm:text-sm font-medium text-card-foreground mb-2">Attachments:</p>
                        <div className="flex flex-wrap gap-2">
                          {announcement.attachments.map((attachment, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {attachment}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <Link href={`/announcements/${announcement._id}`}>
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                          View Details
                        </Button>
                      </Link>
                      
                      {isLecturer && announcement.createdBy._id === user?._id && (
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Link href={`/announcements/${announcement._id}/edit`} className="flex-1 sm:flex-none">
                            <Button variant="outline" size="sm" className="w-full">
                              Edit
                            </Button>
                          </Link>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="w-full sm:w-auto"
                            onClick={() => handleDelete(announcement._id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="mr-2 h-3 w-3" />
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Megaphone className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {search ? 'No announcements found' : 'No announcements yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {search 
                ? 'Try adjusting your search terms'
                : isLecturer 
                  ? 'Create your first announcement to get started'
                  : 'Check back later for new announcements'
              }
            </p>
            {isLecturer && !search && (
              <Link href="/announcements/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Announcement
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Pagination */}
        {announcementsData && announcementsData.pagination.pages > 1 && (
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
                Page {page} of {announcementsData.pagination.pages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(Math.min(announcementsData.pagination.pages, page + 1))}
                disabled={page === announcementsData.pagination.pages}
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