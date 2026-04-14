import { useState } from "react";
import { AuthProvider } from "./contexts/AuthContext";

// Navigation & Layout
import { Navigation } from "./components/Navigation";
import { ChatHistorySidebar } from "./components/ChatHistorySidebar";
import { Footer } from "./components/Footer";

// Auth
import { Login } from "./components/Login";
import { SignUp } from "./components/SignUp";

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
  | "admin";

type HistoryItem = {
  type: "analysis" | "job" | "course";
};

/* ---------------- APP ---------------- */

export default function App(): JSX.Element {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const handleNavigate = (page: Page): void => {
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

  const renderPage = (): JSX.Element => {
    switch (currentPage) {
      case "login":
        return <Login onNavigate={handleNavigate} />;

      case "signup":
        return <SignUp onNavigate={handleNavigate} />;

      case "profile":
        return <UserProfile onNavigate={handleNavigate} />;

      case "edit-profile":
        return <EditProfile onNavigate={handleNavigate} />;

      case "history":
        return <History onNavigate={handleNavigate} />;

      case "saved-jobs":
        return <SavedJobs onNavigate={handleNavigate} />;

      case "courses":
        return <CourseRecommendations onNavigate={handleNavigate} />;

      case "learning-path":
        return <LearningPath onNavigate={handleNavigate} />;

      case "analysis":
        return (
          <>
            <SkillAnalysis onNavigate={handleNavigate} />
            <Footer />
          </>
        );

      case "jobs":
        return <JobsListing onNavigate={handleNavigate} />;

      case "job-details":
        return <JobDetails onNavigate={handleNavigate} />;

      case "job-posting":
        return <JobPosting onNavigate={handleNavigate} />;

      case "recruiter-profile":
        return <RecruiterProfile onNavigate={handleNavigate} />;

      case "admin":
        return <AdminDashboard />;

      case "home":
      default:
        return (
          <>
            <Hero />
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
    <AuthProvider>
      <div className="min-h-screen bg-white">
        <Navigation
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <ChatHistorySidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onSelectItem={handleSelectHistoryItem}
        />

        {renderPage()}
      </div>
    </AuthProvider>
  );
}
