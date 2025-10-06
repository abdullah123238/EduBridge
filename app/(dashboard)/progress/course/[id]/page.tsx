'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  Users,
  BookOpen,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Download,
  Eye,
  Calendar,
  Target,
  BarChart3,
  UserCheck,
  UserX
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDateMedium } from '@/lib/utils';
import { useCourseProgressDetail, useCourseStudents, useCourseMaterials } from '@/hooks/use-progress';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CourseProgressPage() {
  const params = useParams();
  const courseId = params?.id as string;
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const { data: courseData, isLoading: courseLoading } = useCourseProgressDetail(courseId);
  const { data: studentsData, isLoading: studentsLoading } = useCourseStudents(courseId, 1, 50);
  const { data: materialsData, isLoading: materialsLoading } = useCourseMaterials(courseId, 1, 50);

  const course = courseData;
  const students = studentsData?.data || [];
  const materials = materialsData?.data || [];

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
          <p className="text-gray-600">Only lecturers can access course progress.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (courseLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Course not found</h3>
          <p className="text-gray-600">The course you're looking for doesn't exist.</p>
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
        <div className="mb-8">
          <Link href="/progress" className="inline-flex items-center text-scholiax-purple hover:text-scholiax-purple/90 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Progress Tracking
          </Link>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">{course?.course?.title}</h1>
          <p className="text-lg text-gray-600 mt-3">
            Track student progress and engagement
          </p>
        </div>

        {/* Course Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
              <p className="text-xs text-muted-foreground">
                {students.filter((s: any) => s.status === 'active').length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getProgressColor(course?.overallProgress || 0)}`}>
                {course?.overallProgress || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {getProgressStatus(course?.overallProgress || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Materials</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{course?.totalMaterials || 0}</div>
              <p className="text-xs text-muted-foreground">
                {course?.completedMaterials || 0} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assignments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{materials.length}</div>
              <p className="text-xs text-muted-foreground">
                {materials.filter((m: any) => m.status === 'submitted').length} submitted
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Course Progress Overview</span>
                </CardTitle>
                <CardDescription>
                  Overall progress and engagement metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Overall Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Overall Course Progress</span>
                      <span className={`text-sm font-bold ${getProgressColor(course?.overallProgress || 0)}`}>
                        {course?.overallProgress || 0}%
                      </span>
                    </div>
                    <Progress value={course?.overallProgress || 0} className="h-3" />
                  </div>

                  {/* Material Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Material Completion</span>
                      <span className="text-sm font-bold text-scholiax-purple">
                        {Math.round((course.completedMaterials / course.totalMaterials) * 100)}%
                      </span>
                    </div>
                    <Progress value={(course.completedMaterials / course.totalMaterials) * 100} className="h-3" />
                  </div>

                  {/* Assignment Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Assignment Submission</span>
                      <span className="text-sm font-bold text-scholiax-teal">
                        {materials.length > 0 ? Math.round((materials.filter((m: any) => m.status === 'submitted').length / materials.length) * 100) : 0}%
                      </span>
                    </div>
                    <Progress value={materials.length > 0 ? (materials.filter((m: any) => m.status === 'submitted').length / materials.length) * 100 : 0} className="h-3" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Student Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Student Performance Distribution</CardTitle>
                <CardDescription>
                  How students are performing across different metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{students.filter((s: any) => (s.progress || 0) >= 80).length}</div>
                    <div className="text-sm text-gray-600">Excellent (80%+)</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{students.filter((s: any) => (s.progress || 0) >= 60 && (s.progress || 0) < 80).length}</div>
                    <div className="text-sm text-gray-600">Good (60-79%)</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{students.filter((s: any) => (s.progress || 0) < 40).length}</div>
                    <div className="text-sm text-gray-600">At Risk (&lt;40%)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Progress</CardTitle>
                <CardDescription>
                  Individual student progress and engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                {studentsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : students.length > 0 ? (
                  <div className="space-y-4">
                    {students.map((student: any, index: number) => (
                      <motion.div
                        key={student._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-scholiax-purple/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-scholiax-purple">
                                {student.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium">{student.name}</h4>
                              <p className="text-sm text-gray-600">{student.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${getProgressColor(student.progress)}`}>
                              {student.progress}%
                            </div>
                            <div className="text-xs text-gray-600">
                              {getProgressStatus(student.progress)}
                            </div>
                          </div>
                        </div>
                        <Progress value={student.progress} className="mb-3" />
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                              <CheckCircle className="w-4 h-4" />
                              <span>{student.completedMaterials} materials</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <FileText className="w-4 h-4" />
                              <span>{student.submittedAssignments} assignments</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{student.totalTimeSpent}h spent</span>
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <Link href={`/progress/student/${courseId}/${student._id}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </Link>
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
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No students enrolled in this course</p>
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
                {materialsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-200 rounded"></div>
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
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{material.title}</h4>
                            <p className="text-sm text-gray-600">
                              {material.type} • {material.totalStudents} students
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-scholiax-purple">
                              {material.completionRate}%
                            </div>
                            <div className="text-xs text-gray-600">completion rate</div>
                          </div>
                        </div>
                        <Progress value={material.completionRate} className="mb-3" />
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                              <UserCheck className="w-4 h-4" />
                              <span>{material.completedStudents} completed</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{material.averageTimeSpent}min avg</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Last: {formatDateMedium(material.lastAccessed)}</span>
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
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
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No materials available for this course</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Trends</CardTitle>
                  <CardDescription>
                    Student activity over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Engagement analytics coming soon</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Insights</CardTitle>
                  <CardDescription>
                    Key performance indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Time per Material</span>
                      <span className="text-sm font-bold">{materials.length > 0 ? Math.round(course?.totalTimeSpent / materials.length) : 0}min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Most Active Day</span>
                      <span className="text-sm font-bold">Monday</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Completion Rate</span>
                      <span className="text-sm font-bold">{course?.overallProgress || 0}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Student Retention</span>
                      <span className="text-sm font-bold">{students.length > 0 ? Math.round((students.filter((s: any) => s.status === 'active').length / students.length) * 100) : 0}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
}
