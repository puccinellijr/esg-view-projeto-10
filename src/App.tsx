
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import OperationalForm from "./pages/OperationalForm";
import Comparison from "./pages/Comparison";
import UserProfile from "./pages/UserProfile";
import CreateUser from "./pages/CreateUser";
import ManageUsers from "./pages/ManageUsers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <SidebarProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Protected routes for viewers and administrative users */}
              <Route element={<ProtectedRoute requiredLevel="viewer" />}>
                <Route path="/comparison" element={<Comparison />} />
                <Route path="/reports" element={<Comparison />} />
              </Route>

              {/* Dashboard route - available for operational users and above */}
              <Route element={<ProtectedRoute requiredLevel="operational" />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/operational-form" element={<OperationalForm />} />
                <Route path="/settings/profile" element={<UserProfile />} />
              </Route>
              
              {/* Admin settings - only available to administrative users */}
              <Route element={<ProtectedRoute requiredLevel="administrative" />}>
                <Route path="/settings/user/create" element={<CreateUser />} />
                <Route path="/settings/users" element={<ManageUsers />} />
              </Route>
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SidebarProvider>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
