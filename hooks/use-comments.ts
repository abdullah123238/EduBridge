import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Comment {
  _id: string;
  content: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  announcement: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateCommentData {
  announcementId: string;
  content: string;
}

interface UpdateCommentData {
  commentId: string;
  content: string;
}

export function useComments(announcementId: string) {
  return useQuery<{ success: boolean; data: Comment[] }>({
    queryKey: ['comments', announcementId],
    queryFn: async () => {
      const response = await api.get(`/comments/${announcementId}`);
      return response.data;
    },
    enabled: !!announcementId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateCommentData) => {
      const response = await api.post(`/comments/${data.announcementId}`, {
        content: data.content
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.announcementId] });
      toast.success('Comment posted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to post comment');
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateCommentData) => {
      const response = await api.put(`/comments/${data.commentId}`, {
        content: data.content,
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['comments'], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((comment: Comment) =>
            comment._id === variables.commentId
              ? { ...comment, content: variables.content, isEdited: true }
              : comment
          ),
        };
      });
      toast.success('Comment updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update comment');
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (commentId: string) => {
      const response = await api.delete(`/comments/${commentId}`);
      return response.data;
    },
    onSuccess: (data, commentId) => {
      queryClient.setQueryData(['comments'], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data.filter((comment: Comment) => comment._id !== commentId),
        };
      });
      toast.success('Comment deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete comment');
    },
  });
}