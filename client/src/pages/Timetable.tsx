import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  Presentation,
  Users,
  BookOpen,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck
} from "lucide-react";
import type { Class, Course, Test } from "@shared/schema";

interface CalendarEvent {
  id: string;
  title: string;
  type: 'class' | 'test' | 'exam';
  startTime: Date;
  endTime: Date;
  courseId?: string;
  teacherId?: string;
  status: string;
  attendees?: number;
}

export default function Timetable() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [teacherFilter, setTeacherFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");

  const { data: classes, isLoading: classesLoading, error } = useQuery({
    queryKey: ["/api/classes"],
    retry: false,
  });

  const { data: tests } = useQuery({
    queryKey: ["/api/tests"],
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

  // Convert classes and tests to calendar events
  const calendarEvents: CalendarEvent[] = [
    ...(classes || [])
      .filter((classItem: Class) => {
        if (userRole === 'teacher' && classItem.teacherId !== userId) return false;
        if (teacherFilter !== "all" && classItem.teacherId !== teacherFilter) return false;
        if (courseFilter !== "all" && classItem.courseId !== courseFilter) return false;
        return true;
      })
      .map((classItem: Class) => ({
        id: classItem.id,
        title: classItem.title,
        type: 'class' as const,
        startTime: classItem.scheduledAt ? new Date(classItem.scheduledAt) : new Date(),
        endTime: classItem.scheduledAt && classItem.duration 
          ? new Date(new Date(classItem.scheduledAt).getTime() + classItem.duration * 60000)
          : new Date(),
        courseId: classItem.courseId,
        teacherId: classItem.teacherId,
        status: classItem.status || 'scheduled',
        attendees: classItem.attendanceCount || 0,
      })),
    ...(tests || [])
      .filter((test: Test) => {
        const course = courses?.find((c: Course) => c.id === test.courseId);
        if (userRole === 'teacher' && course?.teacherId !== userId) return false;
        if (courseFilter !== "all" && test.courseId !== courseFilter) return false;
        return true;
      })
      .map((test: Test) => ({
        id: test.id,
        title: test.title,
        type: 'test' as const,
        startTime: new Date(), // Tests don't have scheduled time in schema
        endTime: new Date(new Date().getTime() + (test.duration || 60) * 60000),
        courseId: test.courseId,
        teacherId: courses?.find((c: Course) => c.id === test.courseId)?.teacherId,
        status: test.status || 'draft',
        attendees: test.attemptCount || 0,
      })),
  ];

  // Get the start of the week
  const getWeekStart = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day;
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return start;
  };

  // Get week days
  const getWeekDays = (startDate: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Get events for a specific day
  const getEventsForDay = (date: Date) => {
    return calendarEvents.filter(event => 
      event.startTime.toDateString() === date.toDateString()
    );
  };

  // Get hours array for week view
  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

  const weekStart = getWeekStart(currentDate);
  const weekDays = getWeekDays(weekStart);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const getEventColor = (type: string, status: string) => {
    if (type === 'class') {
      return status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
             status === 'scheduled' ? 'bg-blue-100 text-blue-800 border-blue-200' :
             'bg-gray-100 text-gray-800 border-gray-200';
    } else if (type === 'test') {
      return status === 'published' ? 'bg-purple-100 text-purple-800 border-purple-200' :
             'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="p-6 space-y-6" data-testid="timetable-content">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl">Timetable & Schedule</h1>
          <p className="text-muted-foreground">
            {userRole === 'teacher' ? 'Manage your class schedule and upcoming events' : 'Overview of all classes and events'}
          </p>
        </div>
        <Button data-testid="button-add-event">
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glassmorphism neumorphism">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="font-bold text-xl">
                  {weekDays.reduce((count, day) => count + getEventsForDay(day).length, 0)} events
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism neumorphism">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Presentation className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Classes Today</p>
                <p className="font-bold text-xl">
                  {getEventsForDay(new Date()).filter(e => e.type === 'class').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism neumorphism">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <ClipboardCheck className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tests Today</p>
                <p className="font-bold text-xl">
                  {getEventsForDay(new Date()).filter(e => e.type === 'test').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism neumorphism">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Attendees</p>
                <p className="font-bold text-xl">
                  {getEventsForDay(new Date()).reduce((sum, e) => sum + (e.attendees || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glassmorphism neumorphism">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-muted-foreground" />
            
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
        </CardContent>
      </Card>

      {/* Calendar View */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "week" | "month")} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList data-testid="tabs-view-mode">
            <TabsTrigger value="week">Week View</TabsTrigger>
            <TabsTrigger value="month">Month View</TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => viewMode === 'week' ? navigateWeek('prev') : navigateMonth('prev')}
                data-testid="button-previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="font-semibold text-lg min-w-[200px] text-center">
                {viewMode === 'week' 
                  ? `${weekStart.toLocaleDateString()} - ${new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString()}`
                  : currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                }
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => viewMode === 'week' ? navigateWeek('next') : navigateMonth('next')}
                data-testid="button-next"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentDate(new Date())}
              data-testid="button-today"
            >
              Today
            </Button>
          </div>
        </div>

        <TabsContent value="week" className="space-y-0">
          <Card className="glassmorphism neumorphism overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Week Header */}
                <div className="grid grid-cols-8 border-b border-border bg-muted/30">
                  <div className="p-4 font-semibold text-sm">Time</div>
                  {weekDays.map((day, index) => (
                    <div key={index} className="p-4 text-center border-l border-border">
                      <div className="font-semibold text-sm">
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className={`text-lg font-bold mt-1 ${
                        day.toDateString() === new Date().toDateString() 
                          ? 'text-primary' 
                          : ''
                      }`}>
                        {day.getDate()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Time Grid */}
                <div className="grid grid-cols-8">
                  {hours.map((hour) => (
                    <div key={hour} className="contents">
                      <div className="p-4 text-sm text-muted-foreground font-medium border-b border-border">
                        {hour}:00
                      </div>
                      {weekDays.map((day, dayIndex) => {
                        const dayEvents = getEventsForDay(day).filter(event => 
                          event.startTime.getHours() === hour
                        );
                        
                        return (
                          <div key={`${hour}-${dayIndex}`} className="p-2 h-20 border-l border-b border-border relative">
                            {dayEvents.map((event, eventIndex) => (
                              <div
                                key={event.id}
                                className={`absolute left-1 right-1 top-1 bottom-1 p-2 rounded border text-xs ${getEventColor(event.type, event.status)} cursor-pointer hover:shadow-md transition-shadow z-10`}
                                style={{ 
                                  marginTop: `${eventIndex * 2}px`,
                                  height: 'calc(100% - 4px)'
                                }}
                                onClick={() => toast({
                                  title: event.title,
                                  description: `${event.type.charAt(0).toUpperCase() + event.type.slice(1)} scheduled for ${event.startTime.toLocaleTimeString()}`,
                                })}
                                data-testid={`event-${event.id}`}
                              >
                                <div className="font-medium truncate">{event.title}</div>
                                <div className="flex items-center space-x-1 mt-1">
                                  {event.type === 'class' && <Presentation className="w-3 h-3" />}
                                  {event.type === 'test' && <ClipboardCheck className="w-3 h-3" />}
                                  <Clock className="w-3 h-3" />
                                  <span>{event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="month" className="space-y-0">
          <Card className="glassmorphism neumorphism">
            <CardContent className="p-6">
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Month View Coming Soon</h3>
                <p className="text-muted-foreground">
                  Interactive monthly calendar view will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upcoming Events */}
      <Card className="glassmorphism neumorphism">
        <CardContent className="p-6">
          <h3 className="font-heading font-semibold text-lg mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {calendarEvents
              .filter(event => event.startTime >= new Date())
              .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
              .slice(0, 5)
              .map((event) => {
                const course = courses?.find((c: Course) => c.id === event.courseId);
                const teacher = teachers?.find((t: any) => t.id === event.teacherId);
                
                return (
                  <div key={event.id} className="flex items-center space-x-4 p-4 rounded-xl hover:bg-muted/30 transition-colors">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      event.type === 'class' ? 'bg-primary/10' : 'bg-purple-500/10'
                    }`}>
                      {event.type === 'class' ? (
                        <Presentation className={`w-6 h-6 ${event.type === 'class' ? 'text-primary' : 'text-purple-600'}`} />
                      ) : (
                        <ClipboardCheck className="w-6 h-6 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{event.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <span>{course?.title || 'Unknown Course'}</span>
                        <span>{event.startTime.toLocaleDateString()} at {event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {teacher && <span>by {teacher.firstName} {teacher.lastName}</span>}
                      </div>
                    </div>
                    <Badge variant={event.status === 'completed' ? 'default' : 'secondary'}>
                      {event.status}
                    </Badge>
                  </div>
                );
              })}
            
            {calendarEvents.filter(event => event.startTime >= new Date()).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No upcoming events scheduled</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
