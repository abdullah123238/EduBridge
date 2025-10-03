import React, { useState, useEffect } from 'react';
import { useMaterialProgressDetail, useUpdateMaterialProgress, useMarkMaterialCompleted } from '@/hooks/use-progress';
import { ProgressBar } from './progress-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  BookOpen,
  Video,
  FileText,
  Volume2,
  Star,
  Bookmark,
  MessageSquare
} from 'lucide-react';

interface MaterialProgressProps {
  materialId: string;
  materialTitle: string;
  materialType: string;
  duration?: number;
  onProgressUpdate?: (progress: number) => void;
  className?: string;
}

const getMaterialIcon = (type: string) => {
  switch (type) {
    case 'video':
      return <Video className="w-5 h-5" />;
    case 'audio':
      return <Volume2 className="w-5 h-5" />;
    case 'document':
      return <FileText className="w-5 h-5" />;
    default:
      return <BookOpen className="w-5 h-5" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-scholiax-teal text-white';
    case 'in_progress':
      return 'bg-scholiax-lavender text-white';
    case 'skipped':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const MaterialProgress: React.FC<MaterialProgressProps> = ({
  materialId,
  materialTitle,
  materialType,
  duration = 0,
  onProgressUpdate,
  className = ''
}) => {
  const { data: progress, isLoading } = useMaterialProgressDetail(materialId);
  const updateProgressMutation = useUpdateMaterialProgress();
  const markCompletedMutation = useMarkMaterialCompleted();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);

  useEffect(() => {
    if (progress && onProgressUpdate) {
      onProgressUpdate(progress.progressPercentage);
    }
  }, [progress, onProgressUpdate]);

  const handleTimeUpdate = (newTime: number) => {
    setCurrentTime(newTime);
    if (duration > 0) {
      const progressPercentage = (newTime / duration) * 100;
      updateProgressMutation.mutate({
        materialId,
        progressData: {
          progressPercentage,
          timeSpent: newTime,
          watchTime: newTime
        }
      });
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setCurrentTime(0);
    updateProgressMutation.mutate({
      materialId,
      progressData: {
        progressPercentage: 0,
        timeSpent: 0,
        watchTime: 0
      }
    });
  };

  const handleComplete = () => {
    markCompletedMutation.mutate(materialId);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!progress) return null;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getMaterialIcon(materialType)}
            <CardTitle className="text-lg">{materialTitle}</CardTitle>
          </div>
          <Badge className={getStatusColor(progress.status)}>
            {progress.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <ProgressBar 
          progress={progress.progressPercentage} 
          variant={progress.status === 'completed' ? 'success' : 'default'}
        />

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
            </span>
            <span>
              {Math.round(progress.timeSpent / 60)}m spent
            </span>
          </div>
          {progress.lastAccessed && (
            <span>
              Last accessed: {new Date(progress.lastAccessed).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={isPlaying ? handlePause : handlePlay}
              disabled={progress.status === 'completed'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowNotes(!showNotes)}
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowBookmarks(!showBookmarks)}
            >
              <Bookmark className="w-4 h-4" />
            </Button>
          </div>

          {progress.progressPercentage >= 90 && progress.status !== 'completed' && (
            <Button
              size="sm"
              onClick={handleComplete}
              className="bg-scholiax-teal hover:bg-scholiax-teal/90"
              disabled={markCompletedMutation.isPending}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark as Complete
            </Button>
          )}
        </div>

        {/* Notes Section */}
        {showNotes && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2">Notes ({progress.notes.length})</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {progress.notes.map((note, index) => (
                <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                  <div className="text-gray-500 mb-1">
                    {note.timestamp > 0 ? formatTime(note.timestamp) : 'General note'}
                  </div>
                  <div>{note.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bookmarks Section */}
        {showBookmarks && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2">Bookmarks ({progress.bookmarks.length})</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {progress.bookmarks.map((bookmark, index) => (
                <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                  <div className="text-gray-500 mb-1">
                    {bookmark.timestamp > 0 ? formatTime(bookmark.timestamp) : 'General bookmark'}
                  </div>
                  <div>{bookmark.title}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rating Section */}
        {progress.rating && (
          <div className="border-t pt-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Your Rating:</span>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < progress.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            {progress.feedback && (
              <div className="text-xs text-gray-600 mt-1">
                "{progress.feedback}"
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
