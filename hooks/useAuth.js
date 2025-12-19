'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth(requiredRole = null) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const userData = localStorage.getItem('user');
      
      if (!userData) {
        router.push('/login');
        return;
      }

      const parsedUser = JSON.parse(userData);
      
      // Check if user has required role
      if (requiredRole && parsedUser.role !== requiredRole) {
        console.error('Unauthorized access attempt');
        router.push('/login');
        return;
      }

      setUser(parsedUser);
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  return { user, isLoading, logout, checkAuth };
}
