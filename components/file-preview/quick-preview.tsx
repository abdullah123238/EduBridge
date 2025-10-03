'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Image, 
  Download, 
  ExternalLink, 
  Eye,
  File,
  FileVideo,
  FileAudio,
  FileCode,
  FileArchive,
  FileSpreadsheet,
  Presentation,
  Play,
  Pause
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

interface QuickPreviewProps {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  className?: string;
  showActions?: boolean;
}

interface FileTypeInfo {
  icon: React.ReactNode;
  color: string;
  canPreview: boolean;
  previewType: 'image' | 'pdf' | 'video' | 'audio' | 'text' | 'none';
}

export function QuickPreview({ 
  fileUrl, 
  fileName, 
  fileType, 
  fileSize, 
  className = "",
  showActions = true
}: QuickPreviewProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

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
        icon: <Image className="h-4 w-4" />,
        color: 'text-green-500',
        canPreview: true,
        previewType: 'image'
      };
    }
    
    if (type.includes('pdf') || type.includes('application/pdf')) {
      return {
        icon: <FileText className="h-4 w-4" />,
        color: 'text-red-500',
        canPreview: true,
        previewType: 'pdf'
      };
    }
    
    if (type.includes('video/') || type.includes('mp4') || type.includes('avi') || 
        type.includes('mov') || type.includes('wmv') || type.includes('flv') || 
        type.includes('webm')) {
      return {
        icon: <FileVideo className="h-4 w-4" />,
        color: 'text-purple-500',
        canPreview: true,
        previewType: 'video'
      };
    }
    
    if (type.includes('audio/') || type.includes('mp3') || type.includes('wav') || 
        type.includes('ogg') || type.includes('aac') || type.includes('flac')) {
      return {
        icon: <FileAudio className="h-4 w-4" />,
        color: 'text-orange-500',
        canPreview: true,
        previewType: 'audio'
      };
    }
    
    if (type.includes('text/') || type.includes('txt') || type.includes('md') || 
        type.includes('json') || type.includes('xml') || type.includes('csv') || 
        type.includes('log')) {
      return {
        icon: <FileCode className="h-4 w-4" />,
        color: 'text-blue-500',
        canPreview: true,
        previewType: 'text'
      };
    }
    
    if (type.includes('doc') || type.includes('docx')) {
      return {
        icon: <FileText className="h-4 w-4" />,
        color: 'text-blue-600',
        canPreview: false,
        previewType: 'none'
      };
    }
    
    if (type.includes('xls') || type.includes('xlsx') || type.includes('csv')) {
      return {
        icon: <FileSpreadsheet className="h-4 w-4" />,
        color: 'text-green-600',
        canPreview: false,
        previewType: 'none'
      };
    }
    
    if (type.includes('ppt') || type.includes('pptx')) {
      return {
        icon: <Presentation className="h-4 w-4" />,
        color: 'text-orange-600',
        canPreview: false,
        previewType: 'none'
      };
    }
    
    if (type.includes('zip') || type.includes('rar') || type.includes('7z') || 
        type.includes('tar') || type.includes('gz')) {
      return {
        icon: <FileArchive className="h-4 w-4" />,
        color: 'text-yellow-500',
        canPreview: false,
        previewType: 'none'
      };
    }
    
    return {
      icon: <File className="h-4 w-4" />,
      color: 'text-gray-500',
      canPreview: false,
      previewType: 'none'
    };
  };

  const fileInfo = getFileTypeInfo();

  const handlePreview = () => {
    setIsPreviewOpen(true);
    setIsLoading(true);
    setPreviewError(null);
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

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={fileInfo.color}>
          {fileInfo.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{fileName}</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(fileSize)}</p>
        </div>
        
        {showActions && (
          <div className="flex items-center gap-1">
            {fileInfo.canPreview && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePreview}
                      className="h-6 w-6 p-0"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Preview</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownload}
                    className="h-6 w-6 p-0"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleOpenInNewTab}
                    className="h-6 w-6 p-0"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Open in new tab</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className={fileInfo.color}>
                {fileInfo.icon}
              </div>
              <span className="truncate break-words">Preview: {fileName}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="relative min-h-[400px] bg-muted rounded-lg overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/75 z-10">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
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

            {/* PDF Preview */}
            {fileInfo.previewType === 'pdf' && (
              <iframe
                src={`${fileUrl}#toolbar=0`}
                className="w-full h-full min-h-[600px]"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setPreviewError('Failed to load PDF preview');
                }}
              />
            )}

            {/* Image Preview */}
            {fileInfo.previewType === 'image' && (
              <div className="flex items-center justify-center p-4">
                <img
                  src={fileUrl}
                  alt={fileName}
                  className="max-w-full max-h-full object-contain"
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
              <div className="flex items-center justify-center p-4">
                <video
                  src={fileUrl}
                  className="w-full h-auto max-h-[600px]"
                  controls
                  onLoadStart={() => setIsLoading(true)}
                  onCanPlay={() => setIsLoading(false)}
                  onError={() => {
                    setIsLoading(false);
                    setPreviewError('Failed to load video preview');
                  }}
                />
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