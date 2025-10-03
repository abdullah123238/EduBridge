'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  FileText, 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDateMedium } from '@/lib/utils';
import { CreateTaskForm } from '@/components/tasks/create-task-form';
import { useCourseTasks, useDeleteTask, useToggleTaskStatus } from '@/hooks/use-tasks';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';

export default function AssignmentsPage() {
  const params = useParams();
  const courseId = params?.id as string;
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('assignments');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: tasksData, isLoading } = useCourseTasks(courseId, 1, 50, { type: 'assignment' });
  const deleteTaskMutation = useDeleteTask();
  const toggleStatusMutation = useToggleTaskStatus();

  const assignments = tasksData?.data || [];

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
      try {
        await deleteTaskMutation.mutateAsync(taskId);
        toast.success('Assignment deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete assignment');
      }
    }
  };

  const handleToggleStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    try {
      await toggleStatusMutation.mutateAsync({ taskId, status: newStatus });
      toast.success(`Assignment ${newStatus === 'published' ? 'published' : 'unpublished'} successfully!`);
    } catch (error) {
      toast.error('Failed to update assignment status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-scholiax-teal text-white';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'closed':
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

  if (user?.role !== 'lecturer') {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">Only lecturers can access assignment management.</p>
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
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">Assignments</h1>
            <p className="text-lg text-gray-600 mt-3">
              Create and manage assignments for your course
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-scholiax-purple hover:bg-scholiax-purple/90 shadow-lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Assignment
          </Button>
        </div>

        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <CreateTaskForm 
              courseId={courseId}
              onSuccess={() => {
                setShowCreateForm(false);
                toast.success('Assignment created successfully!');
              }}
            />
          </motion.div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="space-y-6">
            {isLoading ? (
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
                {assignments.map((assignment, index) => (
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
                            <span className="font-medium">Created:</span> {formatDateMedium(assignment.createdAt)}
                            {assignment.instructions && (
                              <>
                                <span className="mx-2">•</span>
                                <span>Has instructions</span>
                              </>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleStatus(assignment._id, assignment.status)}
                              disabled={toggleStatusMutation.isPending}
                            >
                              {assignment.status === 'published' ? 'Unpublish' : 'Publish'}
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteTask(assignment._id)}
                              disabled={deleteTaskMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
                <p className="text-gray-600 mb-6">
                  Create your first assignment to get started
                </p>
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="bg-scholiax-purple hover:bg-scholiax-purple/90"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Assignment
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="submissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
                <CardDescription>
                  View and grade student submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Submission management interface coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{assignments.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {assignments.filter(a => a.status === 'published').length} published
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
                    {assignments.reduce((sum, a) => sum + a.totalSubmissions, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all assignments
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {assignments.length > 0 
                      ? Math.round(assignments.reduce((sum, a) => sum + a.averageScore, 0) / assignments.length)
                      : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Overall performance
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Assignment Performance</CardTitle>
                <CardDescription>
                  Detailed analytics for each assignment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <div key={assignment._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{assignment.title}</h4>
                        <p className="text-sm text-gray-600">
                          {assignment.totalSubmissions} submissions • {assignment.averageScore}% average
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{assignment.completionRate}% completion</div>
                        <div className="text-xs text-gray-600">{assignment.maxPoints} points</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
}




