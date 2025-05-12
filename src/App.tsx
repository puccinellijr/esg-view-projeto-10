
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Suspense, lazy } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

// Lazy load components para melhorar performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
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

// Verificar se o sistema está inicializado
function AppRoutes() {
  const { isInitialized } = useAuth();

  if (!isInitialized) {
    return <LoadingFallback />;
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Dashboard route - available for all users (viewer, operational and administrative) */}
      <Route element={<ProtectedRoute requiredLevel="viewer" />}>
        <Route path="/dashboard" element={
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard />
          </Suspense>
        } />
        <Route path="/comparison" element={
          <Suspense fallback={<LoadingFallback />}>
            <Comparison />
          </Suspense>
        } />
        <Route path="/reports" element={
          <Suspense fallback={<LoadingFallback />}>
            <Comparison />
          </Suspense>
        } />
      </Route>
      
      {/* Operational form route - only for operational and administrative users */}
      <Route element={<ProtectedRoute requiredLevel="operational" />}>
        <Route path="/operational-form" element={
          <Suspense fallback={<LoadingFallback />}>
            <OperationalForm />
          </Suspense>
        } />
        <Route path="/settings/profile" element={
          <Suspense fallback={<LoadingFallback />}>
            <UserProfile />
          </Suspense>
        } />
      </Route>
      
      {/* Admin settings - only available to administrative users */}
      <Route element={<ProtectedRoute requiredLevel="administrative" />}>
        <Route path="/settings/user/create" element={
          <Suspense fallback={<LoadingFallback />}>
            <CreateUser />
          </Suspense>
        } />
        <Route path="/settings/users" element={
          <Suspense fallback={<LoadingFallback />}>
            <ManageUsers />
          </Suspense>
        } />
      </Route>
      
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <SidebarProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </SidebarProvider>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
