
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import TestScenario from "./pages/TestScenario";
import Calls from "./pages/Calls";
import Contacts from "./pages/Contacts";
import Queue from "./pages/Queue";
import CallHistory from "./pages/CallHistory";
import Reports from "./pages/Reports";
import Stats from "./pages/Stats";
import Escalations from "./pages/Escalations";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";

// Note: We import Toaster but don't use it in the render as notifications are handled
// exclusively through the NotificationPanel component with the bell icon in the Header

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Note: Toaster component is intentionally not used here */}
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/index" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/test-scenario" element={<TestScenario />} />
          <Route path="/calls" element={<Calls />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/queue" element={<Queue />} />
          <Route path="/call-history" element={<CallHistory />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/escalations" element={<Escalations />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={<Help />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
