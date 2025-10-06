'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  Lock, 
  Download,
  Eye,
  AlertCircle,
  Play,
  Pause
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import { useMaterialPageProgress, useInitializeMaterialReading, useStartPageReading, useUpdatePageTime, useCompletePage, useCanDownloadMaterial } from '@/hooks/use-material-page-progress';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';

interface MaterialViewerProps {
  materialId: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize?: number;
  totalPages?: number;
  onDownload?: () => void;
}

export function MaterialViewer({ 
  materialId, 
  fileUrl, 
  fileName, 
  fileType, 
  fileSize,
  totalPages = 1,
  onDownload 
}: MaterialViewerProps) {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [viewerError, setViewerError] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  
  const MIN_TIME_MINUTES = 6;
  const MAX_TIME_MINUTES = 12;
  const MIN_TIME_SECONDS = MIN_TIME_MINUTES * 60;
  const MAX_TIME_SECONDS = MAX_TIME_MINUTES * 60;

  // Initialize reading session
  const { mutate: initializeReading } = useInitializeMaterialReading();
  
  // Start page reading
  const { mutate: startPageReading } = useStartPageReading();
  
  // Update page time
  const { mutate: updatePageTime } = useUpdatePageTime();
  
  // Complete page
  const { mutate: completePage } = useCompletePage();
  
  // Get reading progress
  const { data: progressData, isLoading: progressLoading } = useMaterialPageProgress(materialId);
  
  // Check download permission
  const { data: downloadData } = useCanDownloadMaterial(materialId);

  const progress = progressData?.data;
  const canDownload = downloadData?.data?.canDownload || false;

  // Initialize reading session when component mounts
  useEffect(() => {
    if (materialId && totalPages > 0) {
      initializeReading({ materialId, totalPages });
    }
  }, [materialId, totalPages, initializeReading]);

  // Start timer when reading begins
  useEffect(() => {
    if (isReading) {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setTimeSpent(elapsed);
        
        // Update backend every 30 seconds
        if (elapsed % 30 === 0 && elapsed > 0) {
          updatePageTime({ materialId, pageNumber: currentPage, timeSpent: elapsed });
        }
        
        // Show warning if approaching max time
        if (elapsed >= MAX_TIME_SECONDS - 60 && !showTimeWarning) {
          setShowTimeWarning(true);
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isReading, currentPage, materialId, updatePageTime, showTimeWarning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartReading = () => {
    setIsReading(true);
    setTimeSpent(0);
    startPageReading({ materialId, pageNumber: currentPage });
  };

  const handlePauseReading = () => {
    setIsReading(false);
    updatePageTime({ materialId, pageNumber: currentPage, timeSpent });
  };

  const handleCompletePage = () => {
    if (timeSpent < MIN_TIME_SECONDS) {
      toast.error(`You must spend at least ${MIN_TIME_MINUTES} minutes on this page before completing it`);
      return;
    }
    
    setIsReading(false);
    completePage({ materialId, pageNumber: currentPage });
    setShowCompletionDialog(false);
    
    // Move to next page if available
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      setTimeSpent(0);
    }
  };

  const handleNextPage = () => {
    if (currentPage >= totalPages) return;
    
    const currentPageData = progress?.pages?.find(p => p.pageNumber === currentPage);
    
    if (currentPageData && !currentPageData.isCompleted) {
      toast.error('You must complete the current page before proceeding to the next page');
      return;
    }
    
    setCurrentPage(prev => prev + 1);
    setTimeSpent(0);
    setIsReading(false);
  };

  const handlePreviousPage = () => {
    if (currentPage <= 1) return;
    setCurrentPage(prev => prev - 1);
    setTimeSpent(0);
    setIsReading(false);
  };

  const getPageStatus = (pageNum: number) => {
    const pageData = progress?.pages?.find(p => p.pageNumber === pageNum);
    
    if (pageData?.isCompleted) return 'completed';
    if (pageData?.canProceed) return 'can-proceed';
    if (pageNum === currentPage) return 'current';
    return 'locked';
  };

  const getPageIcon = (pageNum: number) => {
    const status = getPageStatus(pageNum);
    
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'can-proceed':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'current':
        return <Play className="h-4 w-4 text-orange-500" />;
      default:
        return <Lock className="h-4 w-4 text-gray-400" />;
    }
  };

  const canProceedToNext = () => {
    const currentPageData = progress?.pages?.find(p => p.pageNumber === currentPage);
    return currentPageData?.isCompleted || false;
  };

  const isTimeRequirementMet = timeSpent >= MIN_TIME_SECONDS;
  const isTimeLimitExceeded = timeSpent > MAX_TIME_SECONDS;

  if (progressLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Reading Progress</span>
            <Badge variant={canDownload ? "default" : "secondary"}>
              {progress?.completedPages || 0} / {totalPages} pages
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress 
              value={((progress?.completedPages || 0) / totalPages) * 100} 
              className="h-2"
            />
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="break-words">Overall Progress: {Math.round(((progress?.completedPages || 0) / totalPages) * 100)}%</span>
              <span className="break-words">Total Time: {formatTime(progress?.pages?.reduce((sum: number, page: any) => sum + (page.timeSpent || 0), 0) || 0)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Page Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Page Navigation</span>
            <Badge variant="outline" className="text-sm">
              {currentPage} / {totalPages}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Main Navigation Controls */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousPage}
                disabled={currentPage <= 1}
                className="flex-1 mr-2"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Page
              </Button>
              
              <div className="flex items-center gap-2 px-4">
                <span className="text-lg font-medium break-words">Page {currentPage} of {totalPages}</span>
              </div>
              
              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages || !canProceedToNext()}
                className="flex-1 ml-2"
              >
                Next Page
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {/* Page Status Indicators */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-center text-muted-foreground">
                Page Status Overview
              </div>
              <div className="flex gap-2 justify-center flex-wrap">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <div
                    key={pageNum}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm min-w-0 cursor-pointer transition-colors ${
                      pageNum === currentPage 
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      if (pageNum !== currentPage) {
                        const canNavigate = pageNum === 1 || progress?.pages?.find(p => p.pageNumber === pageNum - 1)?.isCompleted;
                        if (canNavigate) {
                          setCurrentPage(pageNum);
                          setTimeSpent(0);
                          setIsReading(false);
                        } else {
                          toast.error('You must complete the previous pages before accessing this page');
                        }
                      }
                    }}
                  >
                    {getPageIcon(pageNum)}
                    <span className="truncate font-medium">Page {pageNum}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Help Text */}
            <div className="text-xs text-muted-foreground text-center">
              {currentPage === 1 
                ? "You're on the first page. Complete this page to unlock the next one."
                : currentPage === totalPages
                ? "You're on the last page. Complete this page to finish the material."
                : "Complete the current page to unlock the next page."
              }
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Page Timer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Page {currentPage} Reading Timer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-mono font-bold text-blue-600 break-words">
                {formatTime(timeSpent)}
              </div>
              <div className="text-sm text-muted-foreground mt-1 break-words">
                Time spent on current page
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className={isTimeRequirementMet ? 'text-green-600' : 'text-orange-600'}>
                  Min: {MIN_TIME_MINUTES}min
                </span>
                <span className={isTimeLimitExceeded ? 'text-red-600' : 'text-gray-600'}>
                  Max: {MAX_TIME_MINUTES}min
                </span>
              </div>
              
              <Progress 
                value={(timeSpent / MAX_TIME_SECONDS) * 100} 
                className="h-2"
              />
            </div>

            <div className="flex gap-2 justify-center">
              {!isReading ? (
                <Button onClick={handleStartReading} className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  Start Reading
                </Button>
              ) : (
                <Button onClick={handlePauseReading} variant="outline" className="flex-1">
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Reading
                </Button>
              )}
              
              <Button
                onClick={() => setShowCompletionDialog(true)}
                disabled={!isTimeRequirementMet || isTimeLimitExceeded}
                variant={isTimeRequirementMet ? "default" : "outline"}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Page
              </Button>
            </div>

            {/* Time Status Messages */}
            {timeSpent < MIN_TIME_SECONDS && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You need to spend at least {MIN_TIME_MINUTES} minutes on this page before completing it.
                  {MIN_TIME_SECONDS - timeSpent > 0 && (
                    <span className="block mt-1">
                      Time remaining: {formatTime(MIN_TIME_SECONDS - timeSpent)}
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {isTimeLimitExceeded && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You have exceeded the maximum time limit of {MAX_TIME_MINUTES} minutes for this page.
                  You cannot complete this page.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="break-words">Material Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            {fileType.includes('pdf') ? (
              <iframe
                src={`${fileUrl}#page=${currentPage}&toolbar=0`}
                className="w-full h-full rounded-lg"
                title={`PDF preview - Page ${currentPage}`}
              />
            ) : fileType.includes('doc') || fileType.includes('docx') ? (
              <div className="w-full h-full space-y-4">
                {/* Primary Viewer - Microsoft Office Online */}
                <div className="h-96 border rounded-lg overflow-hidden relative">
                  <iframe
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
                    className="w-full h-full"
                    title={`Document preview - ${fileName}`}
                    frameBorder="0"
                    onLoad={(e) => {
                      const iframe = e.target as HTMLIFrameElement;
                      setViewerError(false);
                      // Check if the iframe loaded successfully
                      setTimeout(() => {
                        try {
                          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                          if (!iframeDoc || iframeDoc.body?.innerHTML.includes('error') || iframeDoc.body?.innerHTML.includes('not found')) {
                            setViewerError(true);
                          }
                        } catch (error) {
                          // Cross-origin error means it loaded, but we can't check content
                          console.log('Office Online viewer loaded');
                        }
                      }, 3000);
                    }}
                    onError={() => {
                      setViewerError(true);
                    }}
                  />
                  {viewerError && (
                    <div className="absolute inset-0 bg-white flex items-center justify-center">
                      <div className="text-center p-4">
                        <div className="text-red-500 text-4xl mb-2">⚠️</div>
                        <p className="text-sm text-gray-600 mb-2">External viewer failed to load</p>
                        <p className="text-xs text-gray-500">Try the alternative options below</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Fallback Options */}
                <div id="fallback-options" className="text-center space-y-3" style={{ display: 'none' }}>
                  <div className="text-sm text-muted-foreground">
                    Microsoft Office Online viewer is not available. Try one of these alternatives:
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const iframe = document.querySelector('iframe[title*="Document preview"]') as HTMLIFrameElement;
                        if (iframe) {
                          iframe.src = `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;
                        }
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Google Docs Viewer
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(fileUrl, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Open in New Tab
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = fileUrl;
                        link.download = fileName;
                        link.click();
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download File
                    </Button>
                  </div>
                </div>
                
                {/* Always show alternative options */}
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-2">
                    Having trouble viewing? Try these alternatives:
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const iframe = document.querySelector('iframe[title*="Document preview"]') as HTMLIFrameElement;
                        if (iframe) {
                          iframe.src = `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;
                        }
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Google Docs Viewer
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // Try to open the file directly in the iframe
                        const iframe = document.querySelector('iframe[title*="Document preview"]') as HTMLIFrameElement;
                        if (iframe) {
                          iframe.src = fileUrl;
                        }
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Direct File View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(fileUrl, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Open in New Tab
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = fileUrl;
                        link.download = fileName;
                        link.click();
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ) : fileType.includes('xls') || fileType.includes('xlsx') ? (
              <div className="w-full h-full">
                <iframe
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
                  className="w-full h-full rounded-lg"
                  title={`Spreadsheet preview - ${fileName}`}
                  frameBorder="0"
                />
                <div className="mt-2 text-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const iframe = document.querySelector('iframe[title*="Spreadsheet preview"]') as HTMLIFrameElement;
                      if (iframe) {
                        iframe.src = `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;
                      }
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Try Google Docs Viewer
                  </Button>
                </div>
              </div>
            ) : fileType.includes('ppt') || fileType.includes('pptx') ? (
              <div className="w-full h-full">
                <iframe
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
                  className="w-full h-full rounded-lg"
                  title={`Presentation preview - ${fileName}`}
                  frameBorder="0"
                />
                <div className="mt-2 text-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const iframe = document.querySelector('iframe[title*="Presentation preview"]') as HTMLIFrameElement;
                      if (iframe) {
                        iframe.src = `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;
                      }
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Try Google Docs Viewer
                  </Button>
                </div>
              </div>
            ) : fileType.includes('image') ? (
              <img
                src={fileUrl}
                alt={fileName}
                className="w-full h-full object-contain rounded-lg"
                title={`Image preview - ${fileName}`}
              />
            ) : (
              <div className="text-center text-muted-foreground break-words p-8">
                <Eye className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Preview not available for this file type</p>
                <p className="text-sm mb-4">File type: {fileType}</p>
                <p className="text-sm mb-4">Page {currentPage} of {totalPages}</p>
                
                {/* File Information */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
                  <h4 className="font-medium mb-2">File Information:</h4>
                  <div className="text-sm space-y-1">
                    <div><strong>Name:</strong> {fileName}</div>
                    <div><strong>Type:</strong> {fileType}</div>
                    <div><strong>Size:</strong> {Math.round((fileSize || 0) / 1024)} KB</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm">To view this file, you can:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button 
                      variant="outline" 
                      onClick={() => window.open(fileUrl, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Open in New Tab
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = fileUrl;
                        link.download = fileName;
                        link.click();
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download File
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        // Try to copy the file URL to clipboard
                        navigator.clipboard.writeText(fileUrl).then(() => {
                          toast.success('File URL copied to clipboard');
                        }).catch(() => {
                          toast.error('Failed to copy URL');
                        });
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Copy URL
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Download Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download Material
          </CardTitle>
        </CardHeader>
        <CardContent>
          {canDownload ? (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Congratulations! You have completed reading all pages. You can now download the material.
                </AlertDescription>
              </Alert>
              <Button onClick={onDownload} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download {fileName}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  You must complete reading all pages before you can download this material.
                  Progress: {progress?.completedPages || 0} / {totalPages} pages completed.
                </AlertDescription>
              </Alert>
              <Button disabled className="w-full">
                <Lock className="h-4 w-4 mr-2" />
                Download Locked
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completion Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Page {currentPage}?</DialogTitle>
            <DialogDescription>
              You have spent {formatTime(timeSpent)} on this page. 
              {isTimeRequirementMet ? (
                <span className="text-green-600 block mt-2">
                  ✓ Minimum time requirement met ({MIN_TIME_MINUTES} minutes)
                </span>
              ) : (
                <span className="text-red-600 block mt-2">
                  ✗ You need to spend at least {MIN_TIME_MINUTES} minutes on this page
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowCompletionDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCompletePage}
              disabled={!isTimeRequirementMet}
            >
              Complete Page
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Time Warning Dialog */}
      <Dialog open={showTimeWarning} onOpenChange={setShowTimeWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Time Warning</DialogTitle>
            <DialogDescription>
              You are approaching the maximum time limit of {MAX_TIME_MINUTES} minutes for this page.
              Consider completing the page soon to avoid exceeding the time limit.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button onClick={() => setShowTimeWarning(false)}>
              Continue Reading
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
