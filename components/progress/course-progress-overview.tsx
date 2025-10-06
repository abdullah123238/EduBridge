import React from 'react';
import { useCourseProgressDetail } from '@/hooks/use-progress';
import { ProgressBar } from './progress-bar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CheckCircle, 
  Clock, 
  Play, 
  BookOpen,
  TrendingUp,
  Award,
  Eye,
  Users
} from 'lucide-react';
import Link from 'next/link';

interface CourseProgressOverviewProps {
  courseId: string;
  className?: string;
}

export const CourseProgressOverview: React.FC<CourseProgressOverviewProps> = ({
  courseId,
  className = ''
}) => {
  const { data: progress, isLoading, error } = useCourseProgressDetail(courseId);

  if (isLoading) {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !progress || !progress.course) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Unable to load course progress</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{progress.course?.title || 'Course'}</CardTitle>
              <p className="text-sm text-gray-600">{progress.course?.code || ''}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-scholiax-purple text-white">
                {Math.round(progress.overallProgress)}% Complete
              </Badge>
              <Link href={`/progress/course/${courseId}`}>
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Overall Progress */}
          <div>
            <ProgressBar 
              progress={progress.overallProgress} 
              variant={progress.overallProgress >= 80 ? 'success' : 'default'}
              size="lg"
            />
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="w-5 h-5 text-scholiax-purple" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{progress.totalMaterials || 0}</div>
              <div className="text-xs text-gray-600">Total Materials</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="w-5 h-5 text-scholiax-teal" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{progress.completedMaterials || 0}</div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Play className="w-5 h-5 text-scholiax-lavender" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{progress.inProgressMaterials || 0}</div>
              <div className="text-xs text-gray-600">In Progress</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-gray-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{progress.notStartedMaterials || 0}</div>
              <div className="text-xs text-gray-600">Not Started</div>
            </div>
          </div>

          {/* Time Spent */}
          <div className="flex items-center justify-between p-4 bg-scholiax-purple/10 rounded-lg">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-scholiax-purple" />
              <div>
                <div className="font-medium text-gray-900">Total Study Time</div>
                <div className="text-sm text-gray-600">{formatTime(progress.totalTimeSpent || 0)}</div>
              </div>
            </div>
            <Award className="w-6 h-6 text-scholiax-purple" />
          </div>

          {/* Material Progress List */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Material Progress</h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {(progress.materialProgress || []).map((material) => (
                <div key={material._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{material.material?.title || 'Material'}</div>
                      <div className="text-xs text-gray-500">{material.material?.fileType || ''}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-xs text-gray-500">
                      {Math.round(material.progressPercentage || 0)}%
                    </div>
                    <Badge className={material.status === 'completed' ? 'bg-scholiax-teal text-white' : 
                                      material.status === 'in_progress' ? 'bg-scholiax-lavender text-white' : 
                                      'bg-gray-100 text-gray-800'}>
                      {(material.status || 'not_started').replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
