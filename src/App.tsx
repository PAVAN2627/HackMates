import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { PerformanceDebug } from "@/components/PerformanceDebug";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Register from "./pages/Register";
import PublicHackathons from "./pages/PublicHackathons";
import Dashboard from "./pages/Dashboard";
import Hackathons from "./pages/Hackathons";
import HackathonDetails from "./pages/HackathonDetails";
import CreateHackathon from "./pages/CreateHackathon";
import EditHackathon from "./pages/EditHackathon";
import Profiles from "./pages/Profiles";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import Announcements from "./pages/Announcements";

import NotFound from "./pages/NotFound";
import { DashboardLayout } from "./components/layout/DashboardLayout";

const App = () => (
  <ErrorBoundary>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/register" element={<Register />} />
              <Route path="/explore" element={<PublicHackathons />} />
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/hackathons" element={<Hackathons />} />
                <Route path="/hackathons/:id" element={<HackathonDetails />} />
                <Route path="/hackathons/:id/edit" element={<EditHackathon />} />
                <Route path="/create-hackathon" element={<CreateHackathon />} />
                <Route path="/profiles" element={<Profiles />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:userId" element={<Profile />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/announcements" element={<Announcements />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
            <PerformanceDebug />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </TooltipProvider>
  </ErrorBoundary>
);

export default App;
