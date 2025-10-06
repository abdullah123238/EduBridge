'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp,
  Users,
  BookOpen,
  FileText,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Download,
  Filter,
  Search,
  Eye,
  Calendar,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDateMedium } from '@/lib/utils';
import { useCourseProgress, useMaterialProgressList, useTaskProgress } from '@/hooks/use-progress';
import { useAuth } from '@/lib/auth-context';
import { CourseProgressOverview } from '@/components/progress/course-progress-overview';
import { MaterialProgress } from '@/components/progress/material-progress';
import toast from 'react-hot-toast';

export default function ProgressTrackingPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: courseProgressData, isLoading: courseLoading } = useCourseProgress(1, 50);
  const { data: materialProgressData, isLoading: materialLoading } = useMaterialProgressList(1, 50);
  const { data: taskProgressData, isLoading: taskLoading, error: taskError } = useTaskProgress(1, 50);

  const courses = courseProgressData?.data || [];
  const materials = materialProgressData?.data || [];
  const tasks = taskProgressData?.data || [];

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressStatus = (percentage: number) => {
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 60) return 'Good';
    if (percentage >= 40) return 'Needs Improvement';
    return 'At Risk';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'not_started':
        return 'bg-gray-100 text-gray-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (user?.role !== 'lecturer') {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">Only lecturers can access progress tracking.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">Progress Tracking</h1>
            <p className="text-lg text-gray-600 mt-3">
              Monitor student progress across courses, materials, and assignments
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {courses.reduce((sum: number, course: any) => sum + course.totalStudents, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all courses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courses.length}</div>
              <p className="text-xs text-muted-foreground">
                {courses.filter((c: any) => c.averageProgress > 0).length} with activity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Materials Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {materials.filter((m: any) => m.completionRate >= 100).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Out of {materials.length} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assignments Submitted</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tasks.reduce((sum: number, task: any) => sum + task.totalSubmissions, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {tasks.length} assignments
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Course Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Course Progress Overview</span>
                </CardTitle>
                <CardDescription>
                  Overall progress across all your courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {courseLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-2 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : courses.length > 0 ? (
                  <div className="space-y-4">
                    {courses.map((course: any, index: number) => (
                      <motion.div
                        key={course._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{course.title}</h4>
                            <p className="text-sm text-gray-600">
                              {course.totalStudents} students • {course.totalMaterials} materials
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${getProgressColor(course.averageProgress)}`}>
                              {course.averageProgress}%
                            </div>
                            <div className="text-xs text-gray-600">
                              {getProgressStatus(course.averageProgress)}
                            </div>
                          </div>
                        </div>
                        <Progress value={course.averageProgress} className="mb-2" />
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{course.completedMaterials} materials completed</span>
                          <span>{course.totalAssignments} assignments</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No course progress data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Material Progress</CardTitle>
                <CardDescription>
                  Track student progress on course materials
                </CardDescription>
              </CardHeader>
              <CardContent>
                {materialLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-2 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : materials.length > 0 ? (
                  <div className="space-y-4">
                    {materials.map((material: any, index: number) => (
                      <motion.div
                        key={material._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <MaterialProgress
                          materialId={material._id}
                          materialTitle={material.title}
                          materialType={material.type || 'document'}
                          duration={material.duration || 0}
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No material progress data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assignment Progress</CardTitle>
                <CardDescription>
                  Monitor assignment submissions and completion rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {taskLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-2 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : taskError ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Assignment Data</h3>
                    <p className="text-gray-600 mb-4">
                      {taskError.message || 'Failed to load assignment progress data. Please try again.'}
                    </p>
                    <Button onClick={() => window.location.reload()} variant="outline">
                      Retry
                    </Button>
                  </div>
                ) : tasks.length > 0 ? (
                  <div className="space-y-4">
                    {tasks.map((task: any, index: number) => (
                      <motion.div
                        key={task._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{task.title}</h4>
                            <p className="text-sm text-gray-600">
                              {task.courseTitle} • Due: {formatDateMedium(task.dueDate)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-scholiax-purple">
                              {task.averageScore || 0}%
                            </div>
                            <div className="text-xs text-gray-600">average score</div>
                          </div>
                        </div>
                        <div className="relative h-4 w-full overflow-hidden rounded-full bg-gray-200 mb-2">
                          <div 
                            className="h-full transition-all duration-300 ease-in-out"
                            style={{ 
                              width: `${task.averageScore || 0}%`,
                              backgroundColor: '#4c1d95'
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{task.totalSubmissions} submissions</span>
                          <span>{task.submissionRate}% submission rate</span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex space-x-2">
                            <Badge className={getStatusColor(task.status)}>
                              {task.status}
                            </Badge>
                            <Badge variant="outline">
                              {task.maxPoints} points
                            </Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4 mr-2" />
                              Export
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No assignment progress data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
}
