
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard for all user types
    if (user) {
      navigate("/dashboard");
    } else {
      // Otherwise redirect to login
      navigate("/login");
    }
  }, [navigate, user]);

  return null; // This won't be seen as we're redirecting
}
