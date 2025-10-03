import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

// Task Types
interface Task {
  _id: string;
  title: string;
  description: string;
  course: {
    _id: string;
    title: string;
    code: string;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  type: 'assignment' | 'quiz' | 'project' | 'discussion' | 'reading';
  status: 'draft' | 'published' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  startDate: string;
  maxPoints: number;
  instructions?: string;
  allowedFileTypes?: string[];
  maxFileSize: number;
  maxFiles: number;
  questions?: Array<{
    _id: string;
    question: string;
    type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
    options?: Array<{
      text: string;
      isCorrect: boolean;
    }>;
    correctAnswer?: string;
    points: number;
    explanation?: string;
  }>;
  gradingType: 'automatic' | 'manual' | 'peer';
  passingScore: number;
  attempts: number;
  timeLimit?: number;
  isVisible: boolean;
  requiresSubmission: boolean;
  tags: string[];
  category?: string;
  prerequisites: Task[];
  learningObjectives: string[];
  resources: Array<{
    title: string;
    url: string;
    type: 'link' | 'file' | 'video' | 'document';
  }>;
  totalSubmissions: number;
  averageScore: number;
  completionRate: number;
  pendingGrading?: number;
  gradedSubmissions?: number;
  createdAt: string;
  updatedAt: string;
  submission?: Submission | null;
  canSubmit: {
    canSubmit: boolean;
    reason?: string;
  };
}

interface Submission {
  _id: string;
  task: string;
  student: string;
  course: string;
  status: 'draft' | 'submitted' | 'graded' | 'returned' | 'resubmitted';
  submittedAt?: string;
  gradedAt?: string;
  content?: string;
  files: Array<{
    filename: string;
    originalName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
    uploadedAt: string;
  }>;
  answers?: Array<{
    questionId: string;
    answer: any;
    isCorrect?: boolean;
    points: number;
  }>;
  score: number;
  maxScore: number;
  percentage: number;
  grade?: string;
  feedback?: string;
  instructorNotes?: string;
  gradedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  gradingCriteria?: Array<{
    criterion: string;
    points: number;
    earned: number;
    feedback: string;
  }>;
  attemptNumber: number;
  timeSpent: number;
  startTime?: string;
  endTime?: string;
  isLate: boolean;
  latePenalty: number;
  comments: Array<{
    author: {
      _id: string;
      name: string;
    };
    content: string;
    createdAt: string;
    isInstructor: boolean;
  }>;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface TaskStats {
  task: Task;
  stats: {
    totalStudents: number;
    totalSubmissions: number;
    gradedSubmissions: number;
    averageScore: number;
    completionRate: number;
    lateSubmissions: number;
  };
}

// Create task (lecturer only)
export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (taskData: Partial<Task>) => {
      const response = await api.post('/tasks', taskData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['student-tasks'] });
      toast.success('Task created successfully!');
    },
  });
}

// Get tasks for a course
export function useCourseTasks(courseId: string, page: number = 1, limit: number = 10, filters?: { type?: string; status?: string }) {
  return useQuery({
    queryKey: ['course-tasks', courseId, page, limit, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.type && { type: filters.type }),
        ...(filters?.status && { status: filters.status }),
      });
      const response = await api.get(`/tasks/course/${courseId}?${params}`);
      return response.data;
    },
    enabled: !!courseId,
  });
}

// Get student tasks
export function useStudentTasks(page: number = 1, limit: number = 10, filters?: { status?: string; type?: string }) {
  return useQuery({
    queryKey: ['student-tasks', page, limit, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.type && { type: filters.type }),
      });
      const response = await api.get(`/tasks/student/tasks?${params}`);
      return response.data;
    },
  });
}

// Get lecturer tasks (all tasks created by lecturer)
export function useLecturerTasks(page: number = 1, limit: number = 10, filters?: { status?: string; type?: string }) {
  return useQuery({
    queryKey: ['lecturer-tasks', page, limit, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.type && { type: filters.type }),
      });
      const response = await api.get(`/tasks/lecturer/tasks?${params}`);
      return response.data;
    },
  });
}

// Get courses for lecturer
export function useCourses(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['courses', page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      const response = await api.get(`/courses/user/my-courses?${params}`);
      return response.data;
    },
  });
}

// Get specific task
export function useTask(taskId: string) {
  return useQuery<Task>({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const response = await api.get(`/tasks/${taskId}`);
      return response.data.data;
    },
    enabled: !!taskId,
  });
}

// Get task statistics (lecturer only)
export function useTaskStats(taskId: string) {
  return useQuery<TaskStats>({
    queryKey: ['task-stats', taskId],
    queryFn: async () => {
      const response = await api.get(`/tasks/${taskId}/stats`);
      return response.data.data;
    },
    enabled: !!taskId,
  });
}

