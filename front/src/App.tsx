import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Navigation & Layout
import { Navigation } from "./components/Navigation";
import { ChatHistorySidebar } from "./components/ChatHistorySidebar";
import { Footer } from "./components/Footer";

// Auth
import { Login } from "./components/Login";
import { SignUp } from "./components/SignUp";
import { Unauthorized } from "./components/Unauthorized";

// User
import { UserProfile } from "./components/UserProfile";
import { EditProfile } from "./components/EditProfile";
import { History } from "./components/History";
import { SavedJobs } from "./components/SavedJobs";

// Pages
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { UserRoles } from "./components/UserRoles";
import { AICapabilities } from "./components/AICapabilities";
import { HowItWorks } from "./components/HowItWorks";
import { CTA } from "./components/CTA";

// Courses & Learning
import { CourseRecommendations } from "./components/CourseRecommendations";
import { LearningPath } from "./components/LearningPath";
import { SkillAnalysis } from "./components/SkillAnalysis";

// Jobs
import { JobsListing } from "./components/JobsListing";
import { JobDetails } from "./components/JobDetails";
import { JobPosting } from "./components/JobPosting";

// Recruiter & Admin
import { RecruiterProfile } from "./components/RecruiterProfile";
import { AdminDashboard } from "./components/AdminDashboard";

/* ---------------- TYPES ---------------- */

type Page =
  | "home"
  | "login"
  | "signup"
  | "profile"
  | "edit-profile"
  | "history"
  | "saved-jobs"
  | "courses"
  | "learning-path"
  | "analysis"
  | "jobs"
  | "job-details"
  | "job-posting"
  | "recruiter-profile"
  | "admin"
  | "unauthorized";

type HistoryItem = {
  type: "analysis" | "job" | "course";
};

/* ---------------- ROUTE PROTECTION CONFIG ---------------- */

const ROLE_ROUTES: Record<string, Page[]> = {
  jobseeker: [
    "home",
    "profile",
    "edit-profile",
    "history",
    "saved-jobs",
    "courses",
    "learning-path",
    "analysis",
    "jobs",
    "job-details",
  ],
  recruiter: ["home", "recruiter-profile", "job-posting", "jobs", "job-details"],
  admin: ["home", "admin"],
};

const PUBLIC_ROUTES: Page[] = ["home", "login", "signup", "unauthorized"];

/* ---------------- APP CONTENT ---------------- */

function AppContent() {
  const { isAuthenticated, user, hasRole } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Check route permissions
  const canAccessRoute = (page: Page): boolean => {
    // Public routes are always accessible
    if (PUBLIC_ROUTES.includes(page)) {
      return true;
    }

    // Must be authenticated for protected routes
    if (!isAuthenticated || !user) {
      return false;
    }

    // Check role-based access
    const allowedRoutes = ROLE_ROUTES[user.role] || [];
    return allowedRoutes.includes(page);
  };

  const handleNavigate = (page: Page): void => {
    // If not authenticated and trying to access protected route, redirect to login
    if (!isAuthenticated && !PUBLIC_ROUTES.includes(page)) {
      setCurrentPage("login");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // If authenticated but no access to route, show unauthorized
    if (isAuthenticated && !canAccessRoute(page)) {
      setCurrentPage("unauthorized");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectHistoryItem = (item: HistoryItem): void => {
    if (item.type === "analysis") {
      handleNavigate("analysis");
    } else if (item.type === "job") {
      handleNavigate("jobs");
    } else if (item.type === "course") {
      handleNavigate("courses");
    }
    setIsSidebarOpen(false);
  };

  // Redirect to appropriate page after login
  useEffect(() => {
    if (
      isAuthenticated &&
      user &&
      (currentPage === "login" || currentPage === "signup")
    ) {
      // Redirect based on role
      if (user.role === "admin") {
        handleNavigate("admin");
      } else if (user.role === "recruiter") {
        handleNavigate("recruiter-profile");
      } else {
        handleNavigate("profile");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  const renderPage = (): JSX.Element => {
    switch (currentPage) {
      case "login":
        return <Login onNavigate={handleNavigate} />;

      case "signup":
        return <SignUp onNavigate={handleNavigate} />;

      case "unauthorized":
        return <Unauthorized onNavigate={handleNavigate} />;

      case "profile":
        if (!canAccessRoute("profile"))
          return <Unauthorized onNavigate={handleNavigate} />;
        return <UserProfile onNavigate={handleNavigate} />;

      case "edit-profile":
        if (!canAccessRoute("edit-profile"))
          return <Unauthorized onNavigate={handleNavigate} />;
        return <EditProfile onNavigate={handleNavigate} />;

      case "history":
        if (!canAccessRoute("history"))
          return <Unauthorized onNavigate={handleNavigate} />;
        return <History onNavigate={handleNavigate} />;

      case "saved-jobs":
        if (!canAccessRoute("saved-jobs"))
          return <Unauthorized onNavigate={handleNavigate} />;
        return <SavedJobs onNavigate={handleNavigate} />;

      case "courses":
        if (!canAccessRoute("courses"))
          return <Unauthorized onNavigate={handleNavigate} />;
        return <CourseRecommendations onNavigate={handleNavigate} />;

      case "learning-path":
        if (!canAccessRoute("learning-path"))
          return <Unauthorized onNavigate={handleNavigate} />;
        return <LearningPath onNavigate={handleNavigate} />;

      case "analysis":
        if (!canAccessRoute("analysis"))
          return <Unauthorized onNavigate={handleNavigate} />;
        return (
          <>
            <SkillAnalysis onNavigate={handleNavigate} />
            <Footer />
          </>
        );

      case "jobs":
        if (!canAccessRoute("jobs"))
          return <Unauthorized onNavigate={handleNavigate} />;
        return <JobsListing onNavigate={handleNavigate} />;

      case "job-details":
        if (!canAccessRoute("job-details"))
          return <Unauthorized onNavigate={handleNavigate} />;
        return <JobDetails onNavigate={handleNavigate} />;

      case "job-posting":
        if (!canAccessRoute("job-posting"))
          return <Unauthorized onNavigate={handleNavigate} />;
        return <JobPosting onNavigate={handleNavigate} />;

      case "recruiter-profile":
        if (!canAccessRoute("recruiter-profile"))
          return <Unauthorized onNavigate={handleNavigate} />;
        return <RecruiterProfile onNavigate={handleNavigate} />;

      case "admin":
        if (!canAccessRoute("admin"))
          return <Unauthorized onNavigate={handleNavigate} />;
        return <AdminDashboard />;

      case "home":
      default:
        return (
          <>
            {/* ✅ UPDATED: pass isAuthenticated to Hero */}
            <Hero
              onNavigate={handleNavigate}
              isAuthenticated={isAuthenticated}
            />
            <Features />
            <UserRoles />
            <AICapabilities />
            <HowItWorks />
            <CTA onNavigate={handleNavigate} />
            <Footer />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {isAuthenticated && hasRole("jobseeker") && (
        <ChatHistorySidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onSelectItem={handleSelectHistoryItem}
        />
      )}

      {renderPage()}
    </div>
  );
}

/* ---------------- APP ---------------- */

export default function App(): JSX.Element {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
