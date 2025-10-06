'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Calendar, 
  Clock, 
  Users, 
  AlertCircle,
  CheckCircle,
  Play,
  Eye,
  Plus,
  Download,
  MessageSquare,
  Edit,
  Trash2,
  BookOpen,
  Target,
  TrendingUp,
  UserCheck,
  UserX,
  Upload
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDateMedium } from '@/lib/utils';
import { useLecturerTasks, useCourses, useStudentTasks } from '@/hooks/use-tasks';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import toast from 'react-hot-toast';

// Lecturer Assignment Component
function LecturerAssignmentsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCourse, setSelectedCourse] = useState<string>('');

  const { data: tasksData, isLoading: tasksLoading, error: tasksError } = useLecturerTasks(1, 50, { type: 'assignment' });
  const { data: coursesData, isLoading: coursesLoading, error: coursesError } = useCourses(1, 50);
  
  const assignments = tasksData?.data || [];
  const courses = coursesData?.data || [];

  // Debug logging
  console.log('Lecturer Assignments Debug:', {
    user,
    tasksData,
    coursesData,
    tasksLoading,
    coursesLoading,
    tasksError,
    coursesError,
    assignments,
    courses,
    userRole: user?.role,
    isAuthenticated: !!user
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'archived':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date() > new Date(dueDate);
  };

  const getTimeRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `${diffDays} days left`;
  };

  const getSubmissionStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'graded':
        return 'bg-green-100 text-green-800';
      case 'late':
        return 'bg-red-100 text-red-800';
      case 'not_submitted':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">Assignment Management</h1>
              <p className="text-lg text-gray-600 mt-3">
                Create and manage assignments for your courses
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/assignments/create">
                <Button className="bg-scholiax-purple hover:bg-scholiax-purple/90 shadow-lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Assignment
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignments.length}</div>
              <p className="text-xs text-muted-foreground">
                {assignments.filter((a: any) => a.status === 'published').length} published
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assignments.reduce((sum: number, a: any) => sum + (a.totalSubmissions || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all assignments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Grading</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assignments.reduce((sum: number, a: any) => sum + (a.pendingGrading || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Need your attention
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
                With assignments
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assignments">All Assignments</TabsTrigger>
            <TabsTrigger value="courses">By Course</TabsTrigger>
            <TabsTrigger value="grading">Grading Queue</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Recent Activity</span>
                </CardTitle>
                <CardDescription>
                  Latest assignment submissions and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assignments.slice(0, 5).map((assignment: any, index: number) => (
                    <div key={assignment._id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="p-2 bg-scholiax-purple/10 rounded-full">
                        <FileText className="w-4 h-4 text-scholiax-purple" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{assignment.title}</p>
                        <p className="text-xs text-gray-600">
                          {assignment.totalSubmissions} submissions • {assignment.course.title}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDateMedium(assignment.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Course Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5" />
                  <span>Course Overview</span>
                </CardTitle>
                <CardDescription>
                  Assignment distribution across your courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courses.map((course: any, index: number) => {
                    const courseAssignments = assignments.filter((a: any) => a.course._id === course._id);
                    return (
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
                            <p className="text-sm text-gray-600">{course.code}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-scholiax-purple">
                              {courseAssignments.length}
                            </div>
                            <div className="text-xs text-gray-600">assignments</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{courseAssignments.filter((a: any) => a.status === 'published').length} published</span>
                          <span>{courseAssignments.reduce((sum: number, a: any) => sum + (a.totalSubmissions || 0), 0)} submissions</span>
                          <Link href={`/assignments/course/${course._id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              View Assignments
                            </Button>
                          </Link>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            {tasksError ? (
              <div className="text-center py-12">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Assignments</h3>
                <p className="text-gray-600 mb-4">
                  {tasksError.message || 'Failed to load assignments. Please try again.'}
                </p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Retry
                </Button>
              </div>
            ) : tasksLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
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
            ) : assignments.length > 0 ? (
              <div className="space-y-4">
                {assignments.map((assignment: any, index: number) => (
                  <motion.div
                    key={assignment._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="p-2 bg-scholiax-purple/10 rounded-lg">
                              <FileText className="w-5 h-5 text-scholiax-purple" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg mb-2">{assignment.title}</CardTitle>
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Badge className={getStatusColor(assignment.status)}>
                                  {assignment.status}
                                </Badge>
                                <Badge className={getPriorityColor(assignment.priority)}>
                                  {assignment.priority}
                                </Badge>
                                <Badge className="bg-scholiax-purple text-white">
                                  {assignment.maxPoints} points
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>Due: {formatDateMedium(assignment.dueDate)}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span className={isOverdue(assignment.dueDate) ? 'text-red-600 font-medium' : ''}>
                                    {getTimeRemaining(assignment.dueDate)}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Users className="w-4 h-4" />
                                  <span>{assignment.totalSubmissions} submissions</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <CardDescription className="mb-4 line-clamp-2">
                          {assignment.description}
                        </CardDescription>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Course:</span> {assignment.course.title}
                            {assignment.instructions && (
                              <>
                                <span className="mx-2">•</span>
                                <span>Has instructions</span>
                              </>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Link href={`/assignments/${assignment._id}/grade`}>
                              <Button size="sm" className="bg-scholiax-teal hover:bg-scholiax-teal/90">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Grade ({assignment.pendingGrading || 0})
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
                <p className="text-gray-600 mb-6">
                  Create your first assignment to get started
                </p>
                <Link href="/assignments/create">
                  <Button className="bg-scholiax-purple hover:bg-scholiax-purple/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Assignment
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assignments by Course</CardTitle>
                <CardDescription>
                  Manage assignments for each of your courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {coursesLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : courses.length > 0 ? (
                  <div className="space-y-4">
                    {courses.map((course: any, index: number) => {
                      const courseAssignments = assignments.filter((a: any) => a.course._id === course._id);
                      return (
                        <motion.div
                          key={course._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="font-medium text-lg">{course.title}</h4>
                              <p className="text-sm text-gray-600">{course.code} • {course.enrolledStudents} students</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Link href={`/assignments/course/${course._id}`}>
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View All
                                </Button>
                              </Link>
                              <Link href={`/assignments/create?course=${course._id}`}>
                                <Button size="sm" className="bg-scholiax-purple hover:bg-scholiax-purple/90">
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Assignment
                                </Button>
                              </Link>
                            </div>
                          </div>
                          
                          {courseAssignments.length > 0 ? (
                            <div className="space-y-3">
                              {courseAssignments.slice(0, 3).map((assignment: any) => (
                                <div key={assignment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 rounded-full bg-scholiax-purple"></div>
                                    <div>
                                      <div className="text-sm font-medium">{assignment.title}</div>
                                      <div className="text-xs text-gray-600">
                                        Due: {formatDateMedium(assignment.dueDate)} • {assignment.totalSubmissions} submissions
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge className={getStatusColor(assignment.status)}>
                                      {assignment.status}
                                    </Badge>
                                    {assignment.pendingGrading > 0 && (
                                      <Badge className="bg-orange-100 text-orange-800">
                                        {assignment.pendingGrading} to grade
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                              {courseAssignments.length > 3 && (
                                <div className="text-center">
                                  <Link href={`/assignments/course/${course._id}`}>
                                    <Button size="sm" variant="outline">
                                      View {courseAssignments.length - 3} more assignments
                                    </Button>
                                  </Link>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-6">
                              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">No assignments yet</p>
                              <Link href={`/assignments/create?course=${course._id}`}>
                                <Button size="sm" variant="outline" className="mt-2">
                                  <Plus className="w-4 h-4 mr-2" />
                                  Create First Assignment
                                </Button>
                              </Link>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No courses found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grading" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Grading Queue</span>
                </CardTitle>
                <CardDescription>
                  Assignments that need grading attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : assignments.filter((a: any) => a.pendingGrading > 0).length > 0 ? (
                  <div className="space-y-4">
                    {assignments
                      .filter((a: any) => a.pendingGrading > 0)
                      .map((assignment: any, index: number) => (
                        <motion.div
                          key={assignment._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-orange-100 rounded-lg">
                                <MessageSquare className="w-5 h-5 text-orange-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">{assignment.title}</h4>
                                <p className="text-sm text-gray-600">{assignment.course.title}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-orange-600">
                                {assignment.pendingGrading}
                              </div>
                              <div className="text-xs text-gray-600">pending</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>Due: {formatDateMedium(assignment.dueDate)}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>{assignment.totalSubmissions} total submissions</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <CheckCircle className="w-4 h-4" />
                                <span>{assignment.gradedSubmissions || 0} graded</span>
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Link href={`/assignments/${assignment._id}/submissions`}>
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View All Submissions
                                </Button>
                              </Link>
                              <Link href={`/assignments/${assignment._id}/grade`}>
                                <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  Start Grading
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                    <p className="text-gray-600">No assignments need grading at the moment</p>
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

// Student Assignment Component
function StudentAssignmentsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('assignments');

  const { data: tasksData, isLoading, error } = useStudentTasks(1, 50, { type: 'assignment' });
  const assignments = tasksData?.data || [];

  // Debug logging
  console.log('Student Assignments Debug:', {
    user,
    tasksData,
    isLoading,
    error,
    assignments
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-scholiax-teal text-white';
      case 'graded':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'late':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date() > new Date(dueDate);
  };

  const getTimeRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `${diffDays} days left`;
  };

  const getGradeColor = (grade: string) => {
    if (grade?.startsWith('A')) return 'text-green-600';
    if (grade?.startsWith('B')) return 'text-blue-600';
    if (grade?.startsWith('C')) return 'text-yellow-600';
    if (grade?.startsWith('D')) return 'text-orange-600';
    if (grade === 'F') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">My Assignments</h1>
          <p className="text-lg text-gray-600 mt-3">
            View and submit your course assignments
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assignments">My Assignments</TabsTrigger>
            <TabsTrigger value="submitted">Submitted</TabsTrigger>
            <TabsTrigger value="graded">Graded</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="space-y-6">
            {error ? (
              <div className="text-center py-12">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Assignments</h3>
                <p className="text-gray-600 mb-4">
                  {error.message || 'Failed to load assignments. Please try again.'}
                </p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Retry
                </Button>
              </div>
            ) : isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
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
            ) : assignments.length > 0 ? (
              <div className="space-y-4">
                {assignments.map((assignment: any, index: number) => (
                  <motion.div
                    key={assignment._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="p-2 bg-scholiax-purple/10 rounded-lg">
                              <FileText className="w-5 h-5 text-scholiax-purple" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg mb-2">{assignment.title}</CardTitle>
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Badge className={getPriorityColor(assignment.priority)}>
                                  {assignment.priority}
                                </Badge>
                                <Badge className="bg-scholiax-purple text-white">
                                  {assignment.maxPoints} points
                                </Badge>
                                {assignment.submission && (
                                  <Badge className={getStatusColor(assignment.submission.status)}>
                                    {assignment.submission.status}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>Due: {formatDateMedium(assignment.dueDate)}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span className={isOverdue(assignment.dueDate) ? 'text-red-600 font-medium' : ''}>
                                    {getTimeRemaining(assignment.dueDate)}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Users className="w-4 h-4" />
                                  <span>{assignment.totalSubmissions} submissions</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <CardDescription className="mb-4 line-clamp-2">
                          {assignment.description}
                        </CardDescription>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Course:</span> {assignment.course.title}
                            {assignment.instructions && (
                              <>
                                <span className="mx-2">•</span>
                                <span>Has instructions</span>
                              </>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Link href={`/assignments/${assignment._id}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </Link>
                            {assignment.submission ? (
                              <Link href={`/assignments/${assignment._id}/submission`}>
                                <Button size="sm" className="bg-scholiax-purple hover:bg-scholiax-purple/90">
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  View Submission
                                </Button>
                              </Link>
                            ) : assignment.canSubmit?.canSubmit ? (
                              <Link href={`/assignments/${assignment._id}/submit`}>
                                <Button size="sm" className="bg-scholiax-purple hover:bg-scholiax-purple/90">
                                  <Upload className="w-4 h-4 mr-2" />
                                  Submit Assignment
                                </Button>
                              </Link>
                            ) : (
                              <Button size="sm" variant="outline" disabled>
                                <AlertCircle className="w-4 h-4 mr-2" />
                                {assignment.canSubmit?.reason || 'Cannot submit'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
                <p className="text-gray-600 mb-6">
                  You don't have any assignments assigned yet
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="submitted" className="space-y-6">
            <div className="space-y-4">
              {assignments
                .filter((a: any) => a.submission && (a.submission.status === 'submitted' || a.submission.status === 'graded'))
                .map((assignment: any, index: number) => (
                  <motion.div
                    key={assignment._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{assignment.title}</CardTitle>
                            <CardDescription>
                              {assignment.submission!.status === 'graded' 
                                ? `Graded on ${formatDateMedium(assignment.submission!.gradedAt!)}`
                                : `Submitted on ${formatDateMedium(assignment.submission!.submittedAt!)}`
                              }
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            {assignment.submission!.status === 'graded' ? (
                              <>
                                <div className={`text-2xl font-bold ${getGradeColor(assignment.submission!.grade!)}`}>
                                  {assignment.submission!.grade}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {assignment.submission!.score}/{assignment.submission!.maxScore} points
                                </div>
                              </>
                            ) : (
                              <Badge className="bg-scholiax-teal text-white">
                                Submitted
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {assignment.submission!.status === 'graded' && (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Score:</span>
                                <span className="text-sm">{assignment.submission!.percentage}%</span>
                              </div>
                              {assignment.submission!.feedback && (
                                <div>
                                  <span className="text-sm font-medium">Feedback:</span>
                                  <p className="text-sm text-gray-600 mt-1">{assignment.submission!.feedback}</p>
                                </div>
                              )}
                            </>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Course:</span> {assignment.course.title}
                              <span className="mx-2">•</span>
                              <span>{assignment.maxPoints} points</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-2" />
                                View {assignment.submission!.status === 'graded' ? 'Details' : 'Submission'}
                              </Button>
                              {assignment.submission!.status === 'graded' ? (
                                <Button size="sm" variant="outline">
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  Comments
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline">
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="graded" className="space-y-6">
            <div className="space-y-4">
              {assignments
                .filter((a: any) => a.submission && a.submission.status === 'graded')
                .map((assignment: any, index: number) => (
                  <motion.div
                    key={assignment._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{assignment.title}</CardTitle>
                            <CardDescription>
                              Graded on {formatDateMedium(assignment.submission!.gradedAt!)}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getGradeColor(assignment.submission!.grade!)}`}>
                              {assignment.submission!.grade}
                            </div>
                            <div className="text-sm text-gray-600">
                              {assignment.submission!.score}/{assignment.submission!.maxScore} points
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Score:</span>
                            <span className="text-sm">{assignment.submission!.percentage}%</span>
                          </div>
                          {assignment.submission!.feedback && (
                            <div>
                              <span className="text-sm font-medium">Feedback:</span>
                              <p className="text-sm text-gray-600 mt-1">{assignment.submission!.feedback}</p>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Course:</span> {assignment.course.title}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                              <Button size="sm" variant="outline">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Comments
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
}

// Main Assignment Page Component
export default function AssignmentsPage() {
  const { user, isLoading } = useAuth();

  // Debug logging
  console.log('Main Assignments Page Debug:', {
    user,
    isLoading
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-scholiax-purple mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading...</h3>
          <p className="text-gray-600">Please wait while we load your assignments.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Please log in</h3>
          <p className="text-gray-600">You need to be logged in to view assignments.</p>
        </div>
      </DashboardLayout>
    );
  }

  // Route based on user role
  if (user.role === 'lecturer') {
    return <LecturerAssignmentsPage />;
  } else if (user.role === 'student') {
    return <StudentAssignmentsPage />;
  } else {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to access assignments.</p>
        </div>
      </DashboardLayout>
    );
  }
}
