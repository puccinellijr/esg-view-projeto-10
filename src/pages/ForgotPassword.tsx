
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real application, this would send a request to a server to send a reset email
    // For this demo, we'll just simulate it with a timeout
    
    // Check if the email exists in our mock users
    const users = [
      { email: "admin@example.com" },
      { email: "viewer@example.com" },
      { email: "operator@example.com" }
    ];
    
    const userExists = users.some(user => user.email === email);
    
    if (!userExists) {
      toast.error("No account found with this email address");
      return;
    }
    
    // Generate a reset token and store it (in a real app, this would be done server-side)
    const resetToken = Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem(`reset_${email}`, resetToken);
    
    setIsSubmitted(true);
    toast.success("Password reset instructions have been sent to your email");
    
    // In a real app, the user would click a link in their email to access the reset page
    // For this demo, we'll simulate this process by automatically navigating after a delay
    setTimeout(() => {
      navigate(`/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`);
    }, 3000); // Navigate after 3 seconds for demo purposes
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-sidebar to-sidebar/70 p-4">
      <Card className="w-full max-w-md bg-white/95 shadow-lg">
        <div className="flex justify-center p-6 border-b">
          <img src="/logo.png" alt="Logo" className="h-16 object-contain" />
        </div>
        <CardContent className="pt-6">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h1 className="text-2xl font-bold text-center text-black">Reset Your Password</h1>
              <p className="text-center text-black mb-4">
                Enter your email address and we'll send you instructions to reset your password.
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-black">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-gray-300"
                  required
                />
              </div>
              
              <Button type="submit" className="w-full bg-custom-blue text-white hover:bg-custom-blue/90">
                Send Reset Instructions
              </Button>
              
              <div className="text-center">
                <Link to="/login" className="text-sm text-custom-blue hover:underline">
                  Back to login
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <Alert className="bg-blue-50 text-black border-blue-200">
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  Password reset instructions have been sent to <strong>{email}</strong>. 
                  Please check your email and follow the instructions.
                </AlertDescription>
              </Alert>
              
              <div className="text-center">
                <Link to="/login" className="text-sm text-custom-blue hover:underline">
                  Back to login
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
