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
  User,
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
  UserX,
  Award,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDateMedium } from '@/lib/utils';
import { useStudentProgressDetail, useStudentMaterials, useStudentAssignments } from '@/hooks/use-progress';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function StudentProgressPage() {
  const params = useParams();
  const courseId = params?.courseId as string;
  const studentId = params?.studentId as string;
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: studentData, isLoading: studentLoading } = useStudentProgressDetail(studentId, courseId);
  const { data: materialsData, isLoading: materialsLoading } = useStudentMaterials(studentId, courseId, 1, 50);
  const { data: assignmentsData, isLoading: assignmentsLoading } = useStudentAssignments(studentId, courseId, 1, 50);

  const student = studentData?.data;
  const materials = materialsData?.data || [];
  const assignments = assignmentsData?.data || [];

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

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    if (grade >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeStatus = (grade: number) => {
    if (grade >= 90) return 'A';
    if (grade >= 80) return 'B';
    if (grade >= 70) return 'C';
    if (grade >= 60) return 'D';
    return 'F';
  };

  if (user?.role !== 'lecturer') {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">Only lecturers can access student progress.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (studentLoading) {
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

  if (!student) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Student not found</h3>
          <p className="text-gray-600">The student you're looking for doesn't exist.</p>
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
          <Link href={`/progress/course/${courseId}`} className="inline-flex items-center text-scholiax-purple hover:text-scholiax-purple/90 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Course Progress
          </Link>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-scholiax-purple/10 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-scholiax-purple">
                {student.name.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">{student.name}</h1>
              <p className="text-lg text-gray-600 mt-1">
                {student.email} • {student.courseTitle}
              </p>
            </div>
          </div>
        </div>

        {/* Student Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getProgressColor(student.overallProgress)}`}>
                {student.overallProgress}%
              </div>
              <p className="text-xs text-muted-foreground">
                {getProgressStatus(student.overallProgress)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Materials Completed</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{student.completedMaterials}</div>
              <p className="text-xs text-muted-foreground">
                of {student.totalMaterials} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assignments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{student.submittedAssignments}</div>
              <p className="text-xs text-muted-foreground">
                of {student.totalAssignments} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{student.totalTimeSpent}h</div>
              <p className="text-xs text-muted-foreground">
                {student.averageTimePerMaterial}min avg
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Progress Overview</span>
                </CardTitle>
                <CardDescription>
                  Overall progress and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Overall Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Overall Course Progress</span>
                      <span className={`text-sm font-bold ${getProgressColor(student.overallProgress)}`}>
                        {student.overallProgress}%
                      </span>
                    </div>
                    <Progress value={student.overallProgress} className="h-3" />
                  </div>

                  {/* Material Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Material Completion</span>
                      <span className="text-sm font-bold text-scholiax-purple">
                        {Math.round((student.completedMaterials / student.totalMaterials) * 100)}%
                      </span>
                    </div>
                    <Progress value={(student.completedMaterials / student.totalMaterials) * 100} className="h-3" />
                  </div>

                  {/* Assignment Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Assignment Submission</span>
                      <span className="text-sm font-bold text-scholiax-teal">
                        {Math.round((student.submittedAssignments / student.totalAssignments) * 100)}%
                      </span>
                    </div>
                    <Progress value={(student.submittedAssignments / student.totalAssignments) * 100} className="h-3" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
                <CardDescription>
                  Key performance indicators and achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Grade</span>
                      <span className={`text-lg font-bold ${getGradeColor(student.averageGrade)}`}>
                        {student.averageGrade}% ({getGradeStatus(student.averageGrade)})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Last Activity</span>
                      <span className="text-sm font-bold">{formatDateMedium(student.lastActivity)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Streak Days</span>
                      <span className="text-sm font-bold">{student.streakDays} days</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Course Rank</span>
                      <span className="text-sm font-bold">#{student.rank} of {student.totalStudents}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Participation Score</span>
                      <span className="text-sm font-bold">{student.participationScore}/100</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Engagement Level</span>
                      <Badge className={student.engagementLevel === 'high' ? 'bg-green-100 text-green-800' : 
                                        student.engagementLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                        'bg-red-100 text-red-800'}>
                        {student.engagementLevel}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Material Progress</CardTitle>
                <CardDescription>
                  Detailed progress on course materials
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
                    {materials.map((material, index) => (
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
                              {material.type} • {material.fileSize}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${getProgressColor(material.progress)}`}>
                              {material.progress}%
                            </div>
                            <Badge className={getStatusColor(material.status)}>
                              {material.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <Progress value={material.progress} className="mb-3" />
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{material.timeSpent}min spent</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Last: {formatDateMedium(material.lastAccessed)}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Target className="w-4 h-4" />
                              <span>{material.attempts} attempts</span>
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              View Material
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No materials available for this student</p>
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
                  Assignment submissions and grades
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assignmentsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : assignments.length > 0 ? (
                  <div className="space-y-4">
                    {assignments.map((assignment, index) => (
                      <motion.div
                        key={assignment._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{assignment.title}</h4>
                            <p className="text-sm text-gray-600">
                              {assignment.type} • Due: {formatDateMedium(assignment.dueDate)}
                            </p>
                          </div>
                          <div className="text-right">
                            {assignment.grade !== null ? (
                              <div className={`text-lg font-bold ${getGradeColor(assignment.grade)}`}>
                                {assignment.grade}%
                              </div>
                            ) : (
                              <div className="text-lg font-bold text-gray-500">
                                Not Graded
                              </div>
                            )}
                            <Badge className={getStatusColor(assignment.status)}>
                              {assignment.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Submitted: {assignment.submittedAt ? formatDateMedium(assignment.submittedAt) : 'Not submitted'}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{assignment.timeSpent}min spent</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <FileText className="w-4 h-4" />
                              <span>{assignment.fileCount} files</span>
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              View Submission
                            </Button>
                            {assignment.grade !== null && (
                              <Button size="sm" variant="outline">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            )}
                          </div>
                        </div>
                        {assignment.feedback && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <strong>Feedback:</strong> {assignment.feedback}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No assignments available for this student</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Study Patterns</CardTitle>
                  <CardDescription>
                    Learning behavior and time patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Most Active Day</span>
                      <span className="text-sm font-bold">{student.mostActiveDay}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Peak Study Time</span>
                      <span className="text-sm font-bold">{student.peakStudyTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Session Length</span>
                      <span className="text-sm font-bold">{student.averageSessionLength}min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Sessions</span>
                      <span className="text-sm font-bold">{student.totalSessions}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                  <CardDescription>
                    Student accomplishments and milestones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {student.achievements?.map((achievement, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Award className="w-5 h-5 text-scholiax-purple" />
                        <div>
                          <div className="text-sm font-medium">{achievement.title}</div>
                          <div className="text-xs text-gray-600">{achievement.description}</div>
                        </div>
                        <Star className="w-4 h-4 text-yellow-500" />
                      </div>
                    )) || (
                      <div className="text-center py-4">
                        <Award className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">No achievements yet</p>
                      </div>
                    )}
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




