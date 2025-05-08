
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-sidebar to-sidebar/70 p-4">
      <div className="bg-white/95 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-custom-red mb-4">Access Denied</h1>
        <p className="text-black mb-6">
          Sorry, your account ({user?.email}) with {user?.accessLevel} access does not have
          permission to view this page.
        </p>
        <div className="flex justify-center gap-4">
          <Button 
            onClick={() => navigate('/dashboard')}
            className="bg-custom-blue text-white hover:bg-custom-blue/90"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