// Update task (lecturer only)
export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ taskId, taskData }: { taskId: string; taskData: Partial<Task> }) => {
      const response = await api.put(`/tasks/${taskId}`, taskData);
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['task', variables.taskId], data);
      queryClient.invalidateQueries({ queryKey: ['course-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['student-tasks'] });
      toast.success('Task updated successfully!');
    },
  });
}

// Delete task (lecturer only)
export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await api.delete(`/tasks/${taskId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['student-tasks'] });
      toast.success('Task deleted successfully!');
    },
  });
}

// Toggle task status (lecturer only)
export function useToggleTaskStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: 'draft' | 'published' | 'closed' }) => {
      const response = await api.patch(`/tasks/${taskId}/status`, { status });
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['task', variables.taskId], data);
      queryClient.invalidateQueries({ queryKey: ['course-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['student-tasks'] });
      toast.success(`Task ${variables.status === 'published' ? 'published' : 'unpublished'} successfully!`);
    },
  });
}

// Create submission (student only)
export function useCreateSubmission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ taskId, submissionData }: { taskId: string; submissionData: Partial<Submission> }) => {
      const response = await api.post(`/submissions/task/${taskId}`, submissionData);
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['submission', variables.taskId], data);
      queryClient.invalidateQueries({ queryKey: ['student-submissions'] });
      toast.success('Submission created successfully!');
    },
  });
}

// Submit assignment (student only)
export function useSubmitAssignment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ taskId, submissionData }: { taskId: string; submissionData: Partial<Submission> }) => {
      const response = await api.post(`/submissions/task/${taskId}/submit`, submissionData);
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['submission', variables.taskId], data);
      queryClient.invalidateQueries({ queryKey: ['student-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['student-tasks'] });
      toast.success('Assignment submitted successfully!');
    },
  });
}

// Get submission
export function useSubmission(taskId: string) {
  return useQuery<Submission>({
    queryKey: ['submission', taskId],
    queryFn: async () => {
      const response = await api.get(`/submissions/task/${taskId}`);
      return response.data.data;
    },
    enabled: !!taskId,
  });
}

// Get student submissions
export function useStudentSubmissions(page: number = 1, limit: number = 10, filters?: { status?: string; courseId?: string }) {
  return useQuery({
    queryKey: ['student-submissions', page, limit, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.courseId && { courseId: filters.courseId }),
      });
      const response = await api.get(`/submissions/student/submissions?${params}`);
      return response.data;
    },
  });
}

// Get task submissions (lecturer only)
export function useTaskSubmissions(taskId: string, page: number = 1, limit: number = 10, filters?: { status?: string }) {
  return useQuery({
    queryKey: ['task-submissions', taskId, page, limit, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.status && { status: filters.status }),
      });
      const response = await api.get(`/submissions/task/${taskId}/all?${params}`);
      return response.data;
    },
    enabled: !!taskId,
  });
}

// Grade submission (lecturer only)
export function useGradeSubmission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ submissionId, gradingData }: { submissionId: string; gradingData: any }) => {
      const response = await api.post(`/submissions/${submissionId}/grade`, gradingData);
      return response.data.data;
    },
    onSuccess: (data, submissionId) => {
      queryClient.invalidateQueries({ queryKey: ['task-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['student-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['lecturer-tasks'] }); // Add this to update pending grading count
      queryClient.invalidateQueries({ queryKey: ['task-stats'] }); // Also invalidate task stats
      toast.success('Submission graded successfully!');
    },
  });
}

// Add comment to submission
export function useAddSubmissionComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ submissionId, content }: { submissionId: string; content: string }) => {
      const response = await api.post(`/submissions/${submissionId}/comment`, { content });
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['submission'] });
      queryClient.invalidateQueries({ queryKey: ['task-submissions'] });
      toast.success('Comment added successfully!');
    },
  });
}

// Update submission (student only)
export function useUpdateSubmission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ submissionId, submissionData }: { submissionId: string; submissionData: Partial<Submission> }) => {
      const response = await api.put(`/submissions/${submissionId}`, submissionData);
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['submission'] });
      queryClient.invalidateQueries({ queryKey: ['student-submissions'] });
      toast.success('Submission updated successfully!');
    },
  });
}

// Delete submission (student only)
export function useDeleteSubmission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (submissionId: string) => {
      const response = await api.delete(`/submissions/${submissionId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submission'] });
      queryClient.invalidateQueries({ queryKey: ['student-submissions'] });
      toast.success('Submission deleted successfully!');
    },
  });
}
