'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Search,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDateMedium } from '@/lib/utils';
import { useTaskSubmissions, useTask } from '@/hooks/use-tasks';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AssignmentSubmissionsPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params?.id as string;
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('submittedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data: taskData, isLoading: taskLoading } = useTask(assignmentId);
  const { data: submissionsData, isLoading: submissionsLoading } = useTaskSubmissions(assignmentId, 1, 100);
  
  const task = taskData;
  const submissions = submissionsData?.data || [];

  if (user?.role !== 'lecturer') {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">Only lecturers can view assignment submissions.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (taskLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-scholiax-purple mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading...</h3>
          <p className="text-gray-600">Please wait while we load the assignment.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!task) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Assignment Not Found</h3>
          <p className="text-gray-600">The assignment you're looking for doesn't exist.</p>
        </div>
      </DashboardLayout>
    );
  }

  // Filter and sort submissions
  const filteredSubmissions = submissions
    .filter((submission: any) => {
      const matchesSearch = submission.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           submission.student.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a: any, b: any) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'submittedAt':
          aValue = new Date(a.submittedAt || 0).getTime();
          bValue = new Date(b.submittedAt || 0).getTime();
          break;
        case 'student':
          aValue = a.student.name.toLowerCase();
          bValue = b.student.name.toLowerCase();
          break;
        case 'score':
          aValue = a.score || 0;
          bValue = b.score || 0;
          break;
        default:
          aValue = a.submittedAt || 0;
          bValue = b.submittedAt || 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
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

  const getGradeColor = (grade: string) => {
    if (grade?.startsWith('A')) return 'text-green-600';
    if (grade?.startsWith('B')) return 'text-blue-600';
    if (grade?.startsWith('C')) return 'text-yellow-600';
    if (grade?.startsWith('D')) return 'text-orange-600';
    if (grade === 'F') return 'text-red-600';
    return 'text-gray-600';
  };

  const submissionStats = {
    total: submissions.length,
    submitted: submissions.filter((s: any) => s.status === 'submitted').length,
    graded: submissions.filter((s: any) => s.status === 'graded').length,
    late: submissions.filter((s: any) => s.isLate).length
  };

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
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">{task.title}</h1>
          <p className="text-lg text-gray-600 mt-3">
            View and manage all submissions for this assignment
          </p>
        </div>

        {/* Assignment Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Assignment Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Course</h4>
                <p className="text-gray-600">{task.course?.title || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Due Date</h4>
                <p className="text-gray-600">{formatDateMedium(task.dueDate)}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Max Points</h4>
                <p className="text-gray-600">{task.maxPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submission Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-scholiax-purple" />
                <div>
                  <div className="text-2xl font-bold">{submissionStats.total}</div>
                  <div className="text-sm text-gray-600">Total Submissions</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-scholiax-teal" />
                <div>
                  <div className="text-2xl font-bold">{submissionStats.submitted}</div>
                  <div className="text-sm text-gray-600">Pending Review</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{submissionStats.graded}</div>
                  <div className="text-sm text-gray-600">Graded</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <div className="text-2xl font-bold">{submissionStats.late}</div>
                  <div className="text-sm text-gray-600">Late Submissions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by student name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="submitted">Submitted</option>
                  <option value="graded">Graded</option>
                  <option value="draft">Draft</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="submittedAt">Sort by Date</option>
                  <option value="student">Sort by Student</option>
                  <option value="score">Sort by Score</option>
                </select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submissions List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Submissions ({filteredSubmissions.length})</span>
            </CardTitle>
            <CardDescription>
              All submissions for this assignment
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submissionsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : filteredSubmissions.length > 0 ? (
              <div className="space-y-4">
                {filteredSubmissions.map((submission: any, index: number) => (
                  <motion.div
                    key={submission._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <FileText className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{submission.student.name}</h4>
                          <p className="text-sm text-gray-600">{submission.student.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            Submitted: {formatDateMedium(submission.submittedAt!)}
                          </div>
                          {submission.isLate && (
                            <div className="text-xs text-red-600 font-medium">Late submission</div>
                          )}
                        </div>
                        
                        <Badge className={getStatusColor(submission.status)}>
                          {submission.status}
                        </Badge>
                        
                        {submission.status === 'graded' && (
                          <div className="text-right">
                            <div className={`font-medium ${getGradeColor(submission.grade!)}`}>
                              {submission.grade} ({submission.percentage}%)
                            </div>
                            <div className="text-xs text-gray-600">
                              {submission.score}/{submission.maxScore} points
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          <Link href={`/assignments/${assignmentId}/grade?submission=${submission._id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </Link>
                          {submission.status === 'submitted' && (
                            <Link href={`/assignments/${assignmentId}/grade?submission=${submission._id}`}>
                              <Button size="sm" className="bg-scholiax-purple hover:bg-scholiax-purple/90">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Grade
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'No students have submitted this assignment yet'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}




