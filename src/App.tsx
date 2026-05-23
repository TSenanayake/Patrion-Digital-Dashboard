import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProjectView from "./pages/admin/AdminProjectView";
import AcceptInvite from "./pages/admin/AcceptInvite";
import ProjectEntry from "./pages/project/ProjectEntry";
import ProjectRead from "./pages/project/ProjectRead";
import ProjectComplete from "./pages/project/ProjectComplete";
import ProjectWorkspace from "./pages/project/ProjectWorkspace";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import SupportButton from "./components/SupportButton";

const queryClient = new QueryClient();

const SupportButtonWrapper = () => {
  const { projectId } = useParams<{ projectId: string }>();
  if (!projectId) return null;
  return <SupportButton projectId={projectId} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/project/:projectId" element={<AdminProjectView />} />
          <Route path="/accept-invite" element={<AcceptInvite />} />
          <Route path="/project/:projectId" element={<ProjectEntry />} />
          <Route path="/project/:projectId/read" element={<ProjectRead />} />
          <Route path="/project/:projectId/complete" element={<ProjectComplete />} />
          <Route path="/project/:projectId/workspace" element={<ProjectWorkspace />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <SupportButtonWrapper />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
