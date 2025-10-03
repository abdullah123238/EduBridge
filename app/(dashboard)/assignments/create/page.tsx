'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Save,
  Eye,
  Calendar,
  Clock,
  FileText,
  Users,
  Target,
  AlertCircle,
  CheckCircle,
  Plus,
  X,
  Settings,
  Tag
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useCreateTask, useCourses } from '@/hooks/use-tasks';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface LearningObjective {
  id: string;
  text: string;
}

interface Resource {
  id: string;
  title: string;
  url: string;
  type: 'link' | 'file' | 'video' | 'document';
}

export default function CreateAssignmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const createTaskMutation = useCreateTask();
  const { data: coursesData } = useCourses(1, 100);
  
  const courses = coursesData?.data || [];
  const preselectedCourseId = searchParams.get('course');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: preselectedCourseId || '',
    type: 'assignment' as 'assignment' | 'quiz' | 'project' | 'discussion' | 'reading',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    dueDate: '',
    startDate: '',
    maxPoints: 100,
    instructions: '',
    allowedFileTypes: [] as string[],
    maxFileSize: 10,
    maxFiles: 5,
    gradingType: 'manual' as 'automatic' | 'manual' | 'peer',
    passingScore: 60,
    attempts: 1,
    timeLimit: 0,
    isVisible: true,
    requiresSubmission: true,
    tags: [] as string[],
    category: '',
    learningObjectives: [] as LearningObjective[],
    resources: [] as Resource[]
  });

  const [newTag, setNewTag] = useState('');
  const [newObjective, setNewObjective] = useState('');
  const [newResource, setNewResource] = useState({
    title: '',
    url: '',
    type: 'link' as 'link' | 'file' | 'video' | 'document'
  });

  const fileTypeOptions = [
    { value: 'pdf', label: 'PDF' },
    { value: 'doc', label: 'Word Document' },
    { value: 'docx', label: 'Word Document (DOCX)' },
    { value: 'txt', label: 'Text File' },
    { value: 'jpg', label: 'JPEG Image' },
    { value: 'png', label: 'PNG Image' },
    { value: 'zip', label: 'ZIP Archive' },
    { value: 'rar', label: 'RAR Archive' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addLearningObjective = () => {
    if (newObjective.trim()) {
      const objective: LearningObjective = {
        id: Date.now().toString(),
        text: newObjective.trim()
      };
      setFormData(prev => ({
        ...prev,
        learningObjectives: [...prev.learningObjectives, objective]
      }));
      setNewObjective('');
    }
  };

  const removeLearningObjective = (id: string) => {
    setFormData(prev => ({
      ...prev,
      learningObjectives: prev.learningObjectives.filter(obj => obj.id !== id)
    }));
  };

  const addResource = () => {
    if (newResource.title.trim() && newResource.url.trim()) {
      const resource: Resource = {
        id: Date.now().toString(),
        ...newResource
      };
      setFormData(prev => ({
        ...prev,
        resources: [...prev.resources, resource]
      }));
      setNewResource({
        title: '',
        url: '',
        type: 'link'
      });
    }
  };

  const removeResource = (id: string) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter(resource => resource.id !== id)
    }));
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title for the assignment');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please enter a description for the assignment');
      return;
    }

    if (!formData.course) {
      toast.error('Please select a course');
      return;
    }

    if (!formData.dueDate) {
      toast.error('Please set a due date');
      return;
    }

    const assignmentData = {
      ...formData,
      status,
      learningObjectives: formData.learningObjectives.map(obj => obj.text),
      tags: formData.tags
    };

    try {
      await createTaskMutation.mutateAsync(assignmentData);
      router.push('/assignments');
    } catch (error) {
      console.error('Error creating assignment:', error);
    }
  };

  if (user?.role !== 'lecturer') {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">Only lecturers can create assignments.</p>
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
        <div className="mb-8">
          <Link href="/assignments" className="inline-flex items-center text-scholiax-purple hover:text-scholiax-purple/90 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assignments
          </Link>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">Create Assignment</h1>
          <p className="text-lg text-gray-600 mt-3">
            Create a new assignment for your students
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Basic Information</span>
                </CardTitle>
                <CardDescription>
                  Essential details about the assignment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Assignment Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter assignment title"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe what students need to do"
                    className="mt-1 min-h-[120px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="course">Course *</Label>
                    <Select value={formData.course} onValueChange={(value) => handleInputChange('course', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course._id} value={course._id}>
                            {course.title} ({course.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="type">Assignment Type</Label>
                    <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="assignment">Assignment</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                        <SelectItem value="discussion">Discussion</SelectItem>
                        <SelectItem value="reading">Reading</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={formData.instructions}
                    onChange={(e) => handleInputChange('instructions', e.target.value)}
                    placeholder="Detailed instructions for students"
                    className="mt-1 min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Dates and Points */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Dates & Points</span>
                </CardTitle>
                <CardDescription>
                  Set deadlines and scoring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="dueDate">Due Date *</Label>
                    <Input
                      id="dueDate"
                      type="datetime-local"
                      value={formData.dueDate}
                      onChange={(e) => handleInputChange('dueDate', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="maxPoints">Max Points</Label>
                    <Input
                      id="maxPoints"
                      type="number"
                      min="0"
                      value={formData.maxPoints}
                      onChange={(e) => handleInputChange('maxPoints', parseInt(e.target.value))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="passingScore">Passing Score (%)</Label>
                    <Input
                      id="passingScore"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.passingScore}
                      onChange={(e) => handleInputChange('passingScore', parseInt(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File Submission */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>File Submission</span>
                </CardTitle>
                <CardDescription>
                  Configure file upload settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requiresSubmission"
                    checked={formData.requiresSubmission}
                    onCheckedChange={(checked) => handleInputChange('requiresSubmission', checked)}
                  />
                  <Label htmlFor="requiresSubmission">Requires File Submission</Label>
                </div>

                {formData.requiresSubmission && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="maxFiles">Max Files</Label>
                        <Input
                          id="maxFiles"
                          type="number"
                          min="1"
                          value={formData.maxFiles}
                          onChange={(e) => handleInputChange('maxFiles', parseInt(e.target.value))}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                        <Input
                          id="maxFileSize"
                          type="number"
                          min="1"
                          value={formData.maxFileSize}
                          onChange={(e) => handleInputChange('maxFileSize', parseInt(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Allowed File Types</Label>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                        {fileTypeOptions.map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={option.value}
                              checked={formData.allowedFileTypes.includes(option.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  handleInputChange('allowedFileTypes', [...formData.allowedFileTypes, option.value]);
                                } else {
                                  handleInputChange('allowedFileTypes', formData.allowedFileTypes.filter(type => type !== option.value));
                                }
                              }}
                            />
                            <Label htmlFor={option.value} className="text-sm">{option.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Learning Objectives */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Learning Objectives</span>
                </CardTitle>
                <CardDescription>
                  What students should learn from this assignment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={newObjective}
                    onChange={(e) => setNewObjective(e.target.value)}
                    placeholder="Add a learning objective"
                    onKeyPress={(e) => e.key === 'Enter' && addLearningObjective()}
                  />
                  <Button onClick={addLearningObjective} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {formData.learningObjectives.length > 0 && (
                  <div className="space-y-2">
                    {formData.learningObjectives.map((objective) => (
                      <div key={objective.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{objective.text}</span>
                        <Button
                          onClick={() => removeLearningObjective(objective.id)}
                          size="sm"
                          variant="ghost"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Resources</span>
                </CardTitle>
                <CardDescription>
                  Additional resources for students
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Input
                    value={newResource.title}
                    onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Resource title"
                  />
                  <Input
                    value={newResource.url}
                    onChange={(e) => setNewResource(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="URL or file path"
                  />
                  <div className="flex space-x-2">
                    <Select value={newResource.type} onValueChange={(value) => setNewResource(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="link">Link</SelectItem>
                        <SelectItem value="file">File</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={addResource} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {formData.resources.length > 0 && (
                  <div className="space-y-2">
                    {formData.resources.map((resource) => (
                      <div key={resource.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <span className="text-sm font-medium">{resource.title}</span>
                          <span className="text-xs text-gray-500 ml-2">({resource.type})</span>
                        </div>
                        <Button
                          onClick={() => removeResource(resource.id)}
                          size="sm"
                          variant="ghost"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assignment Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isVisible"
                    checked={formData.isVisible}
                    onCheckedChange={(checked) => handleInputChange('isVisible', checked)}
                  />
                  <Label htmlFor="isVisible">Visible to Students</Label>
                </div>

                <div>
                  <Label htmlFor="gradingType">Grading Type</Label>
                  <Select value={formData.gradingType} onValueChange={(value) => handleInputChange('gradingType', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="automatic">Automatic</SelectItem>
                      <SelectItem value="peer">Peer Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="attempts">Max Attempts</Label>
                  <Input
                    id="attempts"
                    type="number"
                    min="1"
                    value={formData.attempts}
                    onChange={(e) => handleInputChange('attempts', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    min="0"
                    value={formData.timeLimit}
                    onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value))}
                    className="mt-1"
                    placeholder="0 = no limit"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Tag className="w-5 h-5" />
                  <span>Tags</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                        <span>{tag}</span>
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => handleSubmit('draft')}
                  disabled={createTaskMutation.isPending}
                  className="w-full"
                  variant="outline"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save as Draft
                </Button>

                <Button
                  onClick={() => handleSubmit('published')}
                  disabled={createTaskMutation.isPending}
                  className="w-full bg-scholiax-purple hover:bg-scholiax-purple/90"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Publish Assignment
                </Button>

                {createTaskMutation.isPending && (
                  <div className="text-center text-sm text-gray-600">
                    Creating assignment...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
