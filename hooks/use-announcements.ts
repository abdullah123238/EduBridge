import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Announcement, PaginatedResponse, ApiResponse } from '@/types/api';
import toast from 'react-hot-toast';

export function useAnnouncements(page: number = 1, limit: number = 10, search?: string, courseId?: string) {
  return useQuery<PaginatedResponse<Announcement>>({
    queryKey: ['announcements', page, limit, search, courseId],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(courseId && { courseId }),
      });
      const response = await api.get(`/announcements?${params}`);
      return response.data;
    },
  });
}

export function useAnnouncement(id: string) {
  return useQuery<ApiResponse<Announcement>>({
    queryKey: ['announcement', id],
    queryFn: async () => {
      const response = await api.get(`/announcements/detail/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      title: string;
      body: string;
      courseId: string;
      isImportant?: boolean;
    }) => {
      const response = await api.post('/announcements', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create announcement');
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<{
      title: string;
      body: string;
      isImportant: boolean;
    }> }) => {
      const response = await api.put(`/announcements/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcement'] });
      toast.success('Announcement updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update announcement');
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/announcements/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete announcement');
    },
  });
}