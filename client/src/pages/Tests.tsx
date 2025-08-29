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
import CreateTestModal from "@/components/modals/CreateTestModal";
import { 
  Plus, 
  Search, 
  Clock, 
  FileText, 
  BarChart3,
  Eye,
  Edit,
  Trash2,
  Users,
  ClipboardCheck
} from "lucide-react";
import type { Test, Course } from "@shared/schema";

export default function Tests() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: tests, isLoading: testsLoading, error } = useQuery({
    queryKey: ["/api/tests"],
    retry: false,
  });

  const { data: courses } = useQuery({
    queryKey: ["/api/courses"],
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

  // Filter tests based on user role and filters
  const filteredTests = (tests || []).filter((test: Test) => {
    // Role-based filtering - for teachers, only show tests for their courses
    if (userRole === 'teacher') {
      const course = courses?.find((c: Course) => c.id === test.courseId);
      if (course && course.teacherId !== userId) {
        return false;
      }
    }
    
    const course = courses?.find((c: Course) => c.id === test.courseId);
    
    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course?.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCourse = courseFilter === "all" || test.courseId === courseFilter;
    const matchesStatus = statusFilter === "all" || test.status === statusFilter;
    
    return matchesSearch && matchesCourse && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6" data-testid="tests-content">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl">Test & Exam Management</h1>
          <p className="text-muted-foreground">
            {userRole === 'teacher' ? 'Create and manage assessments for your courses' : 'Oversee all tests and examinations'}
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2"
          data-testid="button-create-test"
        >
          <Plus className="w-4 h-4" />
          <span>Create Test</span>
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
                  placeholder="Search tests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-muted/50"
                  data-testid="input-search-tests"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="w-48 bg-muted/50" data-testid="select-course-filter">
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses
                    ?.filter((course: Course) => userRole === 'super_admin' || course.teacherId === userId)
                    .map((course: Course) => (
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
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {testsLoading ? (
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
      ) : filteredTests.length === 0 ? (
        <Card className="glassmorphism neumorphism">
          <CardContent className="p-12 text-center">
            <ClipboardCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No tests found</h3>
            <p className="text-muted-foreground mb-6">
              {tests?.length === 0 
                ? "No tests have been created yet. Create your first test to get started."
                : "No tests match your current filters. Try adjusting your search criteria."
              }
            </p>
            {tests?.length === 0 && (
              <Button onClick={() => setIsCreateModalOpen(true)} data-testid="button-create-first-test">
                <Plus className="w-4 h-4 mr-2" />
                Create First Test
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
                  <TableHead className="text-left font-semibold">Test</TableHead>
                  <TableHead className="text-left font-semibold">Course</TableHead>
                  <TableHead className="text-left font-semibold">Duration</TableHead>
                  <TableHead className="text-left font-semibold">Total Marks</TableHead>
                  <TableHead className="text-left font-semibold">Attempts</TableHead>
                  <TableHead className="text-left font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTests.map((test: Test) => {
                  const course = courses?.find((c: Course) => c.id === test.courseId);
                  
                  return (
                    <TableRow key={test.id} className="hover:bg-muted/20" data-testid={`row-test-${test.id}`}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                            <ClipboardCheck className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-semibold">{test.title}</p>
                            <p className="text-sm text-muted-foreground">
                              Passing: {test.passingMarks || 0} marks
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{course?.title || 'Unknown Course'}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{test.duration || 0} minutes</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">{test.totalMarks || 0}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{test.attemptCount || 0} attempts</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          test.status === 'published' ? 'default' : 
                          test.status === 'draft' ? 'secondary' : 'outline'
                        } className={
                          test.status === 'published' ? 'bg-green-100 text-green-800' :
                          test.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {test.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid={`button-view-${test.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid={`button-analytics-${test.id}`}
                          >
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid={`button-edit-${test.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid={`button-delete-${test.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glassmorphism neumorphism">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <ClipboardCheck className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Tests</p>
                <p className="font-bold text-xl">{filteredTests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism neumorphism">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="font-bold text-xl">
                  {filteredTests.filter(t => t.status === 'published').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism neumorphism">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Draft</p>
                <p className="font-bold text-xl">
                  {filteredTests.filter(t => t.status === 'draft').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism neumorphism">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Attempts</p>
                <p className="font-bold text-xl">
                  {filteredTests.reduce((sum, test) => sum + (test.attemptCount || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      <CreateTestModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}
