import React from 'react';
import { useStudentTasks } from '@/hooks/use-tasks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Clock, 
  FileText, 
  BookOpen, 
  Users, 
  AlertCircle,
  CheckCircle,
  Play,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatDateMedium } from '@/lib/utils';

interface TaskListProps {
  className?: string;
}

const getTaskIcon = (type: string) => {
  switch (type) {
    case 'assignment':
      return <FileText className="w-5 h-5" />;
    case 'quiz':
      return <BookOpen className="w-5 h-5" />;
    case 'project':
      return <Users className="w-5 h-5" />;
    case 'discussion':
      return <Users className="w-5 h-5" />;
    case 'reading':
      return <BookOpen className="w-5 h-5" />;
    default:
      return <FileText className="w-5 h-5" />;
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

export const TaskList: React.FC<TaskListProps> = ({ className = '' }) => {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');

  const { data: tasksData, isLoading } = useStudentTasks(page, 10, {
    type: typeFilter || undefined,
    status: statusFilter || undefined
  });

  const tasks = tasksData?.data || [];

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

  if (isLoading) {
    return (
      <div className={className}>
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
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="assignment">Assignment</SelectItem>
              <SelectItem value="quiz">Quiz</SelectItem>
              <SelectItem value="project">Project</SelectItem>
              <SelectItem value="discussion">Discussion</SelectItem>
              <SelectItem value="reading">Reading</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="graded">Graded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tasks List */}
      {tasks.length > 0 ? (
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <motion.div
              key={task._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="p-2 bg-scholiax-purple/10 rounded-lg">
                        {getTaskIcon(task.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg mb-2">{task.title}</CardTitle>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge className="bg-scholiax-purple text-white">
                            {task.type}
                          </Badge>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          {task.submission && (
                            <Badge className={getStatusColor(task.submission.status)}>
                              {task.submission.status}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDateMedium(task.dueDate)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span className={isOverdue(task.dueDate) ? 'text-red-600 font-medium' : ''}>
                              {getTimeRemaining(task.dueDate)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FileText className="w-4 h-4" />
                            <span>{task.maxPoints} points</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <CardDescription className="mb-4 line-clamp-2">
                    {task.description}
                  </CardDescription>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{task.course.title}</span>
                      <span className="mx-2">•</span>
                      <span>{task.course.code}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {task.submission ? (
                        <Link href={`/tasks/${task._id}/submission`}>
                          <Button variant="outline" size="sm">
                            View Submission
                          </Button>
                        </Link>
                      ) : task.canSubmit.canSubmit ? (
                        <Link href={`/tasks/${task._id}/submit`}>
                          <Button size="sm" className="bg-scholiax-purple hover:bg-scholiax-purple/90">
                            <Plus className="w-4 h-4 mr-2" />
                            Start Task
                          </Button>
                        </Link>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          <AlertCircle className="w-4 h-4 mr-2" />
                          {task.canSubmit.reason}
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600 mb-6">
            {search || typeFilter || statusFilter 
              ? 'Try adjusting your search or filters'
              : 'You don\'t have any tasks assigned yet'
            }
          </p>
          {(search || typeFilter || statusFilter) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearch('');
                setTypeFilter('');
                setStatusFilter('');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Pagination */}
      {tasksData && tasksData.pagination.pages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm text-gray-600">
              Page {page} of {tasksData.pagination.pages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(Math.min(tasksData.pagination.pages, page + 1))}
              disabled={page === tasksData.pagination.pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};




