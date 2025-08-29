// Mock data for realistic demonstration purposes
// This file contains sample data to populate the dashboard with realistic content

export interface MockCourse {
  id: string;
  title: string;
  description: string;
  teacher: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  enrolled: number;
  sales: number;
  status: 'published' | 'draft' | 'archived';
  rating: number;
  duration: number; // in weeks
  tags: string[];
  imageUrl: string;
}

export interface MockClass {
  id: string;
  title: string;
  courseTitle: string;
  teacher: string;
  scheduledAt: Date;
  duration: number; // in minutes
  attendees: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  materialsUrl?: string;
}

export interface MockTest {
  id: string;
  title: string;
  courseTitle: string;
  duration: number; // in minutes
  totalMarks: number;
  passingMarks: number;
  attempts: number;
  status: 'published' | 'draft' | 'archived';
}

export interface MockStudent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  enrolledCourses: number;
  totalPurchases: number;
  status: 'active' | 'inactive' | 'suspended';
  joinDate: Date;
  avatar?: string;
}

export interface MockTeacher {
  id: string;
  name: string;
  email: string;
  courses: number;
  students: number;
  rating: number;
  joinDate: Date;
  avatar?: string;
}

export interface MockAnalytics {
  totalStudents: number;
  totalTeachers: number;
  totalRevenue: number;
  activeCourses: number;
  totalClasses: number;
  salesTrend: number[];
  studentGrowth: number[];
  courseCompletions: number[];
  monthlyLabels: string[];
}

// Mock Courses Data
export const mockCourses: MockCourse[] = [
  {
    id: '1',
    title: 'Advanced Physics',
    description: 'Comprehensive physics course for JEE preparation covering mechanics, thermodynamics, and electromagnetism.',
    teacher: 'Dr. Anil Kumar',
    price: 4999,
    originalPrice: 6999,
    discount: 28,
    enrolled: 234,
    sales: 1169766,
    status: 'published',
    rating: 4.8,
    duration: 16,
    tags: ['Physics', 'JEE', 'Advanced'],
    imageUrl: 'https://images.unsplash.com/photo-1562813733-b31f71025d54?w=400&h=200&fit=crop'
  },
  {
    id: '2',
    title: 'Organic Chemistry',
    description: 'Complete organic chemistry for NEET aspirants with reaction mechanisms and synthesis.',
    teacher: 'Prof. Meera Singh',
    price: 3499,
    originalPrice: 4999,
    discount: 30,
    enrolled: 189,
    sales: 661311,
    status: 'published',
    rating: 4.7,
    duration: 12,
    tags: ['Chemistry', 'NEET', 'Organic'],
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=200&fit=crop'
  },
  {
    id: '3',
    title: 'Advanced Calculus',
    description: 'Differential and integral calculus mastery for engineering students.',
    teacher: 'Dr. Rajesh Gupta',
    price: 2999,
    enrolled: 156,
    sales: 467844,
    status: 'draft',
    rating: 4.6,
    duration: 10,
    tags: ['Mathematics', 'Calculus', 'Engineering'],
    imageUrl: 'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=400&h=200&fit=crop'
  },
  {
    id: '4',
    title: 'Quantum Mechanics',
    description: 'Introduction to quantum mechanics principles and applications.',
    teacher: 'Dr. Anil Kumar',
    price: 5499,
    enrolled: 98,
    sales: 294020,
    status: 'published',
    rating: 4.9,
    duration: 14,
    tags: ['Physics', 'Quantum', 'Advanced'],
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=200&fit=crop'
  }
];

// Mock Classes Data
export const mockClasses: MockClass[] = [
  {
    id: '1',
    title: 'Advanced Physics Lab Session',
    courseTitle: 'Advanced Physics',
    teacher: 'Dr. Anil Kumar',
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    duration: 120,
    attendees: 28,
    status: 'scheduled',
    materialsUrl: '/materials/physics-lab-1.pdf'
  },
  {
    id: '2',
    title: 'Organic Chemistry Problem Solving',
    courseTitle: 'Organic Chemistry',
    teacher: 'Prof. Meera Singh',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    duration: 90,
    attendees: 22,
    status: 'scheduled'
  },
  {
    id: '3',
    title: 'Calculus Integration Techniques',
    courseTitle: 'Advanced Calculus',
    teacher: 'Dr. Rajesh Gupta',
    scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    duration: 75,
    attendees: 19,
    status: 'completed'
  }
];

// Mock Tests Data
export const mockTests: MockTest[] = [
  {
    id: '1',
    title: 'Physics Chapter 1 Quiz',
    courseTitle: 'Advanced Physics',
    duration: 45,
    totalMarks: 50,
    passingMarks: 20,
    attempts: 156,
    status: 'published'
  },
  {
    id: '2',
    title: 'Organic Reactions Test',
    courseTitle: 'Organic Chemistry',
    duration: 60,
    totalMarks: 75,
    passingMarks: 30,
    attempts: 89,
    status: 'published'
  },
  {
    id: '3',
    title: 'Calculus Mid-term Exam',
    courseTitle: 'Advanced Calculus',
    duration: 120,
    totalMarks: 100,
    passingMarks: 40,
    attempts: 34,
    status: 'draft'
  }
];

