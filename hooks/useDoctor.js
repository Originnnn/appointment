'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export function useDoctor(userId) {
  const [doctor, setDoctor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchDoctor();
    }
  }, [userId]);

  const fetchDoctor = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError) throw fetchError;
      
      setDoctor(data);
    } catch (err) {
      console.error('Error fetching doctor:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDoctor = async (updates) => {
    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('doctors')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) throw updateError;

      setDoctor(data);
      return { success: true, data };
    } catch (err) {
      console.error('Error updating doctor:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  return { doctor, isLoading, error, refetch: fetchDoctor, updateDoctor };
}
