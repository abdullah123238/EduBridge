'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Calendar, 
  Clock, 
  Download, 
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  User,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDateMedium } from '@/lib/utils';
import { useTask, useSubmission } from '@/hooks/use-tasks';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export default function ViewSubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const taskId = params.id as string;

  const { data: task, isLoading: taskLoading, error: taskError } = useTask(taskId);
  const { data: submission, isLoading: submissionLoading, error: submissionError } = useSubmission(taskId);

  const isLoading = taskLoading || submissionLoading;
  const error = taskError || submissionError;

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

  const getGradeColor = (grade: string) => {
    if (grade?.startsWith('A')) return 'text-green-600';
    if (grade?.startsWith('B')) return 'text-blue-600';
    if (grade?.startsWith('C')) return 'text-yellow-600';
    if (grade?.startsWith('D')) return 'text-orange-600';
    if (grade === 'F') return 'text-red-600';
    return 'text-gray-600';
  };

  const downloadFile = (file: any) => {
    const link = document.createElement('a');
    link.href = file.fileUrl;
    link.download = file.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-scholiax-purple mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Submission...</h3>
          <p className="text-gray-600">Please wait while we load your submission details.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !task) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Submission Not Found</h3>
          <p className="text-gray-600 mb-6">
            The submission you're looking for doesn't exist or you don't have access to it.
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

  if (user?.role !== 'student') {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">Only students can view submissions.</p>
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
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">View Submission</h1>
              <p className="text-lg text-gray-600 mt-3">
                Review your submitted assignment
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Assignment Details */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-scholiax-purple" />
                  <span>Assignment Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{task.title}</h3>
                  <p className="text-sm text-gray-600">{task.course.title}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Due Date:</span>
                    <span className="text-sm">{formatDateMedium(task.dueDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Points:</span>
                    <span className="text-sm font-semibold">{task.maxPoints}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Priority:</span>
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

                {task.description && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Description:</h4>
                    <p className="text-sm text-gray-600">{task.description}</p>
                  </div>
                )}

                {task.instructions && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Instructions:</h4>
                    <p className="text-sm text-gray-600">{task.instructions}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Submission Details */}
          <div className="lg:col-span-2">
            {submission ? (
              <div className="space-y-6">
                {/* Submission Status */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Submission Status</span>
                      </CardTitle>
                      <Badge className={getStatusColor(submission.status)}>
                        {submission.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium">Submitted:</span>
                        <p className="text-sm text-gray-600">
                          {submission.submittedAt ? formatDateMedium(submission.submittedAt) : 'Not submitted'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Attempt:</span>
                        <p className="text-sm text-gray-600">#{submission.attemptNumber}</p>
                      </div>
                    </div>

                    {submission.isLate && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          This submission was late. Late penalty: {submission.latePenalty}%
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Grading Results */}
                {submission.status === 'graded' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <span>Grading Results</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className={`text-3xl font-bold ${getGradeColor(submission.grade || '')}`}>
                            {submission.grade || 'N/A'}
                          </div>
                          <p className="text-sm text-gray-600">Grade</p>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-scholiax-purple">
                            {submission.score}
                          </div>
                          <p className="text-sm text-gray-600">Score</p>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-scholiax-teal">
                            {submission.percentage}%
                          </div>
                          <p className="text-sm text-gray-600">Percentage</p>
                        </div>
                      </div>

                      {submission.gradedAt && (
                        <div className="pt-4 border-t">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Graded on:</span>
                            <span className="text-sm text-gray-600">{formatDateMedium(submission.gradedAt)}</span>
                          </div>
                          {submission.gradedBy && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Graded by:</span>
                              <span className="text-sm text-gray-600">{submission.gradedBy.name}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {submission.feedback && (
                        <div className="pt-4 border-t">
                          <h4 className="text-sm font-medium mb-2">Instructor Feedback:</h4>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">{submission.feedback}</p>
                          </div>
                        </div>
                      )}

                      {submission.instructorNotes && (
                        <div className="pt-4 border-t">
                          <h4 className="text-sm font-medium mb-2">Instructor Notes:</h4>
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-700">{submission.instructorNotes}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Submission Content */}
                <Card>
                  <CardHeader>
                    <CardTitle>Your Submission</CardTitle>
                    <CardDescription>
                      The content and files you submitted
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {submission.content && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Content:</h4>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{submission.content}</p>
                        </div>
                      </div>
                    )}

                    {submission.files && submission.files.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Uploaded Files:</h4>
                        <div className="space-y-2">
                          {submission.files.map((file: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <FileText className="w-4 h-4 text-gray-500" />
                                <div>
                                  <p className="text-sm font-medium">{file.originalName}</p>
                                  <p className="text-xs text-gray-500">
                                    {(file.fileSize / 1024 / 1024).toFixed(2)} MB • {file.fileType}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadFile(file)}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {submission.comments && submission.comments.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Comments:</h4>
                        <div className="space-y-3">
                          {submission.comments.map((comment: any, index: number) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-2 mb-2">
                                <User className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium">{comment.author.name}</span>
                                {comment.isInstructor && (
                                  <Badge className="bg-scholiax-purple text-white text-xs">Instructor</Badge>
                                )}
                                <span className="text-xs text-gray-500">
                                  {formatDateMedium(comment.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{comment.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Submission Found</h3>
                  <p className="text-gray-600 mb-6">
                    You haven't submitted this assignment yet.
                  </p>
                  <Link href={`/assignments/${taskId}/submit`}>
                    <Button className="bg-scholiax-purple hover:bg-scholiax-purple/90">
                      Submit Assignment
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}




