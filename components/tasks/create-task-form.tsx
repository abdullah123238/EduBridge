import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateTask } from '@/hooks/use-tasks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Plus, 
  X,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title cannot exceed 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description cannot exceed 2000 characters'),
  type: z.enum(['assignment', 'quiz', 'project', 'discussion', 'reading']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  dueDate: z.string().min(1, 'Due date is required'),
  maxPoints: z.number().min(0, 'Max points must be positive').max(1000, 'Max points cannot exceed 1000'),
  instructions: z.string().optional(),
  gradingType: z.enum(['automatic', 'manual', 'peer']),
  passingScore: z.number().min(0, 'Passing score must be between 0 and 100').max(100, 'Passing score must be between 0 and 100'),
  attempts: z.number().min(1, 'Attempts must be at least 1').max(10, 'Attempts cannot exceed 10'),
  timeLimit: z.number().optional(),
  requiresSubmission: z.boolean(),
  isVisible: z.boolean(),
  tags: z.array(z.string()).optional(),
  learningObjectives: z.array(z.string()).optional(),
  resources: z.array(z.object({
    title: z.string().min(1, 'Resource title is required'),
    url: z.string().min(1, 'Resource URL is required'), // Made URL validation less strict
    type: z.enum(['link', 'file', 'video', 'document'])
  })).optional(),
  // Grading type specific settings - made all optional
  automaticGrading: z.object({
    rubric: z.array(z.object({
      criterion: z.string().min(1, 'Criterion is required'),
      points: z.number().min(0, 'Points must be positive'),
      description: z.string().min(1, 'Description is required')
    })).optional(),
    autoScoreRules: z.array(z.object({
      keyword: z.string().min(1, 'Keyword is required'),
      points: z.number().min(0, 'Points must be positive'),
      description: z.string().min(1, 'Description is required')
    })).optional()
  }).optional(),
  peerReviewSettings: z.object({
    numberOfReviewers: z.number().min(1).max(5).optional(),
    reviewCriteria: z.array(z.string()).optional(),
    anonymousReview: z.boolean().optional(),
    reviewDeadline: z.string().optional()
  }).optional(),
  manualGradingSettings: z.object({
    rubric: z.array(z.object({
      criterion: z.string().min(1, 'Criterion is required'),
      points: z.number().min(0, 'Points must be positive'),
      description: z.string().min(1, 'Description is required')
    })).optional(),
    gradingCriteria: z.array(z.string()).optional()
  }).optional()
});

type TaskFormData = z.infer<typeof taskSchema>;

