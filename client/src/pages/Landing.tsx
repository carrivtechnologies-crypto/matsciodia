import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, BookOpen, BarChart3 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="font-heading font-bold text-4xl text-foreground">Matsci</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-2">EdTech Platform</p>
          <p className="text-lg text-muted-foreground">Super Admin Dashboard</p>
        </div>

        <Card className="glassmorphism neumorphism mb-8">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="font-heading font-bold text-2xl mb-4">Welcome to your Admin Panel</h2>
              <p className="text-muted-foreground mb-6">
                Manage courses, students, teachers, and analytics from one comprehensive dashboard.
              </p>
              <Button 
                size="lg" 
                className="px-8 py-4 text-lg font-semibold"
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-login"
              >
                Sign In to Continue
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Course Management</h3>
                <p className="text-sm text-muted-foreground">Create and manage educational content</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-semibold mb-1">User Management</h3>
                <p className="text-sm text-muted-foreground">Handle students and teachers</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-1">Analytics</h3>
                <p className="text-sm text-muted-foreground">Track performance and growth</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <GraduationCap className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-1">Real-time Features</h3>
                <p className="text-sm text-muted-foreground">Chat and live notifications</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
