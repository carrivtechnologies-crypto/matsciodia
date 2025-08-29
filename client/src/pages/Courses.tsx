import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CreateCourseModal from "@/components/modals/CreateCourseModal";
import { 
  Plus, 
  Search, 
  Grid, 
  List, 
  Eye, 
  Edit, 
  Trash2, 
  IndianRupee,
  Users,
  BookOpen 
} from "lucide-react";
import type { Course } from "@shared/schema";

export default function Courses() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");

  const { data: courses, isLoading: coursesLoading, error } = useQuery({
    queryKey: ["/api/courses"],
    retry: false,
  });

  const { data: teachers } = useQuery({
    queryKey: ["/api/teachers"],
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async (courseId: string) => {
      return await apiRequest("DELETE", `/api/courses/${courseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({
        title: "Success",
        description: "Course deleted successfully!",
      });
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
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
        description: "Failed to delete course. Please try again.",
        variant: "destructive",
      });
    },
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

  const userRole = user?.role || 'teacher';
  const filteredCourses = (courses || []).filter((course: Course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTeacher = teacherFilter === "all" || course.teacherId === teacherFilter;
    const matchesStatus = statusFilter === "all" || course.status === statusFilter;
    
    return matchesSearch && matchesTeacher && matchesStatus;
  });

  const handleDeleteCourse = (courseId: string) => {
    setCourseToDelete(courseId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (courseToDelete) {
      deleteMutation.mutate(courseToDelete);
    }
  };

  return (
    <div className="p-6 space-y-6" data-testid="courses-content">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl">Course Management</h1>
          <p className="text-muted-foreground">Manage your educational content and track performance</p>
        </div>
        {(userRole === 'super_admin' || userRole === 'teacher') && (
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2"
            data-testid="button-create-course"
          >
            <Plus className="w-4 h-4" />
            <span>Create Course</span>
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <Card className="glassmorphism neumorphism">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-muted/50"
                  data-testid="input-search-courses"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              
              <Select value={teacherFilter} onValueChange={setTeacherFilter}>
                <SelectTrigger className="w-48 bg-muted/50" data-testid="select-teacher-filter">
                  <SelectValue placeholder="All Teachers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teachers</SelectItem>
                  {teachers?.map((teacher: any) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.firstName && teacher.lastName 
                        ? `${teacher.firstName} ${teacher.lastName}`
                        : teacher.email
                      }
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 bg-muted/50" data-testid="select-status-filter">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                data-testid="button-grid-view"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                data-testid="button-table-view"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {coursesLoading ? (
        <Card className="glassmorphism neumorphism">
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="w-16 h-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="w-48 h-4" />
                    <Skeleton className="w-64 h-3" />
                  </div>
                  <Skeleton className="w-20 h-6" />
                  <Skeleton className="w-24 h-6" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : filteredCourses.length === 0 ? (
        <Card className="glassmorphism neumorphism">
          <CardContent className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-6">
              {courses?.length === 0 
                ? "No courses have been created yet. Create your first course to get started."
                : "No courses match your current filters. Try adjusting your search criteria."
              }
            </p>
            {(userRole === 'super_admin' || userRole === 'teacher') && courses?.length === 0 && (
              <Button onClick={() => setIsCreateModalOpen(true)} data-testid="button-create-first-course">
                <Plus className="w-4 h-4 mr-2" />
                Create First Course
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "table" ? (
        <Card className="glassmorphism neumorphism overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30 border-b">
                <TableRow>
                  <TableHead className="text-left font-semibold">Course</TableHead>
                  <TableHead className="text-left font-semibold">Teacher</TableHead>
                  <TableHead className="text-left font-semibold">Price</TableHead>
                  <TableHead className="text-left font-semibold">Enrolled</TableHead>
                  <TableHead className="text-left font-semibold">Sales</TableHead>
                  <TableHead className="text-left font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course: Course) => {
                  const teacher = teachers?.find((t: any) => t.id === course.teacherId);
                  const teacherName = teacher 
                    ? (teacher.firstName && teacher.lastName 
                        ? `${teacher.firstName} ${teacher.lastName}`
                        : teacher.email)
                    : 'Unknown Teacher';
                  
                  return (
                    <TableRow key={course.id} className="hover:bg-muted/20" data-testid={`row-course-${course.id}`}>
                      <TableCell>
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-10 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold cursor-pointer hover:text-primary transition-colors"
                               onClick={() => window.location.href = `/courses/${course.id}`}
                               data-testid={`link-course-${course.id}`}>
                              {course.title}
                            </p>
                            <p className="text-muted-foreground text-sm line-clamp-1">
                              {course.description || 'No description available'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-medium text-sm">
                              {teacherName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium">{teacherName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-semibold">₹{parseFloat(course.price || '0').toLocaleString('en-IN')}</span>
                          {course.discount && course.discount > 0 && (
                            <>
                              <span className="text-muted-foreground text-sm line-through ml-2">
                                ₹{(parseFloat(course.price || '0') * (100 / (100 - course.discount))).toLocaleString('en-IN')}
                              </span>
                              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                                {course.discount}% OFF
                              </Badge>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">{course.enrolledCount || 0}</span>
                        <span className="text-muted-foreground text-sm"> students</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-green-600">
                          ₹{parseFloat(course.totalSales || '0').toLocaleString('en-IN')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          course.status === 'published' ? 'default' : 
                          course.status === 'draft' ? 'secondary' : 'outline'
                        } className={
                          course.status === 'published' ? 'bg-green-100 text-green-800' :
                          course.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {course.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.location.href = `/courses/${course.id}`}
                            data-testid={`button-view-${course.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {(userRole === 'super_admin' || course.teacherId === user?.id) && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                data-testid={`button-edit-${course.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCourse(course.id)}
                                data-testid={`button-delete-${course.id}`}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course: Course) => {
            const teacher = teachers?.find((t: any) => t.id === course.teacherId);
            const teacherName = teacher 
              ? (teacher.firstName && teacher.lastName 
                  ? `${teacher.firstName} ${teacher.lastName}`
                  : teacher.email)
              : 'Unknown Teacher';
            
            return (
              <Card key={course.id} className="glassmorphism neumorphism hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer"
                    onClick={() => window.location.href = `/courses/${course.id}`}
                    data-testid={`card-course-${course.id}`}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="w-full h-32 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-primary" />
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {course.description || 'No description available'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-medium text-xs">
                          {teacherName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium">{teacherName}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-lg">₹{parseFloat(course.price || '0').toLocaleString('en-IN')}</span>
                        {course.discount && course.discount > 0 && (
                          <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                            {course.discount}% OFF
                          </Badge>
                        )}
                      </div>
                      <Badge variant={
                        course.status === 'published' ? 'default' : 
                        course.status === 'draft' ? 'secondary' : 'outline'
                      } className={
                        course.status === 'published' ? 'bg-green-100 text-green-800' :
                        course.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {course.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{course.enrolledCount || 0} students</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <IndianRupee className="w-4 h-4" />
                        <span>₹{parseFloat(course.totalSales || '0').toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <CreateCourseModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="glassmorphism neumorphism">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this course? This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Course"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
