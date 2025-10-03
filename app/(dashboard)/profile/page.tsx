'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useAuth } from '@/lib/auth-context';
import { useUpdateProfile, useUpdatePassword } from '@/hooks/use-profile';
import { profileSchema, ProfileFormData } from '@/lib/validations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Calendar, Shield, Loader2, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDateMedium } from '@/lib/utils';

export default function ProfilePage() {


  const { user } = useAuth();
  const updateProfileMutation = useUpdateProfile();
  const updatePasswordMutation = useUpdatePassword();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const onSubmitProfile = async (data: ProfileFormData) => {
    try {
      await updateProfileMutation.mutateAsync({
        name: data.name,
        email: data.email,
      });
      reset({ ...data, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
    }
  };

  const onSubmitPassword = async (data: ProfileFormData) => {
    if (!data.currentPassword || !data.newPassword) {
      return;
    }

    try {
      await updatePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      reset({ ...data, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
    }
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">User not found</h3>
          <p className="text-gray-500">Please log in to view your profile.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-10">
          <motion.h1 
            className="text-4xl lg:text-5xl font-bold text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Profile
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-600 mt-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Manage your account settings and preferences effectively
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4">
                  <AvatarFallback className="text-lg sm:text-xl bg-blue-100 text-blue-600">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-semibold">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <Badge variant={user.role === 'lecturer' ? 'default' : 'secondary'}>
                    {user.role === 'lecturer' ? 'Lecturer' : 'Student'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Member since</span>
                  <span className="text-sm text-gray-900">
                    {user.createdAt ? formatDateMedium(user.createdAt) : 'Recently joined'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Courses</span>
                  <span className="text-sm text-gray-900">
                    {user.role === 'lecturer' 
                      ? user.createdCourses?.length || 0
                      : user.enrolledCourses?.length || 0
                    }
                  </span>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and account settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Tab Navigation */}
                <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex-1 py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                      activeTab === 'profile'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Profile Info
                  </button>
                  <button
                    onClick={() => setActiveTab('password')}
                    className={`flex-1 py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                      activeTab === 'password'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Change Password
                  </button>
                </div>

                {activeTab === 'profile' ? (
                  <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-6">
                    {/* Basic Information */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            placeholder="Enter your full name"
                            {...register('name')}
                          />
                          {errors.name && (
                            <p className="text-sm text-red-600">{errors.name.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            {...register('email')}
                          />
                          {errors.email && (
                            <p className="text-sm text-red-600">{errors.email.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="min-w-[120px]"
                      >
                        {updateProfileMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-6">
                    {/* Password Information */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            placeholder="Enter your current password"
                            {...register('currentPassword')}
                          />
                          {errors.currentPassword && (
                            <p className="text-sm text-red-600">{errors.currentPassword.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            placeholder="Enter your new password"
                            {...register('newPassword')}
                          />
                          {errors.newPassword && (
                            <p className="text-sm text-red-600">{errors.newPassword.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm your new password"
                            {...register('confirmPassword')}
                          />
                          {errors.confirmPassword && (
                            <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={updatePasswordMutation.isPending}
                        className="min-w-[120px]"
                      >
                        {updatePasswordMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Shield className="mr-2 h-4 w-4" />
                            Update Password
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
} 