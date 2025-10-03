'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Calendar, 
  Clock, 
  Upload, 
  X, 
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Save,
  Send
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDateMedium } from '@/lib/utils';
import { useTask, useCreateSubmission, useSubmitAssignment } from '@/hooks/use-tasks';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface FileUpload {
  file: File;
  id: string;
  progress: number;
}

export default function SubmitAssignmentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const taskId = params.id as string;

  const [content, setContent] = useState('');
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isDraft, setIsDraft] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: task, isLoading, error } = useTask(taskId);
  const createSubmissionMutation = useCreateSubmission();
  const submitAssignmentMutation = useSubmitAssignment();

  // Debug logging
  console.log('Task data:', task);
  console.log('Max file size:', task?.maxFileSize);
  console.log('Max files:', task?.maxFiles);

  // Check if user can submit
  const canSubmit = task?.canSubmit?.canSubmit ?? false;
  const submitReason = task?.canSubmit?.reason;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    selectedFiles.forEach(file => {
      // Check file size - maxFileSize is stored in MB, so convert to bytes
      const maxSizeInBytes = (task?.maxFileSize || 10) * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        toast.error(`File ${file.name} is too large. Maximum size is ${task?.maxFileSize || 10}MB`);
        return;
      }

      // Check file type
      if (task?.allowedFileTypes && task.allowedFileTypes.length > 0) {
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (!fileExtension || !task.allowedFileTypes.includes(fileExtension)) {
          toast.error(`File type .${fileExtension} is not allowed. Allowed types: ${task?.allowedFileTypes.join(', ')}`);
          return;
        }
      }

      // Check max files
      if (files.length >= (task?.maxFiles || 5)) {
        toast.error(`Maximum ${task?.maxFiles || 5} files allowed`);
        return;
      }

      const fileUpload: FileUpload = {
        file,
        id: Math.random().toString(36).substr(2, 9),
        progress: 0
      };

      setFiles(prev => [...prev, fileUpload]);
    });
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleSaveDraft = async () => {
    if (!task) return;

    setIsSubmitting(true);
    try {
      await createSubmissionMutation.mutateAsync({
        taskId: task._id,
        submissionData: {
          content,
          status: 'draft'
        }
      });

      toast.success('Draft saved successfully!');
    } catch (error: any) {
      console.error('Error saving draft:', error);
      const message = error?.response?.data?.message || 'Failed to save draft. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!task) return;

    if (!canSubmit) {
      toast.error(submitReason || 'Cannot submit assignment');
      return;
    }

    setIsSubmitting(true);
    try {
      // Try to submit directly
      await submitAssignmentMutation.mutateAsync({
        taskId: task._id,
        submissionData: {
          content,
          status: 'submitted'
        }
      });

      toast.success('Assignment submitted successfully!');
      router.push('/assignments');
    } catch (error: any) {
      // If submission doesn't exist yet, create it and retry submit once
      const statusCode = error?.response?.status;
      const message = error?.response?.data?.message;
      if (statusCode === 404 && message === 'Submission not found') {
        try {
          await createSubmissionMutation.mutateAsync({
            taskId: task._id,
            submissionData: {
              content,
              status: 'draft'
            }
          });

          await submitAssignmentMutation.mutateAsync({
            taskId: task._id,
            submissionData: {
              content,
              status: 'submitted'
            }
          });

          toast.success('Assignment submitted successfully!');
          router.push('/assignments');
        } catch (retryErr: any) {
          console.error('Retry submit error:', retryErr);
          const retryMsg = retryErr?.response?.data?.message || 'Failed to submit assignment. Please try again.';
          toast.error(retryMsg);
        }
      } else {
        console.error('Error submitting assignment:', error);
        const fallbackMsg = message || 'Failed to submit assignment. Please try again.';
        toast.error(fallbackMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (user?.role !== 'student') {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">Only students can submit assignments.</p>
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
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">Submit Assignment</h1>
              <p className="text-lg text-gray-600 mt-3">
                Complete and submit your assignment
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
                    <span className="text-sm font-medium">Time Remaining:</span>
                    <Badge className={isOverdue ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                      {timeRemaining}
                    </Badge>
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

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">File Requirements:</h4>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div>Max files: {task.maxFiles}</div>
                    <div>Max size: {task.maxFileSize || 10}MB per file</div>
                    {task.allowedFileTypes && task.allowedFileTypes.length > 0 && (
                      <div>Allowed types: {task.allowedFileTypes.join(', ')}</div>
                    )}
                  </div>
                </div>

                {!canSubmit && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {submitReason || 'Cannot submit this assignment'}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Submission Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Your Submission</CardTitle>
                <CardDescription>
                  Complete your assignment and submit it before the due date
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">Assignment Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Write your assignment content here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={10}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500">
                    Provide detailed answers, explanations, or responses as required by the assignment.
                  </p>
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="files">Upload Files</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-scholiax-purple transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag and drop files here, or click to select files
                    </p>
                    <Input
                      id="files"
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('files')?.click()}
                      disabled={files.length >= (task.maxFiles || 5)}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Files
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      {files.length}/{task.maxFiles || 5} files selected
                    </p>
                  </div>

                  {/* File List */}
                  {files.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Selected Files:</h4>
                      {files.map((fileUpload) => (
                        <div key={fileUpload.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium">{fileUpload.file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(fileUpload.file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(fileUpload.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSaveDraft}
                      disabled={isSubmitting}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Draft
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!canSubmit || isSubmitting || !content.trim()}
                      className="bg-scholiax-purple hover:bg-scholiax-purple/90"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Assignment
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {!canSubmit && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {submitReason || 'You cannot submit this assignment at this time.'}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}