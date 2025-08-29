import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Courses from "@/pages/Courses";
import CourseDetails from "@/pages/CourseDetails";
import Classes from "@/pages/Classes";
import Tests from "@/pages/Tests";
import Students from "@/pages/Students";
import Teachers from "@/pages/Teachers";
import Analytics from "@/pages/Analytics";
import Campaigns from "@/pages/Campaigns";
import Coupons from "@/pages/Coupons";
import Files from "@/pages/Files";
import Timetable from "@/pages/Timetable";
import Chat from "@/pages/Chat";
import Settings from "@/pages/Settings";
import Layout from "@/components/Layout";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/">
            <Layout>
              <Dashboard />
            </Layout>
          </Route>
          <Route path="/courses">
            <Layout>
              <Courses />
            </Layout>
          </Route>
          <Route path="/courses/:id">
            {({ id }) => (
              <Layout>
                <CourseDetails courseId={id} />
              </Layout>
            )}
          </Route>
          <Route path="/classes">
            <Layout>
              <Classes />
            </Layout>
          </Route>
          <Route path="/tests">
            <Layout>
              <Tests />
            </Layout>
          </Route>
          <Route path="/students">
            <Layout>
              <Students />
            </Layout>
          </Route>
          <Route path="/teachers">
            <Layout>
              <Teachers />
            </Layout>
          </Route>
          <Route path="/analytics">
            <Layout>
              <Analytics />
            </Layout>
          </Route>
          <Route path="/campaigns">
            <Layout>
              <Campaigns />
            </Layout>
          </Route>
          <Route path="/coupons">
            <Layout>
              <Coupons />
            </Layout>
          </Route>
          <Route path="/files">
            <Layout>
              <Files />
            </Layout>
          </Route>
          <Route path="/timetable">
            <Layout>
              <Timetable />
            </Layout>
          </Route>
          <Route path="/chat">
            <Layout>
              <Chat />
            </Layout>
          </Route>
          <Route path="/settings">
            <Layout>
              <Settings />
            </Layout>
          </Route>
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
