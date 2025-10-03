import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Course } from '@/types/api';

interface CourseDetails {
  course: Course;
  announcements: any[];
  materials: Record<string, any[]>;
  stats: {
    totalStudents: number;
    totalAnnouncements: number;
    totalMaterials: number;
    materialsByCategory: number;
  };
}

export function useCourseDetails(id: string) {
  return useQuery<{ success: boolean; data: CourseDetails }>({
    queryKey: ['course-details', id],
    queryFn: async () => {
      const response = await api.get(`/courses/${id}/details`);
      return response.data;
    },
    enabled: !!id,
  });
} 