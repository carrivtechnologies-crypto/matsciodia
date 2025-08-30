import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import SalesChart from "@/components/charts/SalesChart";
import StudentChart from "@/components/charts/StudentChart";
import CreateCourseModal from "@/components/modals/CreateCourseModal";
import CreateClassModal from "@/components/modals/CreateClassModal";
import CreateTestModal from "@/components/modals/CreateTestModal";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  University,
  Presentation,
  IndianRupee,
  BookOpen,
  Plus,
  Calendar,
  ClipboardCheck,
  Megaphone,
  TrendingUp,
  Users,
  Clock,
  GraduationCap,
} from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false);
  const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false);
  const [isCreateTestModalOpen, setIsCreateTestModalOpen] = useState(false);

  const { data: stats, isLoading: statsLoading, error } = useQuery<{
    totalStudents: number;
    totalTeachers: number;
    totalCourses: number;
    activeCourses: number;
    totalClasses: number;
    totalRevenue: number;
    salesTrend: number[];
    studentGrowth: number[];
    courseCompletions: number[];
  }>({
    queryKey: ["/api/analytics"],
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
  const userName = user?.firstName || user?.email || "Admin User";

  return (
    <div className="p-6 space-y-8" data-testid="dashboard-content">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="font-heading font-bold text-3xl mb-2">
            Welcome back, {userName}!
          </h1>
          <p className="text-white/80 text-lg mb-6">
            Here's what's happening with your EdTech platform today.
          </p>
          <div className="flex items-center space-x-4">
            <Button 
              variant="secondary" 
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border-0"
              onClick={() => window.location.href = '/analytics'}
              data-testid="button-view-analytics"
            >
              View Analytics
            </Button>
            {userRole === 'super_admin' && (
              <Button 
                variant="outline" 
                className="border-white/30 hover:bg-white/10 text-white border-2"
                onClick={() => setIsCreateCourseModalOpen(true)}
                data-testid="button-create-course"
              >
                Create Course
              </Button>
            )}
          </div>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute right-32 bottom-0 w-48 h-48 bg-white/5 rounded-full translate-y-24"></div>
      </div>

      {/* Stats Cards Grid */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="glassmorphism neumorphism">
              <CardContent className="p-6">
                <Skeleton className="w-12 h-12 mb-4" />
                <Skeleton className="w-20 h-4 mb-2" />
                <Skeleton className="w-16 h-8 mb-2" />
                <Skeleton className="w-24 h-3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Students Card */}
          <Card className="bg-card glassmorphism neumorphism hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1" 
                onClick={() => window.location.href = '/students'}
                data-testid="card-total-students">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <University className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm text-green-600 font-semibold">+12%</span>
              </div>
              <h3 className="font-semibold text-muted-foreground text-sm">Total Students</h3>
              <p className="font-heading font-bold text-3xl mt-1" data-testid="stat-total-students">
                {stats?.totalStudents?.toLocaleString() || '0'}
              </p>
              <p className="text-xs text-muted-foreground mt-2">+342 this month</p>
            </CardContent>
          </Card>

          {/* Total Teachers Card */}
          <Card className="bg-card glassmorphism neumorphism hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1" 
                onClick={() => window.location.href = '/teachers'}
                data-testid="card-total-teachers">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                  <Presentation className="w-6 h-6 text-secondary" />
                </div>
                <span className="text-sm text-green-600 font-semibold">+3%</span>
              </div>
              <h3 className="font-semibold text-muted-foreground text-sm">Total Teachers</h3>
              <p className="font-heading font-bold text-3xl mt-1" data-testid="stat-total-teachers">
                {stats?.totalTeachers || '0'}
              </p>
              <p className="text-xs text-muted-foreground mt-2">+2 this month</p>
            </CardContent>
          </Card>

          {/* Sales Revenue Card */}
          <Card className="bg-card glassmorphism neumorphism hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1" 
                onClick={() => window.location.href = '/analytics'}
                data-testid="card-sales-revenue">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <IndianRupee className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-sm text-green-600 font-semibold">+28%</span>
              </div>
              <h3 className="font-semibold text-muted-foreground text-sm">Sales Revenue</h3>
              <p className="font-heading font-bold text-3xl mt-1" data-testid="stat-sales-revenue">
                ₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-muted-foreground mt-2">+₹1,94,500 this month</p>
            </CardContent>
          </Card>

          {/* Active Courses Card */}
          <Card className="bg-card glassmorphism neumorphism hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1" 
                onClick={() => window.location.href = '/courses'}
                data-testid="card-active-courses">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-sm text-green-600 font-semibold">+7%</span>
              </div>
              <h3 className="font-semibold text-muted-foreground text-sm">Active Courses</h3>
              <p className="font-heading font-bold text-3xl mt-1" data-testid="stat-active-courses">
                {stats?.activeCourses || '0'}
              </p>
              <p className="text-xs text-muted-foreground mt-2">+2 this month</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart data={stats?.salesTrend || []} />
        <StudentChart 
          enrollments={stats?.studentGrowth || []} 
          completions={stats?.courseCompletions || []} 
        />
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-card glassmorphism rounded-2xl p-6 neumorphism">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading font-semibold text-lg">Recent Activity</h3>
            <Button variant="ghost" size="sm" data-testid="button-view-all-activity">
              View All
            </Button>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-muted/30 transition-colors">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">New student enrolled in "Advanced Physics"</p>
                <p className="text-muted-foreground text-xs">Priya Sharma joined the course • 2 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-muted/30 transition-colors">
              <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Presentation className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Class completed: "Organic Chemistry Lab"</p>
                <p className="text-muted-foreground text-xs">Dr. Anil Kumar completed the session • 15 minutes ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-muted/30 transition-colors">
              <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                <IndianRupee className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Payment received: ₹4,999</p>
                <p className="text-muted-foreground text-xs">Course purchase by Rahul Mehta • 32 minutes ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-muted/30 transition-colors">
              <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                <ClipboardCheck className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Test submitted: "Mathematics Quiz #3"</p>
                <p className="text-muted-foreground text-xs">24 students completed the test • 1 hour ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card glassmorphism rounded-2xl p-6 neumorphism">
          <h3 className="font-heading font-semibold text-lg mb-6">Quick Actions</h3>
          <div className="space-y-3">
            {userRole === 'super_admin' && (
              <>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-auto p-4 border-2 border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 group"
                  onClick={() => setIsCreateCourseModalOpen(true)}
                  data-testid="button-quick-create-course"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors mr-3">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm">Create Course</p>
                    <p className="text-muted-foreground text-xs">Add new course content</p>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-auto p-4 border-2 border-dashed border-secondary/30 hover:border-secondary/50 hover:bg-secondary/5 group"
                  onClick={() => setIsCreateClassModalOpen(true)}
                  data-testid="button-quick-schedule-class"
                >
                  <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center group-hover:bg-secondary/20 transition-colors mr-3">
                    <Calendar className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm">Schedule Class</p>
                    <p className="text-muted-foreground text-xs">Plan new session</p>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-auto p-4 border-2 border-dashed border-purple-300 hover:border-purple-400 hover:bg-purple-50 group"
                  onClick={() => setIsCreateTestModalOpen(true)}
                  data-testid="button-quick-create-test"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors mr-3">
                    <ClipboardCheck className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm">Create Test</p>
                    <p className="text-muted-foreground text-xs">Design assessment</p>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full justify-start h-auto p-4 border-2 border-dashed border-orange-300 hover:border-orange-400 hover:bg-orange-50 group"
                  onClick={() => window.location.href = '/campaigns'}
                  data-testid="button-quick-launch-campaign"
                >
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors mr-3">
                    <Megaphone className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm">Launch Campaign</p>
                    <p className="text-muted-foreground text-xs">Marketing outreach</p>
                  </div>
                </Button>
              </>
            )}
            
            {userRole === 'teacher' && (
              <>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-auto p-4 border-2 border-dashed border-secondary/30 hover:border-secondary/50 hover:bg-secondary/5 group"
                  onClick={() => setIsCreateClassModalOpen(true)}
                  data-testid="button-quick-schedule-class"
                >
                  <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center group-hover:bg-secondary/20 transition-colors mr-3">
                    <Calendar className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm">Schedule Class</p>
                    <p className="text-muted-foreground text-xs">Plan new session</p>
                  </div>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-card glassmorphism rounded-2xl p-6 neumorphism">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading font-semibold text-lg">Upcoming Events</h3>
          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/timetable'} data-testid="button-view-calendar">
            View Calendar
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border border-border rounded-xl hover:bg-muted/30 transition-colors">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Presentation className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Advanced Physics Lab</p>
                <p className="text-muted-foreground text-xs">Dr. Anil Kumar</p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>Today, 2:30 PM</span>
              </p>
              <p className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>28 students</span>
              </p>
            </div>
          </div>
          
          <div className="p-4 border border-border rounded-xl hover:bg-muted/30 transition-colors">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                <ClipboardCheck className="w-4 h-4 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Chemistry Quiz</p>
                <p className="text-muted-foreground text-xs">Prof. Meera Singh</p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>Tomorrow, 10:00 AM</span>
              </p>
              <p className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>45 minutes</span>
              </p>
            </div>
          </div>

          <div className="p-4 border border-border rounded-xl hover:bg-muted/30 transition-colors">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Course Launch Event</p>
                <p className="text-muted-foreground text-xs">Quantum Mechanics</p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>Dec 15, 11:00 AM</span>
              </p>
              <p className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>120 registered</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {userRole === 'super_admin' && (
        <>
          <CreateCourseModal 
            isOpen={isCreateCourseModalOpen} 
            onClose={() => setIsCreateCourseModalOpen(false)} 
          />
          <CreateClassModal 
            isOpen={isCreateClassModalOpen} 
            onClose={() => setIsCreateClassModalOpen(false)} 
          />
          <CreateTestModal 
            isOpen={isCreateTestModalOpen} 
            onClose={() => setIsCreateTestModalOpen(false)} 
          />
        </>
      )}
      
      {userRole === 'teacher' && (
        <>
          <CreateClassModal 
            isOpen={isCreateClassModalOpen} 
            onClose={() => setIsCreateClassModalOpen(false)} 
          />
          <CreateTestModal 
            isOpen={isCreateTestModalOpen} 
            onClose={() => setIsCreateTestModalOpen(false)} 
          />
        </>
      )}
    </div>
  );
}
