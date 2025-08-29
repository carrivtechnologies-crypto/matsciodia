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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Search, 
  FolderOpen, 
  FileText, 
  Download,
  Eye,
  Trash2,
  Upload,
  File,
  Video,
  Image,
  Archive,
  Grid,
  List
} from "lucide-react";
import type { File as FileType, Course, Class } from "@shared/schema";

export default function Files() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const { data: files, isLoading: filesLoading, error } = useQuery({
    queryKey: ["/api/files"],
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

  // Filter files based on search, type, and course
  const filteredFiles = (files || []).filter((file: FileType) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || file.type === typeFilter;
    const matchesCourse = courseFilter === "all" || file.courseId === courseFilter;
    
    // Role-based filtering for teachers
    if (userRole === 'teacher') {
      const course = courses?.find((c: Course) => c.id === file.courseId);
      if (course && course.teacherId !== user?.id) {
        return false;
      }
    }
    
    return matchesSearch && matchesType && matchesCourse;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-8 h-8 text-blue-500" />;
      case 'ppt':
      case 'pptx':
        return <FileText className="w-8 h-8 text-orange-500" />;
      case 'video':
      case 'mp4':
      case 'avi':
        return <Video className="w-8 h-8 text-purple-500" />;
      case 'jpg':
      case 'png':
      case 'jpeg':
        return <Image className="w-8 h-8 text-green-500" />;
      case 'zip':
      case 'rar':
        return <Archive className="w-8 h-8 text-yellow-500" />;
      default:
        return <File className="w-8 h-8 text-muted-foreground" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Implement actual file upload
      toast({
        title: "File Upload",
        description: `File "${file.name}" selected for upload. Upload functionality to be implemented.`,
      });
    }
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleBulkDelete = () => {
    if (selectedFiles.length > 0) {
      toast({
        title: "Bulk Delete",
        description: `${selectedFiles.length} files selected for deletion. This functionality will be implemented.`,
      });
      setSelectedFiles([]);
    }
  };

  return (
    <div className="p-6 space-y-6" data-testid="files-content">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl">Files & Materials</h1>
          <p className="text-muted-foreground">
            {userRole === 'teacher' ? 'Manage your course materials and resources' : 'Oversee all files and learning materials'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {selectedFiles.length > 0 && (
            <Button 
              variant="outline" 
              onClick={handleBulkDelete}
              data-testid="button-bulk-delete"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete ({selectedFiles.length})
            </Button>
          )}
          <Button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center space-x-2"
            data-testid="button-upload-file"
          >
            <Upload className="w-4 h-4" />
            <span>Upload File</span>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glassmorphism neumorphism">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Files</p>
                <p className="font-bold text-xl">{filteredFiles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism neumorphism">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Documents</p>
                <p className="font-bold text-xl">
                  {filteredFiles.filter(f => ['pdf', 'doc', 'docx', 'ppt', 'pptx'].includes(f.type || '')).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism neumorphism">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Videos</p>
                <p className="font-bold text-xl">
                  {filteredFiles.filter(f => ['video', 'mp4', 'avi'].includes(f.type || '')).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism neumorphism">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Archive className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Size</p>
                <p className="font-bold text-xl">
                  {formatFileSize(filteredFiles.reduce((sum, f) => sum + (f.size || 0), 0))}
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
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-muted/50"
                  data-testid="input-search-files"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32 bg-muted/50" data-testid="select-type-filter">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="doc">Documents</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                </SelectContent>
              </Select>

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
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                data-testid="button-list-view"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {filesLoading ? (
        <Card className="glassmorphism neumorphism">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="w-full h-48 rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : filteredFiles.length === 0 ? (
        <Card className="glassmorphism neumorphism">
          <CardContent className="p-12 text-center">
            <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No files found</h3>
            <p className="text-muted-foreground mb-6">
              {files?.length === 0 
                ? "No files have been uploaded yet. Upload your first file to get started."
                : "No files match your current filters. Try adjusting your search criteria."
              }
            </p>
            {files?.length === 0 && (
              <Button onClick={() => setIsUploadModalOpen(true)} data-testid="button-upload-first-file">
                <Upload className="w-4 h-4 mr-2" />
                Upload First File
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFiles.map((file: FileType) => {
            const course = courses?.find((c: Course) => c.id === file.courseId);
            const classData = classes?.find((c: Class) => c.id === file.classId);
            const isSelected = selectedFiles.includes(file.id);
            
            return (
              <Card 
                key={file.id} 
                className={`glassmorphism neumorphism hover:shadow-lg transition-all cursor-pointer ${
                  isSelected ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => toggleFileSelection(file.id)}
                data-testid={`card-file-${file.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-muted/30 rounded-xl flex items-center justify-center">
                      {getFileIcon(file.type || '')}
                    </div>
                    
                    <div className="text-center w-full">
                      <h3 className="font-semibold text-sm line-clamp-2 mb-1">{file.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {file.size ? formatFileSize(file.size) : 'Unknown size'}
                      </p>
                    </div>

                    <div className="w-full space-y-2">
                      {course && (
                        <Badge variant="outline" className="w-full justify-center text-xs">
                          {course.title}
                        </Badge>
                      )}
                      {classData && (
                        <Badge variant="secondary" className="w-full justify-center text-xs">
                          {classData.title}
                        </Badge>
                      )}
                      <Badge variant="outline" className="w-full justify-center text-xs">
                        {file.type?.toUpperCase() || 'Unknown'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-center space-x-2 w-full">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast({
                            title: "File Preview",
                            description: `Preview for "${file.name}" will be implemented.`,
                          });
                        }}
                        data-testid={`button-preview-${file.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(file.url, '_blank');
                        }}
                        data-testid={`button-download-${file.id}`}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      {(userRole === 'super_admin' || file.uploadedBy === user?.id) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast({
                              title: "Delete File",
                              description: `Delete functionality for "${file.name}" will be implemented.`,
                            });
                          }}
                          data-testid={`button-delete-${file.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="glassmorphism neumorphism overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30 border-b border-border">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-sm">
                      <input 
                        type="checkbox" 
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFiles(filteredFiles.map(f => f.id));
                          } else {
                            setSelectedFiles([]);
                          }
                        }}
                        checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                        data-testid="checkbox-select-all"
                      />
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-sm">File</th>
                    <th className="text-left py-4 px-6 font-semibold text-sm">Type</th>
                    <th className="text-left py-4 px-6 font-semibold text-sm">Size</th>
                    <th className="text-left py-4 px-6 font-semibold text-sm">Course</th>
                    <th className="text-left py-4 px-6 font-semibold text-sm">Uploaded</th>
                    <th className="text-right py-4 px-6 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredFiles.map((file: FileType) => {
                    const course = courses?.find((c: Course) => c.id === file.courseId);
                    const isSelected = selectedFiles.includes(file.id);
                    
                    return (
                      <tr key={file.id} className="hover:bg-muted/20 transition-colors" data-testid={`row-file-${file.id}`}>
                        <td className="py-4 px-6">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => toggleFileSelection(file.id)}
                            data-testid={`checkbox-${file.id}`}
                          />
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 flex items-center justify-center">
                              {getFileIcon(file.type || '')}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(file.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant="outline">{file.type?.toUpperCase() || 'Unknown'}</Badge>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm">{file.size ? formatFileSize(file.size) : 'Unknown'}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm">{course?.title || 'Unlinked'}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm">{new Date(file.createdAt).toLocaleDateString()}</span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(file.url, '_blank')}
                              data-testid={`button-view-${file.id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(file.url, '_blank')}
                              data-testid={`button-download-${file.id}`}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            {(userRole === 'super_admin' || file.uploadedBy === user?.id) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                data-testid={`button-delete-${file.id}`}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="max-w-2xl glassmorphism neumorphism" data-testid="modal-upload-file">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-2xl">Upload File</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="font-medium mb-2">Click to upload or drag and drop</p>
              <p className="text-muted-foreground text-sm mb-4">
                Support for PDF, DOC, PPT, Video files up to 50MB
              </p>
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.avi,.jpg,.png,.jpeg"
                className="hidden"
                id="file-upload"
                data-testid="input-file-upload"
              />
              <Button 
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
                data-testid="button-browse-files"
              >
                Browse Files
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Link to Course (Optional)</label>
                <Select>
                  <SelectTrigger data-testid="select-link-course">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses?.map((course: Course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Link to Class (Optional)</label>
                <Select>
                  <SelectTrigger data-testid="select-link-class">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes?.map((classItem: Class) => (
                      <SelectItem key={classItem.id} value={classItem.id}>
                        {classItem.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-border">
              <Button 
                variant="outline" 
                onClick={() => setIsUploadModalOpen(false)}
                data-testid="button-cancel-upload"
              >
                Cancel
              </Button>
              <Button data-testid="button-upload">
                Upload File
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
