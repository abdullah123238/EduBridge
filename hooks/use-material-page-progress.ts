import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface PageProgress {
  pageNumber: number;
  timeSpent: number;
  isCompleted: boolean;
  canProceed: boolean;
  minTimeRequired: number;
  maxTimeAllowed: number;
  startTime?: Date;
  endTime?: Date;
}

interface ReadingProgress {
  completedPages: number;
  totalPages: number;
  progressPercentage: number;
  totalTimeSpent: number;
  canDownload: boolean;
  currentPage: number;
}

interface MaterialPageProgress {
  _id: string;
  student: string;
  material: string;
  course: string;
  pages: PageProgress[];
  totalPages: number;
  completedPages: number;
  canDownload: boolean;
  currentPage: number;
  sessionStartTime: Date;
  lastActivity: Date;
}

// Initialize material reading session
export function useInitializeMaterialReading() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ materialId, totalPages }: { materialId: string; totalPages: number }) => {
      const response = await api.post(`/material-progress/${materialId}/initialize`, {
        totalPages
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['material-progress', variables.materialId] });
      queryClient.setQueryData(['material-progress', variables.materialId], data);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to initialize reading session');
    },
  });
}

// Start reading a specific page
export function useStartPageReading() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ materialId, pageNumber }: { materialId: string; pageNumber: number }) => {
      const response = await api.post(`/material-progress/${materialId}/pages/${pageNumber}/start`);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['material-progress', variables.materialId] });
      queryClient.setQueryData(['material-progress', variables.materialId], data);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to start page reading');
    },
  });
}

// Update page reading time
export function useUpdatePageTime() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      materialId, 
      pageNumber, 
      timeSpent 
    }: { 
      materialId: string; 
      pageNumber: number; 
      timeSpent: number; 
    }) => {
      const response = await api.put(`/material-progress/${materialId}/pages/${pageNumber}/time`, {
        timeSpent
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['material-progress', variables.materialId] });
      queryClient.setQueryData(['material-progress', variables.materialId], data);
    },
    onError: (error: any) => {
      console.error('Failed to update page time:', error);
    },
  });
}

// Complete a page
export function useCompletePage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ materialId, pageNumber }: { materialId: string; pageNumber: number }) => {
      const response = await api.post(`/material-progress/${materialId}/pages/${pageNumber}/complete`);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['material-progress', variables.materialId] });
      queryClient.setQueryData(['material-progress', variables.materialId], data);
      toast.success(`Page ${variables.pageNumber} completed successfully!`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to complete page');
    },
  });
}

// Get reading progress
export function useReadingProgress(materialId: string) {
  return useQuery<{ data: ReadingProgress }>({
    queryKey: ['material-progress', materialId, 'progress'],
    queryFn: async () => {
      const response = await api.get(`/material-progress/${materialId}/progress`);
      return response.data;
    },
    enabled: !!materialId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Get material page progress
export function useMaterialPageProgress(materialId: string) {
  return useQuery<{ data: MaterialPageProgress }>({
    queryKey: ['material-progress', materialId],
    queryFn: async () => {
      const response = await api.get(`/material-progress/${materialId}/progress`);
      return response.data;
    },
    enabled: !!materialId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Check if student can download material
export function useCanDownloadMaterial(materialId: string) {
  return useQuery<{ data: { canDownload: boolean; reason: string; progress: ReadingProgress } }>({
    queryKey: ['material-progress', materialId, 'can-download'],
    queryFn: async () => {
      const response = await api.get(`/material-progress/${materialId}/can-download`);
      return response.data;
    },
    enabled: !!materialId,
  });
}

// Get specific page progress
export function usePageProgress(materialId: string, pageNumber: number) {
  return useQuery<{ data: PageProgress }>({
    queryKey: ['material-progress', materialId, 'page', pageNumber],
    queryFn: async () => {
      const response = await api.get(`/material-progress/${materialId}/pages/${pageNumber}/progress`);
      return response.data;
    },
    enabled: !!materialId && !!pageNumber,
  });
}

// Get PDF page count from backend
export function usePdfPageCount(materialId: string) {
  return useQuery<{ data: { pageCount: number; fileType: string; fileSize: number } }>({
    queryKey: ['material-page-count', materialId],
    queryFn: async () => {
      const response = await api.get(`/materials/${materialId}/page-count`);
      return response.data;
    },
    enabled: !!materialId,
  });
}
