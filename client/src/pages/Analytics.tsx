import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  IndianRupee, 
  BookOpen, 
  Download,
  Calendar,
  ArrowUp,
  ArrowDown,
  Target,
  Eye,
  MessageCircle
} from "lucide-react";

export default function Analytics() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("6months");

  const { data: analytics, isLoading: analyticsLoading, error } = useQuery({
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

  // Prepare chart data
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const salesData = months.map((month, index) => ({
    month,
    revenue: analytics?.salesTrend?.[index] || 0,
    target: 800000,
  }));

  const studentData = months.map((month, index) => ({
    month,
    enrollments: analytics?.studentGrowth?.[index] || 0,
    completions: analytics?.courseCompletions?.[index] || 0,
  }));

  const conversionData = [
    { name: 'Page Views', value: 15420, color: '#2563EB' },
    { name: 'Course Views', value: 8750, color: '#14B8A6' },
    { name: 'Add to Cart', value: 3200, color: '#F59E0B' },
    { name: 'Purchases', value: 1840, color: '#10B981' },
  ];

  const coursePerformance = [
    { name: 'Advanced Physics', students: 234, revenue: 1169766, rating: 4.8 },
    { name: 'Organic Chemistry', students: 189, revenue: 661311, rating: 4.7 },
    { name: 'Advanced Calculus', students: 156, revenue: 467844, rating: 4.6 },
    { name: 'Quantum Mechanics', students: 98, revenue: 294020, rating: 4.9 },
  ];

  return (
    <div className="p-6 space-y-6" data-testid="analytics-content">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            {userRole === 'super_admin' 
              ? 'Comprehensive platform analytics and insights'
              : 'Sales performance and conversion metrics'
            }
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40" data-testid="select-time-range">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" data-testid="button-export-analytics">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {analyticsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="glassmorphism neumorphism">
              <CardContent className="p-6">
                <Skeleton className="w-full h-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glassmorphism neumorphism">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <IndianRupee className="w-6 h-6 text-primary" />
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  +28%
                </Badge>
              </div>
              <h3 className="font-semibold text-muted-foreground text-sm">Total Revenue</h3>
              <p className="font-heading font-bold text-3xl mt-1">
                ₹{(analytics?.totalRevenue || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-muted-foreground mt-2">vs last period</p>
            </CardContent>
          </Card>

          <Card className="glassmorphism neumorphism">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  +12%
                </Badge>
              </div>
              <h3 className="font-semibold text-muted-foreground text-sm">New Students</h3>
              <p className="font-heading font-bold text-3xl mt-1">
                {analytics?.studentGrowth?.reduce((a, b) => a + b, 0) || 0}
              </p>
              <p className="text-xs text-muted-foreground mt-2">last 6 months</p>
            </CardContent>
          </Card>

          <Card className="glassmorphism neumorphism">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  12.4%
                </Badge>
              </div>
              <h3 className="font-semibold text-muted-foreground text-sm">Conversion Rate</h3>
              <p className="font-heading font-bold text-3xl mt-1">12.4%</p>
              <p className="text-xs text-muted-foreground mt-2">from visitors to students</p>
            </CardContent>
          </Card>

          <Card className="glassmorphism neumorphism">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  +7%
                </Badge>
              </div>
              <h3 className="font-semibold text-muted-foreground text-sm">Course Completion</h3>
              <p className="font-heading font-bold text-3xl mt-1">87%</p>
              <p className="text-xs text-muted-foreground mt-2">average completion rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="sales" data-testid="tab-sales">Sales</TabsTrigger>
          <TabsTrigger value="students" data-testid="tab-students">Students</TabsTrigger>
          <TabsTrigger value="courses" data-testid="tab-courses">Courses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card className="glassmorphism neumorphism">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-heading font-semibold text-lg">Revenue Trend</h3>
                    <p className="text-muted-foreground text-sm">Monthly revenue growth</p>
                  </div>
                  <Button variant="ghost" size="sm" data-testid="button-export-revenue">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                      <YAxis stroke="var(--muted-foreground)" tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`} />
                      <Tooltip 
                        formatter={(value: number) => [`₹${(value / 100000).toFixed(1)}L`, 'Revenue']}
                        contentStyle={{
                          backgroundColor: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                        }}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} dot={{ fill: 'var(--primary)' }} />
                      <Line type="monotone" dataKey="target" stroke="var(--muted-foreground)" strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Conversion Funnel */}
            <Card className="glassmorphism neumorphism">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-heading font-semibold text-lg">Conversion Funnel</h3>
                    <p className="text-muted-foreground text-sm">Sales funnel performance</p>
                  </div>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={conversionData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {conversionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Count']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student Growth */}
          <Card className="glassmorphism neumorphism">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-heading font-semibold text-lg">Student Enrollment & Completion</h3>
                  <p className="text-muted-foreground text-sm">Track student progress over time</p>
                </div>
                <Button variant="ghost" size="sm" data-testid="button-export-students">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={studentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                    <YAxis stroke="var(--muted-foreground)" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="enrollments" fill="var(--secondary)" radius={[4, 4, 0, 0]} name="New Enrollments" />
                    <Bar dataKey="completions" fill="var(--chart-5)" radius={[4, 4, 0, 0]} name="Course Completions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="glassmorphism neumorphism">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Top Performing Courses</h3>
                <div className="space-y-4">
                  {coursePerformance.map((course, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="font-medium text-sm">{course.name}</p>
                        <p className="text-xs text-muted-foreground">{course.students} students</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">₹{course.revenue.toLocaleString('en-IN')}</p>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-muted-foreground">{course.rating}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-xs ${i < Math.floor(course.rating) ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism neumorphism lg:col-span-2">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Sales Performance Metrics</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Average Order Value</span>
                        <ArrowUp className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="font-bold text-xl">₹4,247</p>
                      <p className="text-xs text-green-600">+15% from last month</p>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Monthly Recurring Revenue</span>
                        <ArrowUp className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="font-bold text-xl">₹2,84,500</p>
                      <p className="text-xs text-green-600">+22% from last month</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Customer Lifetime Value</span>
                        <ArrowUp className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="font-bold text-xl">₹12,450</p>
                      <p className="text-xs text-green-600">+8% from last month</p>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Refund Rate</span>
                        <ArrowDown className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="font-bold text-xl">2.3%</p>
                      <p className="text-xs text-green-600">-0.5% from last month</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glassmorphism neumorphism">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Student Demographics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Age 18-24</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-muted rounded-full">
                        <div className="w-16 h-2 bg-primary rounded-full"></div>
                      </div>
                      <span className="text-sm text-muted-foreground">65%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Age 25-34</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-muted rounded-full">
                        <div className="w-8 h-2 bg-secondary rounded-full"></div>
                      </div>
                      <span className="text-sm text-muted-foreground">25%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Age 35+</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-muted rounded-full">
                        <div className="w-3 h-2 bg-purple-500 rounded-full"></div>
                      </div>
                      <span className="text-sm text-muted-foreground">10%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism neumorphism">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Student Engagement</h3>
                <div className="space-y-4">
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Eye className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Average Session Duration</p>
                        <p className="text-sm text-muted-foreground">42 minutes</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MessageCircle className="w-5 h-5 text-secondary" />
                      <div>
                        <p className="font-medium">Forum Participation</p>
                        <p className="text-sm text-muted-foreground">73% active users</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium">Assignment Completion</p>
                        <p className="text-sm text-muted-foreground">89% on time</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <Card className="glassmorphism neumorphism">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Course Performance Analysis</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left py-3 font-semibold text-sm">Course</th>
                      <th className="text-left py-3 font-semibold text-sm">Students</th>
                      <th className="text-left py-3 font-semibold text-sm">Completion Rate</th>
                      <th className="text-left py-3 font-semibold text-sm">Revenue</th>
                      <th className="text-left py-3 font-semibold text-sm">Rating</th>
                      <th className="text-left py-3 font-semibold text-sm">Growth</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {coursePerformance.map((course, index) => (
                      <tr key={index} className="hover:bg-muted/20">
                        <td className="py-4 pr-4">
                          <div>
                            <p className="font-medium">{course.name}</p>
                            <p className="text-sm text-muted-foreground">Published course</p>
                          </div>
                        </td>
                        <td className="py-4 pr-4">{course.students}</td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-2 bg-muted rounded-full">
                              <div className="h-2 bg-green-500 rounded-full" style={{ width: '87%' }}></div>
                            </div>
                            <span className="text-sm">87%</span>
                          </div>
                        </td>
                        <td className="py-4 pr-4 font-semibold text-green-600">
                          ₹{course.revenue.toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center space-x-1">
                            <span className="text-sm font-medium">{course.rating}</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={`text-xs ${i < Math.floor(course.rating) ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <ArrowUp className="w-3 h-3 mr-1" />
                            +{15 + index * 3}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
