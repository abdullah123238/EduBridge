'use client';

import { useAuth } from '@/lib/auth-context';
import { useCourses, useUserCourses } from '@/hooks/use-courses';
import { useAnnouncements } from '@/hooks/use-announcements';
import { useMaterials } from '@/hooks/use-materials';
import { useStudentTasks } from '@/hooks/use-tasks';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Megaphone, FileText, Users, Plus, Clock, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatDateShort } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: userCoursesData } = useUserCourses(1, 5);
  const { data: announcementsData } = useAnnouncements(1, 100);
  const { data: materialsData } = useMaterials(1, 100);
  const { data: studentTasksData } = useStudentTasks(1, 100); 
  
  const isLecturer = user?.role === 'lecturer';
  const userCourses = userCoursesData?.data || [];
  const announcements = announcementsData?.data || [];
  const materials = materialsData?.data || [];
  const studentTasks = studentTasksData?.data || [];

  const recentAnnouncements = announcements.filter(announcement => {
    try {
      const announcementDate = new Date(announcement.createdAt);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return announcementDate >= sevenDaysAgo;
    } catch (error) {
      return false;
    }
  });

  const totalStudents = isLecturer ? userCourses.reduce((total, course) => {
    return total + (course.students?.length || 0);
  }, 0) : 0;

  // Calculate pending assignments for students
  const pendingAssignments = !isLecturer ? studentTasks.filter((task: any) => {
    // Check if task is published and visible
    if (task.status !== 'published' || !task.isVisible) return false;
    
    // Check if due date hasn't passed
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    if (now > dueDate) return false;
    
    // Check if student hasn't submitted or submitted but not graded
    return !task.submission || task.submission.status === 'draft';
  }).length : 0;

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-10">
          <motion.h1 
            className="text-4xl lg:text-5xl font-bold text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Welcome back, {user?.name}! 👋
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-600 mt-3 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {isLecturer 
              ? "Manage your courses and connect with students effectively" 
              : "Stay updated with your courses and announcements"
            }
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">
                  {isLecturer ? 'My Courses' : 'Enrolled Courses'}
                </CardTitle>
                <div className="p-2 bg-scholiax-purple rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {userCourses.length}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {isLecturer ? 'Created courses' : 'Enrolled courses'}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Recent Announcements</CardTitle>
                <div className="p-2 bg-scholiax-purple rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Megaphone className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recentAnnouncements.length}</div>
                <p className="text-xs text-muted-foreground">In the last 7 days</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Materials</CardTitle>
                <div className="p-2 bg-scholiax-purple rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{materials.length}</div>
                <p className="text-xs text-muted-foreground">Available resources</p>
              </CardContent>
            </Card>
          </motion.div>

          {!isLecturer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Pending Assignments</CardTitle>
                  <div className="p-2 bg-scholiax-purple rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <ClipboardList className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingAssignments}</div>
                  <p className="text-xs text-muted-foreground">Need to complete</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {isLecturer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Total Students</CardTitle>
                  <div className="p-2 bg-scholiax-purple rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalStudents}</div>
                  <p className="text-xs text-muted-foreground">Across all courses</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Recent Courses</CardTitle>
                    <CardDescription>
                      {isLecturer ? 'Courses you created' : 'Your enrolled courses'}
                    </CardDescription>
                  </div>
                  <Link href="/courses">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userCourses.length > 0 ? (
                    userCourses.slice(0, 3).map((course) => (
                      <div key={course._id} className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="h-5 w-5 text-accent-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {course.title}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">{course.code}</p>
                        </div>
                        <div className="text-sm text-muted-foreground flex-shrink-0">
                          {course.students?.length || 0} students
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {isLecturer ? 'No courses created yet' : 'No courses enrolled yet'}
                      </p>
                      <Link href={isLecturer ? '/courses/create' : '/courses'}>
                        <Button className="mt-4" size="sm">
                          {isLecturer ? 'Create Course' : 'Browse Courses'}
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks you might want to perform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {isLecturer ? (
                    <>
                      <Link href="/courses/create">
                        <Button variant="outline" className="w-full h-16 sm:h-20 flex flex-col items-center justify-center space-y-2">
                          <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
                          <span className="text-xs sm:text-sm">Create Course</span>
                        </Button>
                      </Link>
                      <Link href="/announcements">
                        <Button variant="outline" className="w-full h-16 sm:h-20 flex flex-col items-center justify-center space-y-2">
                          <Megaphone className="h-5 w-5 sm:h-6 sm:w-6" />
                          <span className="text-xs sm:text-sm">New Announcement</span>
                        </Button>
                      </Link>
                      <Link href="/materials">
                        <Button variant="outline" className="w-full h-16 sm:h-20 flex flex-col items-center justify-center space-y-2">
                          <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                          <span className="text-xs sm:text-sm">Upload Material</span>
                        </Button>
                      </Link>
                      <Link href="/students">
                        <Button variant="outline" className="w-full h-16 sm:h-20 flex flex-col items-center justify-center space-y-2">
                          <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                          <span className="text-xs sm:text-sm">View Students</span>
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/courses">
                        <Button variant="outline" className="w-full h-16 sm:h-20 flex flex-col items-center justify-center space-y-2">
                          <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
                          <span className="text-xs sm:text-sm">Browse Courses</span>
                        </Button>
                      </Link>
                      <Link href="/announcements">
                        <Button variant="outline" className="w-full h-16 sm:h-20 flex flex-col items-center justify-center space-y-2">
                          <Megaphone className="h-5 w-5 sm:h-6 sm:w-6" />
                          <span className="text-xs sm:text-sm">View Announcements</span>
                        </Button>
                      </Link>
                      <Link href="/materials">
                        <Button variant="outline" className="w-full h-16 sm:h-20 flex flex-col items-center justify-center space-y-2">
                          <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                          <span className="text-xs sm:text-sm">Course Materials</span>
                        </Button>
                      </Link>
                      <Link href="/profile">
                        <Button variant="outline" className="w-full h-16 sm:h-20 flex flex-col items-center justify-center space-y-2">
                          <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                          <span className="text-xs sm:text-sm">My Profile</span>
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}