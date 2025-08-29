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
import CreateClassModal from "@/components/modals/CreateClassModal";
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  Users, 
  Presentation,
  Eye,
  Edit,
  Trash2,
  CalendarDays
} from "lucide-react";
import type { Class, Course } from "@shared/schema";

export default function Classes() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  const { data: classes, isLoading: classesLoading, error } = useQuery({
    queryKey: ["/api/classes"],
    retry: false,
  });

  const { data: courses } = useQuery({
    queryKey: ["/api/courses"],
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

  const userRole = user?.role || 'teacher';
  const userId = user?.id;

  // Filter classes based on user role and filters
  const filteredClasses = (classes || []).filter((classItem: Class) => {
    // Role-based filtering
    if (userRole === 'teacher' && classItem.teacherId !== userId) {
      return false;
    }
    
    const course = courses?.find((c: Course) => c.id === classItem.courseId);
    const teacher = teachers?.find((t: any) => t.id === classItem.teacherId);
    
    const matchesSearch = classItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         teacher?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         teacher?.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCourse = courseFilter === "all" || classItem.courseId === courseFilter;
    const matchesStatus = statusFilter === "all" || classItem.status === statusFilter;
    
    return matchesSearch && matchesCourse && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6" data-testid="classes-content">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl">Class Management</h1>
          <p className="text-muted-foreground">
            {userRole === 'teacher' ? 'Manage your classes and sessions' : 'Oversee all classes and scheduling'}
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2"
          data-testid="button-schedule-class"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Class</span>
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="glassmorphism neumorphism">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search classes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-muted/50"
                  data-testid="input-search-classes"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="w-48 bg-muted/50" data-testid="select-course-filter">
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses?.map((course: Course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
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
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                data-testid="button-list-view"
              >
                <Presentation className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "calendar" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("calendar")}
                data-testid="button-calendar-view"
              >
                <CalendarDays className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {classesLoading ? (
        <Card className="glassmorphism neumorphism">
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="w-12 h-12 rounded-lg" />
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
      ) : filteredClasses.length === 0 ? (
        <Card className="glassmorphism neumorphism">
          <CardContent className="p-12 text-center">
            <Presentation className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No classes found</h3>
            <p className="text-muted-foreground mb-6">
              {classes?.length === 0 
                ? "No classes have been scheduled yet. Schedule your first class to get started."
                : "No classes match your current filters. Try adjusting your search criteria."
              }
            </p>
            {classes?.length === 0 && (
              <Button onClick={() => setIsCreateModalOpen(true)} data-testid="button-schedule-first-class">
                <Plus className="w-4 h-4 mr-2" />
                Schedule First Class
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "list" ? (
        <Card className="glassmorphism neumorphism overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30 border-b">
                <TableRow>
                  <TableHead className="text-left font-semibold">Class</TableHead>
                  <TableHead className="text-left font-semibold">Course</TableHead>
                  <TableHead className="text-left font-semibold">Teacher</TableHead>
                  <TableHead className="text-left font-semibold">Schedule</TableHead>
                  <TableHead className="text-left font-semibold">Duration</TableHead>
                  <TableHead className="text-left font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.map((classItem: Class) => {
                  const course = courses?.find((c: Course) => c.id === classItem.courseId);
                  const teacher = teachers?.find((t: any) => t.id === classItem.teacherId);
                  const teacherName = teacher 
                    ? (teacher.firstName && teacher.lastName 
                        ? `${teacher.firstName} ${teacher.lastName}`
                        : teacher.email)
                    : 'Unknown Teacher';
                  
                  return (
                    <TableRow key={classItem.id} className="hover:bg-muted/20" data-testid={`row-class-${classItem.id}`}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Presentation className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{classItem.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {classItem.attendanceCount || 0} attendees
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{course?.title || 'Unknown Course'}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-secondary/10 rounded-full flex items-center justify-center">
                            <span className="text-secondary font-medium text-xs">
                              {teacherName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm">{teacherName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {classItem.scheduledAt ? (
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1 text-sm">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(classItem.scheduledAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(classItem.scheduledAt).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Not scheduled</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{classItem.duration || 0} minutes</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          classItem.status === 'completed' ? 'default' : 
                          classItem.status === 'scheduled' ? 'secondary' : 'outline'
                        } className={
                          classItem.status === 'completed' ? 'bg-green-100 text-green-800' :
                          classItem.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {classItem.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid={`button-view-${classItem.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {(userRole === 'super_admin' || classItem.teacherId === userId) && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                data-testid={`button-edit-${classItem.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                data-testid={`button-delete-${classItem.id}`}
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
        <Card className="glassmorphism neumorphism">
          <CardContent className="p-12 text-center">
            <CalendarDays className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Calendar View Coming Soon</h3>
            <p className="text-muted-foreground">
              Interactive calendar view for class scheduling will be available here.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      <CreateClassModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}
