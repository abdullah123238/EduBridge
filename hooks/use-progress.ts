import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

// Progress Tracking Types
interface ProgressTracking {
  _id: string;
  student: string;
  material: {
    _id: string;
    title: string;
    fileType: string;
    fileSize: number;
  };
  course: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  progressPercentage: number;
  timeSpent: number;
  lastAccessed: string;
  completionDate?: string;
  watchTime: number;
  totalDuration: number;
  interactions: Array<{
    type: string;
    timestamp: number;
    data: any;
  }>;
  notes: Array<{
    content: string;
    timestamp: number;
    createdAt: string;
  }>;
  bookmarks: Array<{
    title: string;
    timestamp: number;
    createdAt: string;
  }>;
  rating?: number;
  feedback?: string;
}

interface CourseProgress {
  course: {
    _id: string;
    title: string;
    code: string;
  };
  overallProgress: number;
  totalMaterials: number;
  completedMaterials: number;
  inProgressMaterials: number;
  notStartedMaterials: number;
  totalTimeSpent: number;
  materialProgress: ProgressTracking[];
}

interface StudentProgress {
  overallStats: {
    totalMaterials: number;
    completedMaterials: number;
    averageProgress: number;
    totalTimeSpent: number;
  };
  courseProgress: CourseProgress[];
}

// Get material progress for a specific material
export function useMaterialProgressDetail(materialId: string) {
  return useQuery<ProgressTracking>({
    queryKey: ['material-progress', materialId],
    queryFn: async () => {
      const response = await api.get(`/progress/material/${materialId}`);
      return response.data.data;
    },
    enabled: !!materialId,
  });
}

// Update material progress
export function useUpdateMaterialProgress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ materialId, progressData }: { materialId: string; progressData: any }) => {
      const response = await api.put(`/progress/material/${materialId}`, progressData);
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['material-progress', variables.materialId], data);
      queryClient.invalidateQueries({ queryKey: ['course-progress'] });
      queryClient.invalidateQueries({ queryKey: ['student-progress'] });
    },
  });
}

// Get course progress for a specific course
export function useCourseProgressDetail(courseId: string) {
  return useQuery<CourseProgress>({
    queryKey: ['course-progress-detail', courseId],
    queryFn: async () => {
      const response = await api.get(`/progress/course/${courseId}`);
      return response.data.data;
    },
    enabled: !!courseId,
  });
}

// Get student progress overview
export function useStudentProgress() {
  return useQuery<StudentProgress>({
    queryKey: ['student-progress'],
    queryFn: async () => {
      const response = await api.get('/progress/student/overview');
      return response.data.data;
    },
  });
}

// Add note to material
export function useAddNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ materialId, noteData }: { materialId: string; noteData: { content: string; timestamp?: number } }) => {
      const response = await api.post(`/progress/material/${materialId}/note`, noteData);
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['material-progress', variables.materialId], data);
      toast.success('Note added successfully!');
    },
  });
}

// Add bookmark to material
export function useAddBookmark() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ materialId, bookmarkData }: { materialId: string; bookmarkData: { title: string; timestamp?: number } }) => {
      const response = await api.post(`/progress/material/${materialId}/bookmark`, bookmarkData);
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['material-progress', variables.materialId], data);
      toast.success('Bookmark added successfully!');
    },
  });
}

// Rate material
export function useRateMaterial() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ materialId, ratingData }: { materialId: string; ratingData: { rating: number; feedback?: string } }) => {
      const response = await api.post(`/progress/material/${materialId}/rate`, ratingData);
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['material-progress', variables.materialId], data);
      toast.success('Rating submitted successfully!');
    },
  });
}

// Mark material as completed
export function useMarkMaterialCompleted() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (materialId: string) => {
      const response = await api.put(`/progress/material/${materialId}`, {
        progressPercentage: 100,
        status: 'completed'
      });
      return response.data.data;
    },
    onSuccess: (data, materialId) => {
      queryClient.setQueryData(['material-progress', materialId], data);
      queryClient.invalidateQueries({ queryKey: ['course-progress'] });
      queryClient.invalidateQueries({ queryKey: ['student-progress'] });
      toast.success('Material marked as completed!');
    },
  });
}

// Additional hooks for progress tracking dashboard

// Get all course progress for lecturer
export function useCourseProgress(page = 1, limit = 10, filters = {}) {
  return useQuery({
    queryKey: ['course-progress-list', page, limit, filters],
    queryFn: async () => {
      const response = await api.get('/progress/courses', {
        params: { page, limit, ...filters }
      });
      return response.data;
    },
  });
}

// Get all material progress for lecturer
export function useMaterialProgressList(page = 1, limit = 10, filters = {}) {
  return useQuery({
    queryKey: ['material-progress-list', page, limit, filters],
    queryFn: async () => {
      const response = await api.get('/progress/materials', {
        params: { page, limit, ...filters }
      });
      return response.data;
    },
  });
}

// Get task/assignment progress for lecturer
export function useTaskProgress(page = 1, limit = 10, filters = {}) {
  return useQuery({
    queryKey: ['task-progress-list', page, limit, filters],
    queryFn: async () => {
      const response = await api.get('/progress/tasks', {
        params: { page, limit, ...filters }
      });
      return response.data;
    },
  });
}

// Get course students progress
export function useCourseStudents(courseId: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: ['course-students', courseId, page, limit],
    queryFn: async () => {
      const response = await api.get(`/progress/course/${courseId}/students`, {
        params: { page, limit }
      });
      return response.data;
    },
    enabled: !!courseId,
  });
}

// Get course materials progress
export function useCourseMaterials(courseId: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: ['course-materials', courseId, page, limit],
    queryFn: async () => {
      const response = await api.get(`/progress/course/${courseId}/materials`, {
        params: { page, limit }
      });
      return response.data;
    },
    enabled: !!courseId,
  });
}

// Get individual student progress
export function useStudentProgressDetail(studentId: string, courseId: string) {
  return useQuery({
    queryKey: ['student-progress-detail', studentId, courseId],
    queryFn: async () => {
      const response = await api.get(`/progress/student/${studentId}/course/${courseId}`);
      return response.data;
    },
    enabled: !!studentId && !!courseId,
  });
}

// Get student materials progress
export function useStudentMaterials(studentId: string, courseId: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: ['student-materials', studentId, courseId, page, limit],
    queryFn: async () => {
      const response = await api.get(`/progress/student/${studentId}/course/${courseId}/materials`, {
        params: { page, limit }
      });
      return response.data;
    },
    enabled: !!studentId && !!courseId,
  });
}

// Get student assignments progress
export function useStudentAssignments(studentId: string, courseId: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: ['student-assignments', studentId, courseId, page, limit],
    queryFn: async () => {
      const response = await api.get(`/progress/student/${studentId}/course/${courseId}/assignments`, {
        params: { page, limit }
      });
      return response.data;
    },
    enabled: !!studentId && !!courseId,
  });
}
