import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Material } from '@/types/api';

interface MaterialDetails {
  material: Material;
  fileInfo: {
    exists: boolean;
    canPreview: boolean;
    lastModified?: Date;
    size: number;
  };
}

export function useMaterialDetails(id: string) {
  return useQuery<{ success: boolean; data: MaterialDetails }>({
    queryKey: ['material-details', id],
    queryFn: async () => {
      const response = await api.get(`/materials/${id}/details`);
      return response.data;
    },
    enabled: !!id,
  });
} 