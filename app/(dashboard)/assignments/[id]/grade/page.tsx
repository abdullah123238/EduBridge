'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  FileText,
  Calendar,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  Download,
  Eye,
  MessageSquare,
  Star,
  Save,
  Send,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDateMedium } from '@/lib/utils';
import { useTaskSubmissions, useGradeSubmission } from '@/hooks/use-tasks';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import toast from 'react-hot-toast';

const gradingSchema = z.object({
  score: z.number().min(0, 'Score must be positive').max(1000, 'Score too high'),
  feedback: z.string().max(2000, 'Feedback cannot exceed 2000 characters'),
  instructorNotes: z.string().max(1000, 'Instructor notes cannot exceed 1000 characters'),
});

type GradingFormData = z.infer<typeof gradingSchema>;

export default function AssignmentGradingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const assignmentId = params?.id as string;
  const { user } = useAuth();
  
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(
    searchParams.get('submission') || null
  );
  const [gradingCriteria, setGradingCriteria] = useState<Array<{
    criterion: string;
    points: number;
    earned: number;
    feedback: string;
  }>>([]);

  const { data: submissionsData, isLoading } = useTaskSubmissions(assignmentId, 1, 50);
  const gradeSubmissionMutation = useGradeSubmission();

  const submissions = submissionsData?.data || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<GradingFormData>({
    resolver: zodResolver(gradingSchema),
    defaultValues: {
      score: 0,
      feedback: '',
      instructorNotes: ''
    }
  });

  const currentSubmission = submissions.find((s: any) => s._id === selectedSubmission);

  // Handle URL parameter changes
  useEffect(() => {
    const submissionParam = searchParams.get('submission');
    if (submissionParam && submissionParam !== selectedSubmission) {
      setSelectedSubmission(submissionParam);
    }
  }, [searchParams, selectedSubmission]);

  const addGradingCriterion = () => {
    setGradingCriteria(prev => [...prev, {
      criterion: '',
      points: 0,
      earned: 0,
      feedback: ''
    }]);
  };

  const updateGradingCriterion = (index: number, field: string, value: string | number) => {
    setGradingCriteria(prev => prev.map((criterion, i) => 
      i === index ? { ...criterion, [field]: value } : criterion
    ));
  };

  const removeGradingCriterion = (index: number) => {
    setGradingCriteria(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: GradingFormData) => {
    if (!currentSubmission) return;

    try {
      await gradeSubmissionMutation.mutateAsync({
        submissionId: currentSubmission._id,
        gradingData: {
          score: data.score,
          maxScore: currentSubmission.maxScore,
          feedback: data.feedback,
          instructorNotes: data.instructorNotes,
          gradedBy: user?._id,
          gradingCriteria
        }
      });

      toast.success('Submission graded successfully!');
      setSelectedSubmission(null);
    } catch (error) {
      toast.error('Failed to grade submission');
    }
  };

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

  if (user?.role !== 'lecturer') {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">Only lecturers can grade assignments.</p>
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
          <Link href="/assignments" className="inline-flex items-center text-scholiax-purple hover:text-scholiax-purple/90 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assignments
          </Link>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">Grade Assignments</h1>
          <p className="text-lg text-gray-600 mt-3">
            Review and grade student submissions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Submissions List */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Submissions ({submissions.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : submissions.length > 0 ? (
                  submissions.map((submission: any) => (
                    <div
                      key={submission._id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedSubmission === submission._id 
                          ? 'border-scholiax-purple bg-scholiax-purple/5' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedSubmission(submission._id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{submission.student.name}</h4>
                        <Badge className={getStatusColor(submission.status)}>
                          {submission.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>Submitted: {formatDateMedium(submission.submittedAt!)}</div>
                        {submission.isLate && (
                          <div className="text-red-600 font-medium">Late submission</div>
                        )}
                        {submission.status === 'graded' && (
                          <div className={`font-medium ${getGradeColor(submission.grade!)}`}>
                            Grade: {submission.grade} ({submission.percentage}%)
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No submissions yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Grading Interface */}
          <div className="lg:col-span-2">
            {currentSubmission ? (
              <div className="space-y-6">
                {/* Submission Details */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Submission by {currentSubmission.student.name}</CardTitle>
                        <CardDescription>
                          Submitted on {formatDateMedium(currentSubmission.submittedAt!)}
                          {currentSubmission.isLate && (
                            <span className="text-red-600 ml-2">(Late)</span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Content */}
                    {currentSubmission.content && (
                      <div>
                        <h4 className="font-medium mb-2">Content:</h4>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm whitespace-pre-wrap">{currentSubmission.content}</p>
                        </div>
                      </div>
                    )}

                    {/* Files */}
                    {currentSubmission.files.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Files:</h4>
                        <div className="space-y-2">
                          {currentSubmission.files.map((file: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center space-x-3">
                                <FileText className="w-4 h-4 text-gray-500" />
                                <div>
                                  <p className="text-sm font-medium">{file.originalName}</p>
                                  <p className="text-xs text-gray-500">
                                    {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <Button size="sm" variant="outline">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Grading Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>Grade Submission</CardTitle>
                    <CardDescription>
                      Provide score and feedback for this submission
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      {/* Score */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="score">Score *</Label>
                          <Input
                            id="score"
                            type="number"
                            placeholder="Enter score"
                            {...register('score', { valueAsNumber: true })}
                          />
                          {errors.score && (
                            <p className="text-sm text-red-600">{errors.score.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>Max Score</Label>
                          <Input
                            value={currentSubmission.maxScore}
                            disabled
                            className="bg-gray-50"
                          />
                        </div>
                      </div>

                      {/* Grading Criteria */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Grading Criteria</Label>
                          <Button type="button" variant="outline" size="sm" onClick={addGradingCriterion}>
                            Add Criterion
                          </Button>
                        </div>
                        
                        {gradingCriteria.map((criterion, index) => (
                          <div key={index} className="grid grid-cols-4 gap-2 p-3 border rounded-lg">
                            <Input
                              placeholder="Criterion"
                              value={criterion.criterion}
                              onChange={(e) => updateGradingCriterion(index, 'criterion', e.target.value)}
                            />
                            <Input
                              type="number"
                              placeholder="Points"
                              value={criterion.points}
                              onChange={(e) => updateGradingCriterion(index, 'points', Number(e.target.value))}
                            />
                            <Input
                              type="number"
                              placeholder="Earned"
                              value={criterion.earned}
                              onChange={(e) => updateGradingCriterion(index, 'earned', Number(e.target.value))}
                            />
                            <div className="flex space-x-1">
                              <Input
                                placeholder="Feedback"
                                value={criterion.feedback}
                                onChange={(e) => updateGradingCriterion(index, 'feedback', e.target.value)}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeGradingCriterion(index)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Feedback */}
                      <div className="space-y-2">
                        <Label htmlFor="feedback">Feedback</Label>
                        <Textarea
                          id="feedback"
                          rows={4}
                          placeholder="Provide detailed feedback for the student..."
                          {...register('feedback')}
                        />
                        {errors.feedback && (
                          <p className="text-sm text-red-600">{errors.feedback.message}</p>
                        )}
                      </div>

                      {/* Instructor Notes */}
                      <div className="space-y-2">
                        <Label htmlFor="instructorNotes">Instructor Notes</Label>
                        <Textarea
                          id="instructorNotes"
                          rows={3}
                          placeholder="Private notes (not visible to student)..."
                          {...register('instructorNotes')}
                        />
                        {errors.instructorNotes && (
                          <p className="text-sm text-red-600">{errors.instructorNotes.message}</p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline">
                          <Save className="w-4 h-4 mr-2" />
                          Save Draft
                        </Button>
                        <Button 
                          type="submit" 
                          className="bg-scholiax-purple hover:bg-scholiax-purple/90"
                          disabled={gradeSubmissionMutation.isPending}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {gradeSubmissionMutation.isPending ? 'Grading...' : 'Submit Grade'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a submission to grade</h3>
                  <p className="text-gray-600">
                    Choose a submission from the list to begin grading
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