// Mock Students Data
export const mockStudents: MockStudent[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    email: 'priya.sharma@student.edu',
    phone: '+91 9876543210',
    enrolledCourses: 3,
    totalPurchases: 12497,
    status: 'active',
    joinDate: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Rahul Mehta',
    email: 'rahul.mehta@student.edu',
    phone: '+91 9876543211',
    enrolledCourses: 2,
    totalPurchases: 7998,
    status: 'active',
    joinDate: new Date('2024-02-20')
  },
  {
    id: '3',
    name: 'Anita Desai',
    email: 'anita.desai@student.edu',
    enrolledCourses: 4,
    totalPurchases: 15996,
    status: 'active',
    joinDate: new Date('2023-11-10')
  },
  {
    id: '4',
    name: 'Vikram Singh',
    email: 'vikram.singh@student.edu',
    phone: '+91 9876543212',
    enrolledCourses: 1,
    totalPurchases: 2999,
    status: 'inactive',
    joinDate: new Date('2024-03-05')
  }
];

// Mock Teachers Data
export const mockTeachers: MockTeacher[] = [
  {
    id: '1',
    name: 'Dr. Anil Kumar',
    email: 'anil.kumar@matsci.edu',
    courses: 2,
    students: 332,
    rating: 4.8,
    joinDate: new Date('2023-08-01')
  },
  {
    id: '2',
    name: 'Prof. Meera Singh',
    email: 'meera.singh@matsci.edu',
    courses: 1,
    students: 189,
    rating: 4.7,
    joinDate: new Date('2023-09-15')
  },
  {
    id: '3',
    name: 'Dr. Rajesh Gupta',
    email: 'rajesh.gupta@matsci.edu',
    courses: 1,
    students: 156,
    rating: 4.6,
    joinDate: new Date('2023-10-01')
  }
];

// Mock Analytics Data
export const mockAnalytics: MockAnalytics = {
  totalStudents: 2847,
  totalTeachers: 47,
  totalRevenue: 8947500,
  activeCourses: 24,
  totalClasses: 156,
  salesTrend: [450000, 520000, 480000, 630000, 720000, 894750],
  studentGrowth: [245, 289, 312, 378, 423, 467],
  courseCompletions: [198, 234, 267, 298, 334, 356],
  monthlyLabels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
};

// Recent Activity Mock Data
export interface MockActivity {
  id: string;
  type: 'enrollment' | 'completion' | 'payment' | 'test_submission';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
}

export const mockRecentActivities: MockActivity[] = [
  {
    id: '1',
    type: 'enrollment',
    title: 'New student enrolled in "Advanced Physics"',
    description: 'Priya Sharma joined the course',
    timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    icon: 'user-plus'
  },
  {
    id: '2',
    type: 'completion',
    title: 'Class completed: "Organic Chemistry Lab"',
    description: 'Dr. Anil Kumar completed the session',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    icon: 'chalkboard-teacher'
  },
  {
    id: '3',
    type: 'payment',
    title: 'Payment received: ₹4,999',
    description: 'Course purchase by Rahul Mehta',
    timestamp: new Date(Date.now() - 32 * 60 * 1000), // 32 minutes ago
    icon: 'rupee-sign'
  },
  {
    id: '4',
    type: 'test_submission',
    title: 'Test submitted: "Mathematics Quiz #3"',
    description: '24 students completed the test',
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    icon: 'clipboard-check'
  }
];

// Upcoming Events Mock Data
export interface MockEvent {
  id: string;
  title: string;
  teacher: string;
  date: Date;
  attendees: number;
  type: 'class' | 'test' | 'event';
  duration?: number;
}

export const mockUpcomingEvents: MockEvent[] = [
  {
    id: '1',
    title: 'Advanced Physics Lab',
    teacher: 'Dr. Anil Kumar',
    date: new Date(Date.now() + 2.5 * 60 * 60 * 1000), // Today, 2:30 PM (assuming current time is around noon)
    attendees: 28,
    type: 'class'
  },
  {
    id: '2',
    title: 'Chemistry Quiz',
    teacher: 'Prof. Meera Singh',
    date: new Date(Date.now() + 22 * 60 * 60 * 1000), // Tomorrow, 10:00 AM
    attendees: 0, // Quiz doesn't have attendees
    type: 'test',
    duration: 45
  },
  {
    id: '3',
    title: 'Course Launch Event',
    teacher: 'Quantum Mechanics',
    date: new Date('2024-12-15T11:00:00'), // Dec 15, 11:00 AM
    attendees: 120,
    type: 'event'
  }
];

// Helper functions to get mock data
export const getMockCourseById = (id: string): MockCourse | undefined => {
  return mockCourses.find(course => course.id === id);
};

export const getMockClassesByCourse = (courseId: string): MockClass[] => {
  const course = getMockCourseById(courseId);
  if (!course) return [];
  
  return mockClasses.filter(cls => cls.courseTitle === course.title);
};

export const getMockTestsByCourse = (courseId: string): MockTest[] => {
  const course = getMockCourseById(courseId);
  if (!course) return [];
  
  return mockTests.filter(test => test.courseTitle === course.title);
};

export const getMockTeacherByName = (name: string): MockTeacher | undefined => {
  return mockTeachers.find(teacher => teacher.name === name);
};

// Generate random data for charts and analytics
export const generateRandomChartData = (points: number, min: number, max: number): number[] => {
  return Array.from({ length: points }, () => Math.floor(Math.random() * (max - min + 1)) + min);
};

// Export all mock data as a default object for easy importing
export default {
  courses: mockCourses,
  classes: mockClasses,
  tests: mockTests,
  students: mockStudents,
  teachers: mockTeachers,
  analytics: mockAnalytics,
  recentActivities: mockRecentActivities,
  upcomingEvents: mockUpcomingEvents,
  // Helper functions
  getCourseById: getMockCourseById,
  getClassesByCourse: getMockClassesByCourse,
  getTestsByCourse: getMockTestsByCourse,
  getTeacherByName: getMockTeacherByName,
  generateRandomChartData
};
