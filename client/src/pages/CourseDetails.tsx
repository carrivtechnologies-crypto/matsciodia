import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Users,
  IndianRupee,
  Calendar,
  Clock,
  FileText,
  BarChart3,
  Settings,
  Edit,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import type { Course } from "@shared/schema";

interface CourseDetailsProps {
  courseId: string;
}

export default function CourseDetails({ courseId }: CourseDetailsProps) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const { data: course, isLoading: courseLoading, error } = useQuery({
    queryKey: ["/api/courses", courseId],
    retry: false,
  });

  const { data: classes } = useQuery({
    queryKey: ["/api/classes"],
    retry: false,
  });

  const { data: tests } = useQuery({
    queryKey: ["/api/tests"],
    retry: false,
  });

  const { data: files } = useQuery({
    queryKey: ["/api/files"],
    retry: false,
  });

  const { data: teachers } = useQuery({
    queryKey: ["/api/teachers"],
    retry: false,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
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
  }, [isAuthenticated, authLoading, toast]);

  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
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
  }, [error, toast]);

  if (authLoading || !isAuthenticated) {
    return <div className="flex items-center justify-center h-full">
      <Skeleton className="w-32 h-8" />
    </div>;
  }

  if (courseLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="w-full h-48 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="w-full h-96" />
          </div>
          <div className="space-y-6">
            <Skeleton className="w-full h-48" />
            <Skeleton className="w-full h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6">
        <Card className="glassmorphism neumorphism">
          <CardContent className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Course not found</h3>
            <p className="text-muted-foreground mb-6">
              The course you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => window.location.href = '/courses'} data-testid="button-back-to-courses">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const teacher = teachers?.find((t: any) => t.id === course.teacherId);
  const teacherName = teacher 
    ? (teacher.firstName && teacher.lastName 
        ? `${teacher.firstName} ${teacher.lastName}`
        : teacher.email)
    : 'Unknown Teacher';

  const courseClasses = classes?.filter((c: any) => c.courseId === courseId) || [];
  const courseTests = tests?.filter((t: any) => t.courseId === courseId) || [];
  const courseMaterials = files?.filter((f: any) => f.courseId === courseId) || [];

  const userRole = user?.role || 'teacher';
  const canEdit = userRole === 'super_admin' || course.teacherId === user?.id;

  return (
    <div className="p-6 space-y-6" data-testid="course-details-content">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => window.location.href = '/courses'}
          className="flex items-center space-x-2"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Courses</span>
        </Button>
        
        {canEdit && (
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" data-testid="button-edit-course">
              <Edit className="w-4 h-4 mr-2" />
              Edit Course
            </Button>
            <Button variant="outline" size="sm" className="text-destructive" data-testid="button-delete-course">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Course Header */}
      <Card className="glassmorphism neumorphism">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8 space-y-6 lg:space-y-0">
            <div className="w-full lg:w-48 h-32 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-primary" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="font-heading font-bold text-3xl mb-2" data-testid="course-title">
                    {course.title}
                  </h1>
                  <p className="text-muted-foreground text-lg" data-testid="course-description">
                    {course.description || 'No description available'}
                  </p>
                </div>
                <Badge 
                  variant={course.status === 'published' ? 'default' : 'secondary'}
                  className={
                    course.status === 'published' ? 'bg-green-100 text-green-800' :
                    course.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }
                >
                  {course.status}
                </Badge>
              </div>

              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={teacher?.profileImageUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {teacherName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{teacherName}</p>
                    <p className="text-sm text-muted-foreground">Instructor</p>
                  </div>
                </div>
                
                <Separator orientation="vertical" className="h-12" />
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-semibold">{course.duration || 0} weeks</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <IndianRupee className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-muted-foreground">Price</span>
                  </div>
                  <p className="font-bold text-lg">₹{parseFloat(course.price || '0').toLocaleString('en-IN')}</p>
                  {course.discount && course.discount > 0 && (
                    <p className="text-sm text-green-600">{course.discount}% discount</p>
                  )}
                </div>
                
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Students</span>
                  </div>
                  <p className="font-bold text-lg">{course.enrolledCount || 0}</p>
                </div>
                
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-secondary" />
                    <span className="text-sm text-muted-foreground">Revenue</span>
                  </div>
                  <p className="font-bold text-lg">₹{parseFloat(course.totalSales || '0').toLocaleString('en-IN')}</p>
                </div>
                
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-muted-foreground">Classes</span>
                  </div>
                  <p className="font-bold text-lg">{courseClasses.length}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="students" data-testid="tab-students">Students</TabsTrigger>
          <TabsTrigger value="classes" data-testid="tab-classes">Classes</TabsTrigger>
          <TabsTrigger value="tests" data-testid="tab-tests">Tests</TabsTrigger>
          <TabsTrigger value="materials" data-testid="tab-materials">Materials</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="glassmorphism neumorphism">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">Course Overview</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">
                    {course.description || 'No detailed description available for this course.'}
                  </p>
                </div>
                
                {course.tags && course.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {course.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h4 className="font-medium mb-2">Course Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Updated:</span>
                        <span>{new Date(course.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant="outline">{course.status}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Performance</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Enrollments:</span>
                        <span className="font-medium">{course.enrolledCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Revenue:</span>
                        <span className="font-medium text-green-600">
                          ₹{parseFloat(course.totalSales || '0').toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Classes Scheduled:</span>
                        <span className="font-medium">{courseClasses.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <Card className="glassmorphism neumorphism">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Enrolled Students</h3>
                <Badge variant="outline">{course.enrolledCount || 0} students</Badge>
              </div>
              
              {(course.enrolledCount || 0) === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-medium text-lg mb-2">No students enrolled yet</h4>
                  <p className="text-muted-foreground">
                    Students will appear here once they enroll in this course.
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-medium text-lg mb-2">Student data not available</h4>
                  <p className="text-muted-foreground">
                    Student enrollment details will be displayed here when data is available.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes" className="space-y-6">
          <Card className="glassmorphism neumorphism">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Scheduled Classes</h3>
                <Button size="sm" data-testid="button-add-class">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Class
                </Button>
              </div>
              
              {courseClasses.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-medium text-lg mb-2">No classes scheduled</h4>
                  <p className="text-muted-foreground mb-6">
                    Schedule your first class to start teaching this course.
                  </p>
                  <Button data-testid="button-schedule-first-class">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule First Class
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {courseClasses.map((classItem: any) => (
                    <div key={classItem.id} className="p-4 border border-border rounded-xl hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{classItem.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {classItem.scheduledAt ? new Date(classItem.scheduledAt).toLocaleString() : 'Not scheduled'}
                          </p>
                        </div>
                        <Badge variant={classItem.status === 'completed' ? 'default' : 'secondary'}>
                          {classItem.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-6">
          <Card className="glassmorphism neumorphism">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Course Tests</h3>
                <Button size="sm" data-testid="button-add-test">
                  <FileText className="w-4 h-4 mr-2" />
                  Create Test
                </Button>
              </div>
              
              {courseTests.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-medium text-lg mb-2">No tests created</h4>
                  <p className="text-muted-foreground mb-6">
                    Create assessments to evaluate student progress.
                  </p>
                  <Button data-testid="button-create-first-test">
                    <FileText className="w-4 h-4 mr-2" />
                    Create First Test
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {courseTests.map((test: any) => (
                    <div key={test.id} className="p-4 border border-border rounded-xl hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{test.title}</h4>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{test.duration || 0} minutes</span>
                            </span>
                            <span>{test.totalMarks || 0} marks</span>
                          </div>
                        </div>
                        <Badge variant={test.status === 'published' ? 'default' : 'secondary'}>
                          {test.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="space-y-6">
          <Card className="glassmorphism neumorphism">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Course Materials</h3>
                <Button size="sm" data-testid="button-upload-material">
                  <FileText className="w-4 h-4 mr-2" />
                  Upload Material
                </Button>
              </div>
              
              {courseMaterials.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-medium text-lg mb-2">No materials uploaded</h4>
                  <p className="text-muted-foreground mb-6">
                    Upload study materials, documents, and resources for your students.
                  </p>
                  <Button data-testid="button-upload-first-material">
                    <FileText className="w-4 h-4 mr-2" />
                    Upload First Material
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {courseMaterials.map((file: any) => (
                    <div key={file.id} className="p-4 border border-border rounded-xl hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{file.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {file.type} • {file.size ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : 'Unknown size'}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="glassmorphism neumorphism">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-6">Course Analytics</h3>
              
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-medium text-lg mb-2">Analytics Coming Soon</h4>
                <p className="text-muted-foreground">
                  Detailed course analytics and performance metrics will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
