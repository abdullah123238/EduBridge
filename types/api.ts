export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'lecturer';
  enrolledCourses: string[];
  createdCourses: string[];
  avatar?: string;
  createdAt: string;
}

export interface Course {
  _id: string;
  title: string;
  code: string;
  description: string;
  lecturer: User;
  students: User[];
  isActive: boolean;
  createdAt: string;
}

export interface Announcement {
  _id: string;
  title: string;
  body: string;
  course: Course;
  createdBy: User;
  isImportant: boolean;
  attachments: string[];
  createdAt: string;
}

export interface Material {
  _id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  course: Course;
  uploadedBy: User;
  category?: string;
  isPublic: boolean;
  createdAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  announcement: string;
  user: User;
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}