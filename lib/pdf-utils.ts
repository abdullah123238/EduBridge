// Utility function to estimate PDF pages based on file size
// This is a rough estimation - in a real application, you'd use a PDF parsing library
export function estimatePdfPages(fileSize: number, fileType: string): number {
  if (!fileType.includes('pdf')) {
    return 1; // Non-PDF files are treated as single page
  }
  
  // Rough estimation: average PDF page is about 50-100KB
  // We'll use 75KB as average and add some buffer
  const averagePageSize = 75 * 1024; // 75KB in bytes
  const estimatedPages = Math.ceil(fileSize / averagePageSize);
  
  // Set reasonable bounds
  return Math.max(1, Math.min(estimatedPages, 50)); // Between 1 and 50 pages
}

// Alternative: You could implement a more accurate method using a PDF library
// For example, using pdf-parse or pdf2pic to get actual page count
export async function getActualPdfPages(fileUrl: string): Promise<number> {
  try {
    // This would require implementing PDF parsing on the backend
    // For now, return a default value
    return 10; // Default to 10 pages for PDFs
  } catch (error) {
    console.error('Error getting PDF page count:', error);
    return 10; // Fallback to 10 pages
  }
}



