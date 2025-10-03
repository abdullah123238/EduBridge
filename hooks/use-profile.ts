import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { User } from '@/types/api';
import toast from 'react-hot-toast';

interface UpdateProfileData {
  name?: string;
  email?: string;
}

interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const response = await api.put('/auth/profile', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.data);
      toast.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: async (data: UpdatePasswordData) => {
      const response = await api.put('/auth/password', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update password');
    },
  });
} 