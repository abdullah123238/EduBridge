import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Course, PaginatedResponse, ApiResponse } from '@/types/api';
import { CourseFormData } from '@/lib/validations';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';

export function useCourses(page: number = 1, limit: number = 10, search?: string) {
  return useQuery<PaginatedResponse<Course>>({
    queryKey: ['courses', page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });
      const response = await api.get(`/courses?${params}`);
      return response.data;
    },
  });
}

export function useUserCourses(page: number = 1, limit: number = 10) {
  return useQuery<PaginatedResponse<Course>>({
    queryKey: ['user-courses', page, limit],
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

export function usePublicCourses(page: number = 1, limit: number = 10, search?: string) {
  return useQuery<PaginatedResponse<Course>>({
    queryKey: ['public-courses', page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });
      const response = await api.get(`/courses/public?${params}`);
      return response.data;
    },
  });
}

export function useCourse(id: string) {
  return useQuery<ApiResponse<Course>>({
    queryKey: ['course', id],
    queryFn: async () => {
      const response = await api.get(`/courses/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CourseFormData) => {
      const response = await api.post('/courses', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course created successfully!');
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CourseFormData> }) => {
      const response = await api.put(`/courses/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course'] });
      toast.success('Course updated successfully!');
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/courses/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course deleted successfully!');
    },
  });
}

export function useEnrollCourse() {
  const queryClient = useQueryClient();
  const { updateUserEnrolledCourses } = useAuth();
  
  return useMutation({
    mutationFn: async (courseId: string) => {
      const response = await api.post(`/courses/${courseId}/enroll`);
      return response.data;
    },
    onSuccess: (data, courseId) => {
      // Update the user's enrolled courses in auth context
      updateUserEnrolledCourses(courseId);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course'] });
      queryClient.invalidateQueries({ queryKey: ['user-courses'] });
      
      toast.success('Successfully enrolled in course!');
    },
  });
}