import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import {
  GraduationCap,
  Home,
  BookOpen,
  Users,
  ClipboardCheck,
  BarChart3,
  Megaphone,
  Tags,
  FolderOpen,
  Calendar,
  MessageCircle,
  Settings,
  Crown,
  Presentation,
  University,
} from "lucide-react";

const navigationItems = {
  super_admin: [
    { icon: Home, label: "Dashboard", href: "/", section: null },
    { icon: BookOpen, label: "Courses", href: "/courses", section: "Education", badge: "24" },
    { icon: Presentation, label: "Classes", href: "/classes", section: "Education", badge: "156" },
    { icon: ClipboardCheck, label: "Tests & Exams", href: "/tests", section: "Education", badge: "89" },
    { icon: University, label: "Students", href: "/students", section: "People", badge: "2,847" },
    { icon: Users, label: "Teachers", href: "/teachers", section: "People", badge: "47" },
    { icon: BarChart3, label: "Analytics", href: "/analytics", section: "Marketing" },
    { icon: Megaphone, label: "Campaigns", href: "/campaigns", section: "Marketing", badge: "3 Active" },
    { icon: Tags, label: "Coupons", href: "/coupons", section: "Marketing" },
    { icon: FolderOpen, label: "Files & Materials", href: "/files", section: "Tools" },
    { icon: Calendar, label: "Timetable", href: "/timetable", section: "Tools" },
    { icon: MessageCircle, label: "Chat", href: "/chat", section: "Tools", badge: "12" },
  ],
  teacher: [
    { icon: Home, label: "Dashboard", href: "/", section: null },
    { icon: BookOpen, label: "My Courses", href: "/courses", section: "Education" },
    { icon: Presentation, label: "My Classes", href: "/classes", section: "Education" },
    { icon: ClipboardCheck, label: "Tests & Exams", href: "/tests", section: "Education" },
    { icon: University, label: "Students", href: "/students", section: "People" },
    { icon: FolderOpen, label: "Materials", href: "/files", section: "Tools" },
    { icon: Calendar, label: "Schedule", href: "/timetable", section: "Tools" },
    { icon: MessageCircle, label: "Chat", href: "/chat", section: "Tools" },
  ],
  sales: [
    { icon: Home, label: "Dashboard", href: "/", section: null },
    { icon: BarChart3, label: "Analytics", href: "/analytics", section: "Reports" },
    { icon: Megaphone, label: "Campaigns", href: "/campaigns", section: "Marketing" },
    { icon: Tags, label: "Coupons", href: "/coupons", section: "Marketing" },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();
  
  const { data: stats } = useQuery({
    queryKey: ["/api/analytics"],
    retry: false,
  });

  const userRole = user?.role || 'teacher';
  const navItems = navigationItems[userRole as keyof typeof navigationItems] || navigationItems.teacher;

  const groupedNavItems = navItems.reduce((acc, item) => {
    if (item.section === null) {
      acc.main = acc.main || [];
      acc.main.push(item);
    } else {
      acc[item.section] = acc[item.section] || [];
      acc[item.section].push(item);
    }
    return acc;
  }, {} as Record<string, typeof navItems>);

  return (
    <aside className="w-64 bg-card glassmorphism border-r border-border flex flex-col" data-testid="sidebar">
      {/* Logo Section */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-lg">Matsci</h1>
            <p className="text-xs text-muted-foreground">EdTech Platform</p>
          </div>
        </div>
      </div>

      {/* User Role Badge */}
      <div className="px-6 py-4">
        <div className="bg-primary/10 rounded-lg p-3 glassmorphism-dark">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Crown className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm" data-testid="text-username">
                {user?.firstName || user?.email || "Admin User"}
              </p>
              <p className="text-xs text-muted-foreground capitalize" data-testid="text-user-role">
                {userRole.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 space-y-2">
        {/* Main items */}
        {groupedNavItems.main?.map((item) => (
          <Link key={item.href} href={item.href}>
            <a className={`nav-item flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-primary/10 transition-colors ${
              location === item.href ? 'active bg-primary/10 text-primary' : ''
            }`} data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </a>
          </Link>
        ))}

        {/* Grouped sections */}
        {Object.entries(groupedNavItems).map(([section, items]) => {
          if (section === 'main') return null;
          return (
            <div key={section} className="nav-section">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2">
                {section}
              </p>
              {items.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a className={`nav-item flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-primary/10 transition-colors ${
                    location === item.href ? 'active bg-primary/10 text-primary' : ''
                  }`} data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                        item.badge.includes('Active') 
                          ? 'bg-secondary/20 text-secondary' 
                          : item.href === '/chat'
                            ? 'bg-destructive text-destructive-foreground'
                            : 'bg-muted text-muted-foreground'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </a>
                </Link>
              ))}
            </div>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-border">
        <Link href="/settings">
          <a className={`nav-item flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-primary/10 transition-colors ${
            location === '/settings' ? 'active bg-primary/10 text-primary' : ''
          }`} data-testid="nav-settings">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </a>
        </Link>
      </div>
    </aside>
  );
}
