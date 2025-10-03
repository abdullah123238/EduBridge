'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Image, 
  Download, 
  ExternalLink, 
  X,
  Loader2,
  Eye,
  EyeOff,
  File,
  FileVideo,
  FileAudio,
  FileCode,
  FileArchive,
  FileSpreadsheet,
  Presentation,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCw,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FilePreviewProps {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  title?: string;
  description?: string;
  className?: string;
}

interface FileTypeInfo {
  icon: React.ReactNode;
  color: string;
  canPreview: boolean;
  previewType: 'image' | 'pdf' | 'video' | 'audio' | 'text' | 'none';
  mimeType: string;
}

export function FilePreview({ 
  fileUrl, 
  fileName, 
  fileType, 
  fileSize, 
  title,
  description,
  className = ""
}: FilePreviewProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeInfo = (): FileTypeInfo => {
    const type = fileType.toLowerCase();
    
    if (type.includes('image/') || type.includes('jpg') || type.includes('jpeg') || 
        type.includes('png') || type.includes('gif') || type.includes('webp') || 
        type.includes('svg') || type.includes('bmp')) {
      return {
        icon: <Image className="h-8 w-8" />,
        color: 'text-green-500',
        canPreview: true,
        previewType: 'image',
        mimeType: 'image'
      };
    }
    
    if (type.includes('pdf') || type.includes('application/pdf')) {
      return {
        icon: <FileText className="h-8 w-8" />,
        color: 'text-red-500',
        canPreview: true,
        previewType: 'pdf',
        mimeType: 'application/pdf'
      };
    }
    
    if (type.includes('video/') || type.includes('mp4') || type.includes('avi') || 
        type.includes('mov') || type.includes('wmv') || type.includes('flv') || 
        type.includes('webm')) {
      return {
        icon: <FileVideo className="h-8 w-8" />,
        color: 'text-purple-500',
        canPreview: true,
        previewType: 'video',
        mimeType: 'video'
      };
    }
    
    if (type.includes('audio/') || type.includes('mp3') || type.includes('wav') || 
        type.includes('ogg') || type.includes('aac') || type.includes('flac')) {
      return {
        icon: <FileAudio className="h-8 w-8" />,
        color: 'text-orange-500',
        canPreview: true,
        previewType: 'audio',
        mimeType: 'audio'
      };
    }
    
    if (type.includes('text/') || type.includes('txt') || type.includes('md') || 
        type.includes('json') || type.includes('xml') || type.includes('csv') || 
        type.includes('log')) {
      return {
        icon: <FileCode className="h-8 w-8" />,
        color: 'text-blue-500',
        canPreview: true,
        previewType: 'text',
        mimeType: 'text'
      };
    }
    
    if (type.includes('doc') || type.includes('docx') || type.includes('application/msword') || 
        type.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      return {
        icon: <FileText className="h-8 w-8" />,
        color: 'text-blue-600',
        canPreview: false,
        previewType: 'none',
        mimeType: 'application/msword'
      };
    }
    
    if (type.includes('xls') || type.includes('xlsx') || type.includes('csv') || 
        type.includes('application/vnd.ms-excel') || 
        type.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
      return {
        icon: <FileSpreadsheet className="h-8 w-8" />,
        color: 'text-green-600',
        canPreview: false,
        previewType: 'none',
        mimeType: 'application/vnd.ms-excel'
      };
    }
    
    if (type.includes('ppt') || type.includes('pptx') || 
        type.includes('application/vnd.ms-powerpoint') || 
        type.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation')) {
      return {
        icon: <Presentation className="h-8 w-8" />,
        color: 'text-orange-600',
        canPreview: false,
        previewType: 'none',
        mimeType: 'application/vnd.ms-powerpoint'
      };
    }
    
    if (type.includes('zip') || type.includes('rar') || type.includes('7z') || 
        type.includes('tar') || type.includes('gz') || type.includes('application/zip')) {
      return {
        icon: <FileArchive className="h-8 w-8" />,
        color: 'text-yellow-500',
        canPreview: false,
        previewType: 'none',
        mimeType: 'application/zip'
      };
    }
    
    return {
      icon: <File className="h-8 w-8" />,
      color: 'text-gray-500',
      canPreview: false,
      previewType: 'none',
      mimeType: 'application/octet-stream'
    };
  };

  const fileInfo = getFileTypeInfo();

  const handlePreview = () => {
    setIsPreviewOpen(true);
    setIsLoading(true);
    setPreviewError(null);
    setZoom(1);
    setIsPlaying(false);
    setIsMuted(false);
    setCurrentTime(0);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(fileUrl, '_blank');
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    setCurrentTime(video.currentTime);
    setDuration(video.duration);
  };

  const handleVideoSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = document.querySelector('video') as HTMLVideoElement;
    if (video) {
      video.currentTime = parseFloat(e.target.value);
    }
  };

  return (
    <>
      <Card className={`hover:shadow-lg transition-all duration-300 ${className}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={fileInfo.color}>
                {fileInfo.icon}
              </div>
              <div>
                <CardTitle className="text-lg text-card-foreground break-words">{title || fileName}</CardTitle>
                {description && (
                  <p className="text-sm text-muted-foreground mt-1">{description}</p>
                )}
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {formatFileSize(fileSize)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <p className="break-words"><strong>File:</strong> {fileName}</p>
              <p className="break-words"><strong>Type:</strong> {fileType}</p>
            </div>
            
            <div className="flex gap-2">
              {fileInfo.canPreview && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreview}
                        className="flex-1"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Preview file in browser</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      className="flex-1"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download file to device</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenInNewTab}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Open in new tab</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className={`${isFullscreen ? 'max-w-[95vw] max-h-[95vh]' : 'max-w-4xl max-h-[90vh]'}`}>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={fileInfo.color}>
                  {fileInfo.icon}
                </span>
                <span className="truncate">Preview: {fileName}</span>
              </div>
              <div className="flex items-center gap-2">
                {fileInfo.previewType === 'image' && (
                  <>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleZoomOut}
                            disabled={zoom <= 0.25}
                          >
                            <ZoomOut className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Zoom out</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <span className="text-sm text-muted-foreground min-w-[60px] text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleZoomIn}
                            disabled={zoom >= 3}
                          >
                            <ZoomIn className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Zoom in</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleResetZoom}
                          >
                            <RotateCw className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Reset zoom</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </>
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleFullscreen}
                      >
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPreviewOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="relative min-h-[400px] bg-muted rounded-lg overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/75 z-10">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Loading preview...</span>
                </div>
              </div>
            )}
            
            {previewError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Unable to preview file</p>
                  <p className="text-sm text-muted-foreground">{previewError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenInNewTab}
                    className="mt-2"
                  >
                    Open in New Tab
                  </Button>
                </div>
              </div>
            )}

            {fileInfo.previewType === 'pdf' && (
              <iframe
                src={`${fileUrl}#toolbar=0`}
                className="w-full h-full min-h-[600px]"
                title={`PDF preview of ${fileName}`}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setPreviewError('Failed to load PDF preview');
                }}
              />
            )}

            {fileInfo.previewType === 'image' && (
              <div className="flex items-center justify-center p-4">
                <img
                  src={fileUrl}
                  alt={fileName}
                  className={`max-w-full max-h-full object-contain transition-transform duration-200 ${zoom !== 1 ? 'scale-150' : ''}`}
                  onLoad={() => setIsLoading(false)}
                  onError={() => {
                    setIsLoading(false);
                    setPreviewError('Failed to load image preview');
                  }}
                />
              </div>
            )}

            {/* Video Preview */}
            {fileInfo.previewType === 'video' && (
              <div className="relative">
                <video
                  src={fileUrl}
                  className="w-full h-auto max-h-[600px]"
                  controls
                  onLoadStart={() => setIsLoading(true)}
                  onCanPlay={() => setIsLoading(false)}
                  onTimeUpdate={handleVideoTimeUpdate}
                  onError={() => {
                    setIsLoading(false);
                    setPreviewError('Failed to load video preview');
                  }}
                />
                                 <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2">
                   <div className="flex items-center gap-2">
                     <input
                       type="range"
                       min="0"
                       max={duration || 0}
                       value={currentTime}
                       onChange={handleVideoSeek}
                       className="flex-1"
                       aria-label="Video progress"
                       title="Video progress"
                     />
                     <span className="text-sm">
                       {formatTime(currentTime)} / {formatTime(duration)}
                     </span>
                   </div>
                 </div>
              </div>
            )}

            {/* Audio Preview */}
            {fileInfo.previewType === 'audio' && (
              <div className="flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                  <div className={fileInfo.color}>
                    {fileInfo.icon}
                  </div>
                  <audio
                    src={fileUrl}
                    controls
                    className="w-full max-w-md"
                    onLoadStart={() => setIsLoading(true)}
                    onCanPlay={() => setIsLoading(false)}
                    onError={() => {
                      setIsLoading(false);
                      setPreviewError('Failed to load audio preview');
                    }}
                  />
                  <p className="text-sm text-muted-foreground">{fileName}</p>
                </div>
              </div>
            )}

            {/* Text Preview */}
            {fileInfo.previewType === 'text' && (
              <div className="p-4">
                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[500px] text-sm font-mono">
                  <code>
                    {/* This would need to fetch the text content */}
                    <div className="text-center text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2" />
                      <p>Text preview not implemented yet</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleOpenInNewTab}
                        className="mt-2"
                      >
                        Open in New Tab
                      </Button>
                    </div>
                  </code>
                </pre>
              </div>
            )}

            {/* No Preview Available */}
            {fileInfo.previewType === 'none' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={fileInfo.color}>
                    {fileInfo.icon}
                  </div>
                  <p className="text-muted-foreground mt-2">Preview not available for this file type</p>
                  <p className="text-sm text-muted-foreground mb-4">Use the download button to view the file</p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenInNewTab}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open in New Tab
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 