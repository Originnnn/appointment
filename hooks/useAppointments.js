'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export function useAppointments(filters = {}) {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, [JSON.stringify(filters)]);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(patient_id, full_name, phone),
          doctor:doctors(doctor_id, full_name, specialty)
        `)
        .order('appointment_date', { ascending: true });

      // Apply filters
      if (filters.patientId) {
        query = query.eq('patient_id', filters.patientId);
      }
      if (filters.doctorId) {
        query = query.eq('doctor_id', filters.doctorId);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      
      setAppointments(data || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('appointment_id', appointmentId);

      if (updateError) throw updateError;

      await fetchAppointments();
      return { success: true };
    } catch (err) {
      console.error('Error updating appointment:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  return { 
    appointments, 
    isLoading, 
    error, 
    refetch: fetchAppointments,
    updateStatus: updateAppointmentStatus
  };
}
