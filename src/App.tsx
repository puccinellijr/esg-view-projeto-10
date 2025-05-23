
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Suspense, lazy } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard"; // Changed to direct import instead of lazy loading

// Lazy load components para melhorar performance (except Dashboard which is directly imported now)
const OperationalForm = lazy(() => import("./pages/OperationalForm"));
const Comparison = lazy(() => import("./pages/Comparison"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const CreateUser = lazy(() => import("./pages/CreateUser"));
const ManageUsers = lazy(() => import("./pages/ManageUsers"));

// Componente de loading para lazy loading
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-blue"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Get the base URL from Vite's env or fallback to /esg-view/
const baseUrl = import.meta.env.BASE_URL || '/esg-view/';

// O AppRoutes foi removido e o conteúdo foi movido diretamente para o App
const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter basename={baseUrl}>
      <AuthProvider>
        <TooltipProvider>
          <SidebarProvider>
            <Toaster />
            <Sonner />
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                
                {/* Dashboard route - available for all users (viewer, operational and administrative) */}
                <Route element={<ProtectedRoute requiredLevel="viewer" />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/comparison" element={<Comparison />} />
                  <Route path="/reports" element={<Comparison />} />
                </Route>
                
                {/* Operational form route - only for operational and administrative users */}
                <Route element={<ProtectedRoute requiredLevel="operational" />}>
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
            </Suspense>
          </SidebarProvider>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