interface CreateTaskFormProps {
  courseId: string;
  onSuccess?: () => void;
  className?: string;
}

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({
  courseId,
  onSuccess,
  className = ''
}) => {
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [learningObjectives, setLearningObjectives] = useState<string[]>([]);
  const [newObjective, setNewObjective] = useState('');
  const [resources, setResources] = useState<Array<{title: string; url: string; type: 'link' | 'file' | 'video' | 'document'}>>([]);
  
  // Grading type specific state
  const [automaticRubric, setAutomaticRubric] = useState<Array<{criterion: string; points: number; description: string}>>([]);
  const [autoScoreRules, setAutoScoreRules] = useState<Array<{keyword: string; points: number; description: string}>>([]);
  const [peerReviewCriteria, setPeerReviewCriteria] = useState<string[]>([]);
  const [manualRubric, setManualRubric] = useState<Array<{criterion: string; points: number; description: string}>>([]);
  const [manualGradingCriteria, setManualGradingCriteria] = useState<string[]>([]);

  const createTaskMutation = useCreateTask();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      type: 'assignment',
      priority: 'medium',
      maxPoints: 100,
      gradingType: 'manual',
      passingScore: 60,
      attempts: 1,
      requiresSubmission: true,
      isVisible: true,
      tags: [],
      learningObjectives: [],
      resources: []
    }
  });

  const watchedType = watch('type');
  const watchedGradingType = watch('gradingType');

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      setValue('tags', updatedTags);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    setValue('tags', updatedTags);
  };

  const addLearningObjective = () => {
    if (newObjective.trim() && !learningObjectives.includes(newObjective.trim())) {
      const updatedObjectives = [...learningObjectives, newObjective.trim()];
      setLearningObjectives(updatedObjectives);
      setValue('learningObjectives', updatedObjectives);
      setNewObjective('');
    }
  };

  const removeLearningObjective = (objectiveToRemove: string) => {
    const updatedObjectives = learningObjectives.filter(obj => obj !== objectiveToRemove);
    setLearningObjectives(updatedObjectives);
    setValue('learningObjectives', updatedObjectives);
  };

  const addResource = () => {
    const newResource = { title: '', url: '', type: 'link' as const };
    setResources([...resources, newResource]);
  };

  const updateResource = (index: number, field: string, value: string) => {
    const updatedResources = resources.map((resource, i) => 
      i === index ? { ...resource, [field]: value as any } : resource
    );
    setResources(updatedResources);
    setValue('resources', updatedResources);
  };

  const removeResource = (index: number) => {
    const updatedResources = resources.filter((_, i) => i !== index);
    setResources(updatedResources);
    setValue('resources', updatedResources);
  };

  // Grading type specific helper functions
  const addAutomaticRubricItem = () => {
    setAutomaticRubric([...automaticRubric, { criterion: '', points: 0, description: '' }]);
  };

  const updateAutomaticRubricItem = (index: number, field: string, value: string | number) => {
    const updated = automaticRubric.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setAutomaticRubric(updated);
  };

  const removeAutomaticRubricItem = (index: number) => {
    setAutomaticRubric(automaticRubric.filter((_, i) => i !== index));
  };

  const addAutoScoreRule = () => {
    setAutoScoreRules([...autoScoreRules, { keyword: '', points: 0, description: '' }]);
  };

  const updateAutoScoreRule = (index: number, field: string, value: string | number) => {
    const updated = autoScoreRules.map((rule, i) => 
      i === index ? { ...rule, [field]: value } : rule
    );
    setAutoScoreRules(updated);
  };

  const removeAutoScoreRule = (index: number) => {
    setAutoScoreRules(autoScoreRules.filter((_, i) => i !== index));
  };

  const addPeerReviewCriterion = () => {
    const newCriterion = '';
    if (newCriterion.trim() && !peerReviewCriteria.includes(newCriterion.trim())) {
      setPeerReviewCriteria([...peerReviewCriteria, newCriterion.trim()]);
    }
  };

  const removePeerReviewCriterion = (criterionToRemove: string) => {
    setPeerReviewCriteria(peerReviewCriteria.filter(c => c !== criterionToRemove));
  };

  const addManualRubricItem = () => {
    setManualRubric([...manualRubric, { criterion: '', points: 0, description: '' }]);
  };

  const updateManualRubricItem = (index: number, field: string, value: string | number) => {
    const updated = manualRubric.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setManualRubric(updated);
  };

  const removeManualRubricItem = (index: number) => {
    setManualRubric(manualRubric.filter((_, i) => i !== index));
  };

  const addManualGradingCriterion = () => {
    const newCriterion = '';
    if (newCriterion.trim() && !manualGradingCriteria.includes(newCriterion.trim())) {
      setManualGradingCriteria([...manualGradingCriteria, newCriterion.trim()]);
    }
  };

  const removeManualGradingCriterion = (criterionToRemove: string) => {
    setManualGradingCriteria(manualGradingCriteria.filter(c => c !== criterionToRemove));
  };

  const onSubmit = async (data: TaskFormData) => {
    try {
      // Basic validation checks
      if (!data.title.trim()) {
        alert('Please enter a task title');
        return;
      }
      if (!data.description.trim()) {
        alert('Please enter a task description');
        return;
      }
      if (!data.dueDate) {
        alert('Please select a due date');
        return;
      }

      // Filter out empty resources
      const validResources = resources.filter(resource => 
        resource.title.trim() && resource.url.trim()
      );

      const submissionData: any = {
        ...data,
        course: courseId,
        tags: tags.filter(tag => tag.trim()),
        learningObjectives: learningObjectives.filter(obj => obj.trim()),
        resources: validResources
      };

      // Add grading type specific data only if they have content
      if (data.gradingType === 'automatic') {
        const validRubric = automaticRubric.filter(item => 
          item.criterion.trim() && item.description.trim()
        );
        const validRules = autoScoreRules.filter(rule => 
          rule.keyword.trim() && rule.description.trim()
        );
        
        if (validRubric.length > 0 || validRules.length > 0) {
          submissionData.automaticGrading = {
            rubric: validRubric,
            autoScoreRules: validRules
          };
        }
      } else if (data.gradingType === 'peer') {
        const validCriteria = peerReviewCriteria.filter(criterion => criterion.trim());
        
        submissionData.peerReviewSettings = {
          numberOfReviewers: 2, // Default, can be made configurable
          reviewCriteria: validCriteria,
          anonymousReview: true, // Default
          reviewDeadline: data.dueDate // Default to same as assignment due date
        };
      } else if (data.gradingType === 'manual') {
        const validRubric = manualRubric.filter(item => 
          item.criterion.trim() && item.description.trim()
        );
        const validCriteria = manualGradingCriteria.filter(criterion => criterion.trim());
        
        if (validRubric.length > 0 || validCriteria.length > 0) {
          submissionData.manualGradingSettings = {
            rubric: validRubric,
            gradingCriteria: validCriteria
          };
        }
      }

      console.log('Submitting task data:', submissionData);
      
      // Additional debugging - log each field
      console.log('Form validation errors:', errors);
      console.log('Form data:', data);
      console.log('Grading type:', data.gradingType);
      console.log('Resources:', validResources);
      
      await createTaskMutation.mutateAsync(submissionData);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error creating task:', error);
      
      // Show specific validation errors if available
      if (error?.response?.data?.message) {
        alert(`Validation Error: ${error.response.data.message}`);
      } else if (error?.message) {
        alert(`Error: ${error.message}`);
      } else {
        alert('An error occurred while creating the task. Please check the console for details.');
      }
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Create New Task</span>
          </CardTitle>
          <CardDescription>
            Create a new assignment, quiz, or other task for your students
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Midterm Assignment"
                    {...register('title')}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Task Type *</Label>
                  <Select onValueChange={(value) => setValue('type', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select task type" />
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

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="Describe what students need to do..."
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  rows={3}
                  placeholder="Additional instructions for students..."
                  {...register('instructions')}
                />
              </div>
            </div>

            {/* Scheduling */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Scheduling</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    {...register('dueDate')}
                  />
                  {errors.dueDate && (
                    <p className="text-sm text-red-600">{errors.dueDate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select onValueChange={(value) => setValue('priority', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    placeholder="Optional"
                    {...register('timeLimit', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>

            {/* Grading */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Grading</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxPoints">Max Points *</Label>
                  <Input
                    id="maxPoints"
                    type="number"
                    {...register('maxPoints', { valueAsNumber: true })}
                  />
                  {errors.maxPoints && (
                    <p className="text-sm text-red-600">{errors.maxPoints.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passingScore">Passing Score (%)</Label>
                  <Input
                    id="passingScore"
                    type="number"
                    {...register('passingScore', { valueAsNumber: true })}
                  />
                  {errors.passingScore && (
                    <p className="text-sm text-red-600">{errors.passingScore.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attempts">Max Attempts</Label>
                  <Input
                    id="attempts"
                    type="number"
                    {...register('attempts', { valueAsNumber: true })}
                  />
                  {errors.attempts && (
                    <p className="text-sm text-red-600">{errors.attempts.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gradingType">Grading Type</Label>
                <Select onValueChange={(value) => setValue('gradingType', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grading type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="automatic">Automatic</SelectItem>
                    <SelectItem value="peer">Peer Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Grading Type Specific Settings */}
            {watchedGradingType === 'automatic' && (
              <div className="space-y-4">
                <h4 className="text-md font-medium text-scholiax-purple">Automatic Grading Settings</h4>
                
                {/* Automatic Rubric */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Grading Rubric</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addAutomaticRubricItem}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Criterion
                    </Button>
                  </div>
                  
                  {automaticRubric.map((item, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 p-3 border rounded-lg">
                      <Input
                        placeholder="Criterion"
                        value={item.criterion}
                        onChange={(e) => updateAutomaticRubricItem(index, 'criterion', e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Points"
                        value={item.points}
                        onChange={(e) => updateAutomaticRubricItem(index, 'points', Number(e.target.value))}
                      />
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateAutomaticRubricItem(index, 'description', e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeAutomaticRubricItem(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Auto Score Rules */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Auto-Score Rules</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addAutoScoreRule}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Rule
                    </Button>
                  </div>
                  
                  {autoScoreRules.map((rule, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 p-3 border rounded-lg">
                      <Input
                        placeholder="Keyword"
                        value={rule.keyword}
                        onChange={(e) => updateAutoScoreRule(index, 'keyword', e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Points"
                        value={rule.points}
                        onChange={(e) => updateAutoScoreRule(index, 'points', Number(e.target.value))}
                      />
                      <Input
                        placeholder="Description"
                        value={rule.description}
                        onChange={(e) => updateAutoScoreRule(index, 'description', e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeAutoScoreRule(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {watchedGradingType === 'peer' && (
              <div className="space-y-4">
                <h4 className="text-md font-medium text-scholiax-purple">Peer Review Settings</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numberOfReviewers">Number of Reviewers</Label>
                    <Input
                      id="numberOfReviewers"
                      type="number"
                      min="1"
                      max="5"
                      defaultValue="2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reviewDeadline">Review Deadline</Label>
                    <Input
                      id="reviewDeadline"
                      type="datetime-local"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Review Criteria</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addPeerReviewCriterion}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Criterion
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {peerReviewCriteria.map((criterion, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-sm">{criterion}</span>
                        <X 
                          className="w-4 h-4 cursor-pointer text-red-500" 
                          onClick={() => removePeerReviewCriterion(criterion)}
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add review criterion"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPeerReviewCriterion())}
                    />
                    <Button type="button" variant="outline" onClick={addPeerReviewCriterion}>
                      Add
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="anonymousReview" defaultChecked />
                  <Label htmlFor="anonymousReview">Anonymous peer review</Label>
                </div>
              </div>
            )}

            {watchedGradingType === 'manual' && (
              <div className="space-y-4">
                <h4 className="text-md font-medium text-scholiax-purple">Manual Grading Settings</h4>
                
                {/* Manual Rubric */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Grading Rubric</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addManualRubricItem}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Criterion
                    </Button>
                  </div>
                  
                  {manualRubric.map((item, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 p-3 border rounded-lg">
                      <Input
                        placeholder="Criterion"
                        value={item.criterion}
                        onChange={(e) => updateManualRubricItem(index, 'criterion', e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Points"
                        value={item.points}
                        onChange={(e) => updateManualRubricItem(index, 'points', Number(e.target.value))}
                      />
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateManualRubricItem(index, 'description', e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeManualRubricItem(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Manual Grading Criteria */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Grading Criteria</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addManualGradingCriterion}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Criterion
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {manualGradingCriteria.map((criterion, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-sm">{criterion}</span>
                        <X 
                          className="w-4 h-4 cursor-pointer text-red-500" 
                          onClick={() => removeManualGradingCriterion(criterion)}
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add grading criterion"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addManualGradingCriterion())}
                    />
                    <Button type="button" variant="outline" onClick={addManualGradingCriterion}>
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Tags</h3>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                    <span>{tag}</span>
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <Input
                  placeholder="Add a tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Add
                </Button>
              </div>
            </div>

            {/* Learning Objectives */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Learning Objectives</h3>
              
              <div className="space-y-2">
                {learningObjectives.map((objective, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-sm">{objective}</span>
                    <X 
                      className="w-4 h-4 cursor-pointer text-red-500" 
                      onClick={() => removeLearningObjective(objective)}
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <Input
                  placeholder="Add a learning objective"
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLearningObjective())}
                />
                <Button type="button" variant="outline" onClick={addLearningObjective}>
                  Add
                </Button>
              </div>
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Resources</h3>
              
              <div className="space-y-3">
                {resources.map((resource, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Input
                      placeholder="Resource title"
                      value={resource.title}
                      onChange={(e) => updateResource(index, 'title', e.target.value)}
                    />
                    <Input
                      placeholder="URL"
                      value={resource.url}
                      onChange={(e) => updateResource(index, 'url', e.target.value)}
                    />
                    <Select onValueChange={(value) => updateResource(index, 'type', value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="link">Link</SelectItem>
                        <SelectItem value="file">File</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => removeResource(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <Button type="button" variant="outline" onClick={addResource}>
                <Plus className="w-4 h-4 mr-2" />
                Add Resource
              </Button>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Settings</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requiresSubmission"
                    {...register('requiresSubmission')}
                  />
                  <Label htmlFor="requiresSubmission">Requires submission</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isVisible"
                    {...register('isVisible')}
                  />
                  <Label htmlFor="isVisible">Make visible to students</Label>
                </div>
              </div>
            </div>

            {/* Validation Errors Display */}
            {Object.keys(errors).length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="text-red-800 font-medium mb-2">Please fix the following errors:</h4>
                <ul className="text-red-700 text-sm space-y-1">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field}>• {field}: {error?.message}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline">
                Save as Draft
              </Button>
              <Button 
                type="submit" 
                className="bg-scholiax-purple hover:bg-scholiax-purple/90"
                disabled={createTaskMutation.isPending}
              >
                {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
