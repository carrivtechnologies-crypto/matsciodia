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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Search, 
  Presentation, 
  Mail, 
  BookOpen,
  Users,
  Star,
  Eye,
  Edit,
  Trash2,
  Upload,
  MessageCircle
} from "lucide-react";
import type { User } from "@shared/schema";

export default function Teachers() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const { data: teachers, isLoading: teachersLoading, error } = useQuery({
    queryKey: ["/api/teachers"],
    retry: false,
  });

  const { data: courses } = useQuery({
    queryKey: ["/api/courses"],
    retry: false,
  });

  const { data: classes } = useQuery({
    queryKey: ["/api/classes"],
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

  // Filter teachers based on search
  const filteredTeachers = (teachers || []).filter((teacher: User) => {
    const teacherName = teacher.firstName && teacher.lastName 
      ? `${teacher.firstName} ${teacher.lastName}`
      : teacher.email || '';
    
    return teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           teacher.email?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleViewProfile = (teacher: User) => {
    setSelectedTeacher(teacher);
    setIsProfileModalOpen(true);
  };

  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) return firstName[0].toUpperCase();
    if (email) return email[0].toUpperCase();
    return "T";
  };

  const getTeacherStats = (teacherId: string) => {
    const teacherCourses = courses?.filter((c: any) => c.teacherId === teacherId) || [];
    const teacherClasses = classes?.filter((c: any) => c.teacherId === teacherId) || [];
    
    return {
      coursesCount: teacherCourses.length,
      classesCount: teacherClasses.length,
      studentsCount: teacherCourses.reduce((sum, course) => sum + (course.enrolledCount || 0), 0)
    };
  };

  return (
    <div className="p-6 space-y-6" data-testid="teachers-content">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl">Teacher Management</h1>
          <p className="text-muted-foreground">Manage teaching staff and track their performance</p>
        </div>
        {userRole === 'super_admin' && (
          <div className="flex items-center space-x-2">
            <Button variant="outline" data-testid="button-bulk-upload">
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
            </Button>
            <Button data-testid="button-add-teacher">
              <Plus className="w-4 h-4 mr-2" />
              Add Teacher
            </Button>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glassmorphism neumorphism">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Presentation className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Teachers</p>
                <p className="font-bold text-xl">{teachers?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism neumorphism">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <p className="font-bold text-xl">{courses?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism neumorphism">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Classes</p>
                <p className="font-bold text-xl">{classes?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism neumorphism">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Rating</p>
                <p className="font-bold text-xl">4.8</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="glassmorphism neumorphism">
        <CardContent className="p-6">
          <div className="relative w-80">
            <Input
              type="text"
              placeholder="Search teachers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50"
              data-testid="input-search-teachers"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {teachersLoading ? (
        <Card className="glassmorphism neumorphism">
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
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
      ) : filteredTeachers.length === 0 ? (
        <Card className="glassmorphism neumorphism">
          <CardContent className="p-12 text-center">
            <Presentation className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No teachers found</h3>
            <p className="text-muted-foreground mb-6">
              {teachers?.length === 0 
                ? "No teachers have been added yet. Add your first teacher to get started."
                : "No teachers match your search criteria. Try adjusting your search."
              }
            </p>
            {userRole === 'super_admin' && teachers?.length === 0 && (
              <Button data-testid="button-add-first-teacher">
                <Plus className="w-4 h-4 mr-2" />
                Add First Teacher
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="glassmorphism neumorphism overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30 border-b">
                <TableRow>
                  <TableHead className="text-left font-semibold">Teacher</TableHead>
                  <TableHead className="text-left font-semibold">Contact</TableHead>
                  <TableHead className="text-left font-semibold">Courses</TableHead>
                  <TableHead className="text-left font-semibold">Classes</TableHead>
                  <TableHead className="text-left font-semibold">Students</TableHead>
                  <TableHead className="text-left font-semibold">Rating</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.map((teacher: User) => {
                  const stats = getTeacherStats(teacher.id);
                  const teacherName = teacher.firstName && teacher.lastName 
                    ? `${teacher.firstName} ${teacher.lastName}`
                    : teacher.email || 'Unknown Teacher';
                  
                  return (
                    <TableRow key={teacher.id} className="hover:bg-muted/20" data-testid={`row-teacher-${teacher.id}`}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={teacher.profileImageUrl} />
                            <AvatarFallback className="bg-secondary/10 text-secondary font-medium">
                              {getInitials(teacher.firstName, teacher.lastName, teacher.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{teacherName}</p>
                            <p className="text-sm text-muted-foreground">
                              Joined {new Date(teacher.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {teacher.email && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Mail className="w-3 h-3 text-muted-foreground" />
                              <span>{teacher.email}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{stats.coursesCount} courses</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Presentation className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{stats.classesCount} classes</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{stats.studentsCount} students</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-medium">4.8</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewProfile(teacher)}
                            data-testid={`button-view-${teacher.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid={`button-chat-${teacher.id}`}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                          {userRole === 'super_admin' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                data-testid={`button-edit-${teacher.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                data-testid={`button-delete-${teacher.id}`}
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
      )}

      {/* Teacher Profile Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="max-w-2xl glassmorphism neumorphism" data-testid="modal-teacher-profile">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-xl">Teacher Profile</DialogTitle>
          </DialogHeader>
          
          {selectedTeacher && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="flex items-start space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedTeacher.profileImageUrl} />
                  <AvatarFallback className="bg-secondary/10 text-secondary font-bold text-lg">
                    {getInitials(selectedTeacher.firstName, selectedTeacher.lastName, selectedTeacher.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {selectedTeacher.firstName && selectedTeacher.lastName 
                      ? `${selectedTeacher.firstName} ${selectedTeacher.lastName}`
                      : selectedTeacher.email || 'Unknown Teacher'
                    }
                  </h3>
                  <div className="space-y-1 mt-2">
                    {selectedTeacher.email && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span>{selectedTeacher.email}</span>
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className="mt-2 bg-secondary/10 text-secondary">
                    Teacher
                  </Badge>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <BookOpen className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Courses</p>
                  <p className="font-bold text-lg">{getTeacherStats(selectedTeacher.id).coursesCount}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <Presentation className="w-6 h-6 text-secondary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Classes</p>
                  <p className="font-bold text-lg">{getTeacherStats(selectedTeacher.id).classesCount}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Students</p>
                  <p className="font-bold text-lg">{getTeacherStats(selectedTeacher.id).studentsCount}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="font-bold text-lg">4.8</p>
                </div>
              </div>

              {/* Assigned Courses */}
              <div>
                <h4 className="font-semibold mb-3">Assigned Courses</h4>
                {courses?.filter((c: any) => c.teacherId === selectedTeacher.id).length > 0 ? (
                  <div className="space-y-2">
                    {courses?.filter((c: any) => c.teacherId === selectedTeacher.id).map((course: any) => (
                      <div key={course.id} className="p-3 border border-border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{course.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {course.enrolledCount || 0} students enrolled
                            </p>
                          </div>
                          <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                            {course.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No courses assigned yet</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" data-testid="button-chat-teacher">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                {userRole === 'super_admin' && (
                  <Button data-testid="button-edit-teacher">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Teacher
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
