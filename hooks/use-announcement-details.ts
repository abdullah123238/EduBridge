import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Announcement, Comment } from '@/types/api';

interface AnnouncementDetails {
  announcement: Announcement;
  comments: Comment[];
  commentCount: number;
}

export function useAnnouncementDetails(id: string) {
  return useQuery<{ success: boolean; data: AnnouncementDetails }>({
    queryKey: ['announcement-details', id],
    queryFn: async () => {
      const response = await api.get(`/announcements/${id}/with-comments`);
      return response.data;
    },
    enabled: !!id,
  });
} 