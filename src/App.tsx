import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();



// 🔵 Wrapper to add background video only on home route
const RouteWithVideo = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const showVideo = location.pathname === "/";

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      
      <main className="relative z-10">{children}</main>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RouteWithVideo>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </RouteWithVideo>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
