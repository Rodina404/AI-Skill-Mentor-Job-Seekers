import { useState } from "react";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { UserRoles } from "./components/UserRoles";
import { HowItWorks } from "./components/HowItWorks";
import { AICapabilities } from "./components/AICapabilities";
import { SkillAnalysis } from "./components/SkillAnalysis";
import { CTA } from "./components/CTA";
import { Footer } from "./components/Footer";
import { Navigation } from "./components/Navigation";
import { Login } from "./components/Login";
import { SignUp } from "./components/SignUp";
import { UserProfile } from "./components/UserProfile";
import { History } from "./components/History";
import { CourseRecommendations } from "./components/CourseRecommendations";
import { AdminDashboard } from "./components/AdminDashboard";
import { RecruiterProfile } from "./components/RecruiterProfile";
import { JobPosting } from "./components/JobPosting";
import { JobsListing } from "./components/JobsListing";
import { ChatHistorySidebar } from "./components/ChatHistorySidebar";
import { AuthProvider } from "./contexts/AuthContext";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectHistoryItem = (item: any) => {
    // Navigate to relevant page based on item type
    if (item.type === "analysis") {
      handleNavigate("analysis");
    } else if (item.type === "job") {
      handleNavigate("jobs");
    } else if (item.type === "course") {
      handleNavigate("courses");
    }
    setIsSidebarOpen(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "login":
        return <Login onNavigate={handleNavigate} />;
      case "signup":
        return <SignUp onNavigate={handleNavigate} />;
      case "profile":
        return <UserProfile onNavigate={handleNavigate} />;
      case "history":
        return <History onNavigate={handleNavigate} />;
      case "courses":
        return (
          <CourseRecommendations onNavigate={handleNavigate} />
        );
      case "admin":
        return <AdminDashboard />;
      case "recruiter-profile":
        return <RecruiterProfile onNavigate={handleNavigate} />;
      case "job-posting":
        return <JobPosting onNavigate={handleNavigate} />;
      case "jobs":
        return <JobsListing onNavigate={handleNavigate} />;
      case "analysis":
        return (
          <>
            <SkillAnalysis />
            <Footer />
          </>
        );
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
          onNavigate={handleNavigate}
          currentPage={currentPage}
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