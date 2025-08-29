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
  GraduationCap, 
  Mail, 
  Phone, 
  BookOpen,
  IndianRupee,
  Eye,
  Edit,
  Trash2,
  Upload,
  MessageCircle
} from "lucide-react";
import type { Student } from "@shared/schema";

export default function Students() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const { data: students, isLoading: studentsLoading, error } = useQuery({
    queryKey: ["/api/students"],
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

  // Filter students based on search and status
  const filteredStudents = (students || []).filter((student: Student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.phone?.includes(searchQuery);
    
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewProfile = (student: Student) => {
    setSelectedStudent(student);
    setIsProfileModalOpen(true);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="p-6 space-y-6" data-testid="students-content">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl">Student Management</h1>
          <p className="text-muted-foreground">Manage student enrollments and track their progress</p>
        </div>
        {userRole === 'super_admin' && (
          <div className="flex items-center space-x-2">
            <Button variant="outline" data-testid="button-bulk-upload">
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
            </Button>
            <Button data-testid="button-add-student">
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glassmorphism neumorphism">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="font-bold text-xl">{students?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism neumorphism">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="font-bold text-xl">
                  {students?.filter((s: Student) => s.status === 'active').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism neumorphism">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="font-bold text-xl">
                  ₹{students?.reduce((sum, s) => sum + parseFloat(s.totalPurchases || '0'), 0).toLocaleString('en-IN') || '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism neumorphism">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Courses</p>
                <p className="font-bold text-xl">
                  {students?.length > 0 
                    ? Math.round(students.reduce((sum, s) => sum + (s.enrolledCourses?.length || 0), 0) / students.length)
                    : 0
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="glassmorphism neumorphism">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80 bg-muted/50"
                  data-testid="input-search-students"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 bg-muted/50" data-testid="select-status-filter">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {studentsLoading ? (
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
      ) : filteredStudents.length === 0 ? (
        <Card className="glassmorphism neumorphism">
          <CardContent className="p-12 text-center">
            <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No students found</h3>
            <p className="text-muted-foreground mb-6">
              {students?.length === 0 
                ? "No students have been added yet. Add your first student to get started."
                : "No students match your current filters. Try adjusting your search criteria."
              }
            </p>
            {userRole === 'super_admin' && students?.length === 0 && (
              <Button data-testid="button-add-first-student">
                <Plus className="w-4 h-4 mr-2" />
                Add First Student
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
                  <TableHead className="text-left font-semibold">Student</TableHead>
                  <TableHead className="text-left font-semibold">Contact</TableHead>
                  <TableHead className="text-left font-semibold">Enrolled Courses</TableHead>
                  <TableHead className="text-left font-semibold">Total Purchases</TableHead>
                  <TableHead className="text-left font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student: Student) => (
                  <TableRow key={student.id} className="hover:bg-muted/20" data-testid={`row-student-${student.id}`}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {getInitials(student.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{student.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Joined {new Date(student.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {student.email && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            <span>{student.email}</span>
                          </div>
                        )}
                        {student.phone && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            <span>{student.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{student.enrolledCourses?.length || 0} courses</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <IndianRupee className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-green-600">
                          ₹{parseFloat(student.totalPurchases || '0').toLocaleString('en-IN')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        student.status === 'active' ? 'default' : 
                        student.status === 'inactive' ? 'secondary' : 'outline'
                      } className={
                        student.status === 'active' ? 'bg-green-100 text-green-800' :
                        student.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewProfile(student)}
                          data-testid={`button-view-${student.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          data-testid={`button-chat-${student.id}`}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                        {userRole === 'super_admin' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              data-testid={`button-edit-${student.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              data-testid={`button-delete-${student.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Student Profile Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="max-w-2xl glassmorphism neumorphism" data-testid="modal-student-profile">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-xl">Student Profile</DialogTitle>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="flex items-start space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                    {getInitials(selectedStudent.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedStudent.name}</h3>
                  <div className="space-y-1 mt-2">
                    {selectedStudent.email && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span>{selectedStudent.email}</span>
                      </div>
                    )}
                    {selectedStudent.phone && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{selectedStudent.phone}</span>
                      </div>
                    )}
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`mt-2 ${
                      selectedStudent.status === 'active' ? 'bg-green-100 text-green-800' :
                      selectedStudent.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}
                  >
                    {selectedStudent.status}
                  </Badge>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <BookOpen className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Enrolled Courses</p>
                  <p className="font-bold text-lg">{selectedStudent.enrolledCourses?.length || 0}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <IndianRupee className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Total Purchases</p>
                  <p className="font-bold text-lg">
                    ₹{parseFloat(selectedStudent.totalPurchases || '0').toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <GraduationCap className="w-6 h-6 text-secondary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-bold text-lg">
                    {new Date(selectedStudent.createdAt).getFullYear()}
                  </p>
                </div>
              </div>

              {/* Enrolled Courses */}
              <div>
                <h4 className="font-semibold mb-3">Enrolled Courses</h4>
                {selectedStudent.enrolledCourses && selectedStudent.enrolledCourses.length > 0 ? (
                  <div className="space-y-2">
                    {selectedStudent.enrolledCourses.map((courseId, index) => (
                      <div key={index} className="p-3 border border-border rounded-lg">
                        <p className="font-medium">Course ID: {courseId}</p>
                        <p className="text-sm text-muted-foreground">Course details would be loaded here</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No courses enrolled yet</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" data-testid="button-chat-student">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                {userRole === 'super_admin' && (
                  <Button data-testid="button-edit-student">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Student
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
