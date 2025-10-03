import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'lecturer']).refine((val) => val !== undefined, {
    message: 'Please select a role',
  }),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const courseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  code: z.string().min(1, 'Course code is required').max(20, 'Course code must be less than 20 characters'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
});

export type CourseFormData = z.infer<typeof courseSchema>;

export const announcementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  body: z.string().min(1, 'Announcement content is required').max(1000, 'Content must be less than 1000 characters'),
  courseId: z.string().min(1, 'Please select a course'),
  isImportant: z.boolean(),
});

export type AnnouncementFormData = z.infer<typeof announcementSchema>;

export const materialSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  courseId: z.string().min(1, 'Please select a course'),
  category: z.enum(['lecture-notes', 'resources', 'other'], {
    errorMap: () => ({ message: 'Category must be Lecture Notes, Resources, or Other' })
  }),
});

export type MaterialFormData = z.infer<typeof materialSchema>;

export const commentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(500, 'Comment must be less than 500 characters'),
});

export type CommentFormData = z.infer<typeof commentSchema>;

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'Password must be at least 6 characters').optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: "Current password is required to change password",
  path: ["currentPassword"],
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type ProfileFormData = z.infer<typeof profileSchema>;