import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ClipboardCheck, Clock, Target } from "lucide-react";

const createTestSchema = z.object({
  title: z.string().min(1, "Test title is required"),
  courseId: z.string().min(1, "Course is required"),
  classId: z.string().optional(),
  duration: z.string().min(1, "Duration is required"),
  totalMarks: z.string().min(1, "Total marks is required"),
  passingMarks: z.string().min(1, "Passing marks is required"),
  instructions: z.string().optional(),
  status: z.enum(["draft", "published"]),
});

type CreateTestForm = z.infer<typeof createTestSchema>;

interface CreateTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateTestModal({ isOpen, onClose }: CreateTestModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateTestForm>({
    resolver: zodResolver(createTestSchema),
    defaultValues: {
      title: "",
      courseId: "",
      classId: "",
      duration: "60",
      totalMarks: "100",
      passingMarks: "40",
      instructions: "",
      status: "draft",
    },
  });

  const { data: courses } = useQuery({
    queryKey: ["/api/courses"],
    retry: false,
  });

  const { data: classes } = useQuery({
    queryKey: ["/api/classes"],
    retry: false,
  });

  const createTestMutation = useMutation({
    mutationFn: async (data: CreateTestForm) => {
      const testData = {
        ...data,
        duration: parseInt(data.duration),
        totalMarks: parseInt(data.totalMarks),
        passingMarks: parseInt(data.passingMarks),
        classId: data.classId || null,
      };
      
      return await apiRequest("POST", "/api/tests", testData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({
        title: "Success",
        description: "Test created successfully!",
      });
      onClose();
      form.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create test. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateTestForm) => {
    createTestMutation.mutate(data);
  };

  const selectedCourseId = form.watch("courseId");
  const filteredClasses = classes?.filter((classItem: any) => classItem.courseId === selectedCourseId) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glassmorphism neumorphism" data-testid="modal-create-test">
        <DialogHeader>
          <DialogTitle className="font-heading font-bold text-2xl">Create New Test</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter test title" {...field} data-testid="input-test-title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Course</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("classId", ""); // Reset class selection
                    }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-course">
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courses?.map((course: any) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link to Class (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedCourseId}>
                      <FormControl>
                        <SelectTrigger data-testid="select-class">
                          <SelectValue placeholder={selectedCourseId ? "Select class" : "Select course first"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No specific class</SelectItem>
                        {filteredClasses.map((classItem: any) => (
                          <SelectItem key={classItem.id} value={classItem.id}>
                            {classItem.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test Instructions (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter instructions for students..." 
                      rows={3} 
                      {...field} 
                      data-testid="textarea-test-instructions"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-duration">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="180">3 hours</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalMarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Marks</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          type="number" 
                          placeholder="100" 
                          min="1"
                          className="pl-10"
                          {...field} 
                          data-testid="input-total-marks"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passingMarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passing Marks</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <ClipboardCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          type="number" 
                          placeholder="40" 
                          min="1"
                          max={form.watch("totalMarks") ? parseInt(form.watch("totalMarks")) : undefined}
                          className="pl-10"
                          {...field} 
                          data-testid="input-passing-marks"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publication Status</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-6"
                      data-testid="radio-test-status"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="draft" id="draft" />
                        <Label htmlFor="draft">Save as Draft</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="published" id="published" />
                        <Label htmlFor="published">Publish Immediately</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Test Configuration Info */}
            <div className="p-4 bg-muted/30 rounded-xl">
              <h4 className="font-semibold text-sm mb-3 flex items-center space-x-2">
                <ClipboardCheck className="w-4 h-4" />
                <span>Test Configuration Summary</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="ml-2 font-medium">
                    {form.watch("duration") ? `${form.watch("duration")} minutes` : "Not set"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Marks:</span>
                  <span className="ml-2 font-medium">
                    {form.watch("totalMarks") || "Not set"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Pass Percentage:</span>
                  <span className="ml-2 font-medium">
                    {form.watch("totalMarks") && form.watch("passingMarks") 
                      ? `${Math.round((parseInt(form.watch("passingMarks")) / parseInt(form.watch("totalMarks"))) * 100)}%`
                      : "Not calculated"
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-border">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                data-testid="button-cancel-test"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createTestMutation.isPending}
                data-testid="button-submit-test"
              >
                {createTestMutation.isPending ? "Creating..." : "Create Test"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
