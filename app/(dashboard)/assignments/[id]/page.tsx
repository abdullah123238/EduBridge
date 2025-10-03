'use client';

import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Calendar, 
  Clock, 
  Users, 
  ArrowLeft,
  AlertCircle,
  BookOpen,
  User,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDateMedium } from '@/lib/utils';
import { useTask } from '@/hooks/use-tasks';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export default function AssignmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const taskId = params.id as string;

  const { data: task, isLoading, error } = useTask(taskId);

  const isOverdue = task ? new Date() > new Date(task.dueDate) : false;
  const timeRemaining = task ? (() => {
    const now = new Date();
    const due = new Date(task.dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `${diffDays} days left`;
  })() : '';

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-scholiax-purple mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Assignment...</h3>
          <p className="text-gray-600">Please wait while we load the assignment details.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !task) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Assignment Not Found</h3>
          <p className="text-gray-600 mb-6">
            The assignment you're looking for doesn't exist or you don't have access to it.
          </p>
          <Link href="/assignments">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Assignments
            </Button>
          </Link>
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
          <div className="flex items-center justify-between">
            <div>
              <Link href="/assignments" className="inline-flex items-center text-scholiax-purple hover:text-scholiax-purple/90 mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Assignments
              </Link>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">{task.title}</h1>
              <p className="text-lg text-gray-600 mt-3">
                Assignment Details
              </p>
            </div>
            {user?.role === 'student' && (
              <div className="flex items-center space-x-3">
                {task.submission ? (
                  <Link href={`/assignments/${task._id}/submission`}>
                    <Button className="bg-scholiax-purple hover:bg-scholiax-purple/90">
                      <FileText className="mr-2 h-4 w-4" />
                      View Submission
                    </Button>
                  </Link>
                ) : task.canSubmit?.canSubmit ? (
                  <Link href={`/assignments/${task._id}/submit`}>
                    <Button className="bg-scholiax-purple hover:bg-scholiax-purple/90">
                      <FileText className="mr-2 h-4 w-4" />
                      Submit Assignment
                    </Button>
                  </Link>
                ) : (
                  <Button disabled variant="outline">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Cannot Submit
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Assignment Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-scholiax-purple" />
                  <span>Assignment Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Course</span>
                    <p className="text-lg font-semibold">{task.course.title}</p>
                    <p className="text-sm text-gray-600">{task.course.code}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Points</span>
                    <p className="text-lg font-semibold">{task.maxPoints}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Due Date</span>
                    <p className="text-lg font-semibold">{formatDateMedium(task.dueDate)}</p>
                    <Badge className={isOverdue ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                      {timeRemaining}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Priority</span>
                    <Badge className={
                      task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }>
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {task.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            {task.instructions && (
              <Card>
                <CardHeader>
                  <CardTitle>Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{task.instructions}</p>
                </CardContent>
              </Card>
            )}

            {/* Learning Objectives */}
            {task.learningObjectives && task.learningObjectives.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-scholiax-teal" />
                    <span>Learning Objectives</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {task.learningObjectives.map((objective, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-scholiax-teal rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Resources */}
            {task.resources && task.resources.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-scholiax-lavender" />
                    <span>Resources</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {task.resources.map((resource, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{resource.title}</h4>
                            <p className="text-sm text-gray-600">{resource.type}</p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                              View Resource
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assignment Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Assignment Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Submissions</span>
                  <span className="text-lg font-semibold">{task.totalSubmissions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Average Score</span>
                  <span className="text-lg font-semibold">{task.averageScore || 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Completion Rate</span>
                  <span className="text-lg font-semibold">{task.completionRate || 0}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Assignment Details */}
            <Card>
              <CardHeader>
                <CardTitle>Assignment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Type</span>
                  <Badge className="bg-scholiax-purple text-white">
                    {task.type}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge className={
                    task.status === 'published' ? 'bg-green-100 text-green-800' :
                    task.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {task.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Grading</span>
                  <span className="text-sm">{task.gradingType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Attempts</span>
                  <span className="text-sm">{task.attempts}</span>
                </div>
                {task.timeLimit && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Time Limit</span>
                    <span className="text-sm">{task.timeLimit} minutes</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instructor Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-500" />
                  <span>Instructor</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="font-medium">{task.createdBy.name}</p>
                  <p className="text-sm text-gray-600">{task.createdBy.email}</p>
                </div>
              </CardContent>
            </Card>

            {/* File Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>File Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Max Files</span>
                  <span className="text-sm">{task.maxFiles}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Max Size</span>
                  <span className="text-sm">{task.maxFileSize || 10}MB</span>
                </div>
                {task.allowedFileTypes && task.allowedFileTypes.length > 0 && (
                  <div>
                    <span className="text-sm font-medium">Allowed Types</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {task.allowedFileTypes.map((type, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          .{type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
