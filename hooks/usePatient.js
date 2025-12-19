'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export function usePatient(userId) {
  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchPatient();
    }
  }, [userId]);

  const fetchPatient = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError) throw fetchError;
      
      setPatient(data);
    } catch (err) {
      console.error('Error fetching patient:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePatient = async (updates) => {
    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('patients')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) throw updateError;

      setPatient(data);
      return { success: true, data };
    } catch (err) {
      console.error('Error updating patient:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  return { patient, isLoading, error, refetch: fetchPatient, updatePatient };
}
