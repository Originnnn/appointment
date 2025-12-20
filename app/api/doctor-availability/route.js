import { supabase } from '@/utils/supabase';
import { NextResponse } from 'next/server';

/**
 * MICROSERVICE: Doctor Availability Service
 * Tìm kiếm bác sĩ có sẵn khi bác sĩ được chọn đã bận
 */

export async function POST(request) {
  try {
    const { specialty, date, time, currentBranchId, currentDoctorId } = await request.json();

    // Validate input
    if (!specialty || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields: specialty, date, time' },
        { status: 400 }
      );
    }

    console.log('🔍 Finding alternative doctors:', { specialty, date, time, currentBranchId });

    // 1. Check if current doctor is actually busy
    const { data: existingAppointments, error: checkError } = await supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', currentDoctorId)
      .eq('appointment_date', date)
      .eq('appointment_time', time)
      .in('status', ['confirmed', 'pending']);

    if (checkError) {
      console.error('Error checking appointments:', checkError);
    }

    const isCurrentDoctorBusy = existingAppointments && existingAppointments.length > 0;

    // 2. Find all doctors with same specialty
    const { data: doctors, error: doctorsError } = await supabase
      .from('doctors')
      .select(`
        doctor_id,
        full_name,
        specialty,
        phone,
        description,
        years_of_experience,
        rating,
        total_reviews,
        branch_id,
        branches (
          branch_id,
          branch_name,
          address,
          city,
          district,
          phone,
          latitude,
          longitude
        )
      `)
      .eq('specialty', specialty);

    if (doctorsError) {
      throw doctorsError;
    }

    // 3. For each doctor, check availability
    const availabilityPromises = doctors.map(async (doctor) => {
      // Check appointments at that time
      const { data: appointments } = await supabase
        .from('appointments')
        .select('appointment_id, status')
        .eq('doctor_id', doctor.doctor_id)
        .eq('appointment_date', date)
        .eq('appointment_time', time)
        .in('status', ['confirmed', 'pending']);

      const isBusy = appointments && appointments.length > 0;

      // Check doctor_availability table (if exists)
      const { data: availability } = await supabase
        .from('doctor_availability')
        .select('is_available')
        .eq('doctor_id', doctor.doctor_id)
        .eq('date', date)
        .eq('time_slot', time)
        .single();

      const isAvailable = !isBusy && (availability ? availability.is_available : true);

      return {
        ...doctor,
        is_available: isAvailable,
        is_busy: isBusy,
        appointments_count: appointments ? appointments.length : 0
      };
    });

    const doctorsWithAvailability = await Promise.all(availabilityPromises);

    // 4. Filter available doctors and sort by priority
    const availableDoctors = doctorsWithAvailability
      .filter(d => d.is_available && d.doctor_id !== currentDoctorId)
      .map(doctor => {
        // Calculate distance priority
        let distancePriority = 2; // Other city
        if (currentBranchId && doctor.branches) {
          if (doctor.branch_id === currentBranchId) {
            distancePriority = 0; // Same branch
          } else if (doctor.branches.city === doctors.find(d => d.branch_id === currentBranchId)?.branches?.city) {
            distancePriority = 1; // Same city
          }
        }

        return {
          ...doctor,
          distance_priority: distancePriority,
          priority_label: distancePriority === 0 ? 'Cùng chi nhánh' : 
                         distancePriority === 1 ? 'Cùng thành phố' : 'Chi nhánh khác'
        };
      })
      .sort((a, b) => {
        // Sort by: distance priority -> rating -> experience
        if (a.distance_priority !== b.distance_priority) {
          return a.distance_priority - b.distance_priority;
        }
        if (a.rating !== b.rating) {
          return (b.rating || 0) - (a.rating || 0);
        }
        return (b.years_of_experience || 0) - (a.years_of_experience || 0);
      });

    // 5. Get statistics
    const sameBranch = availableDoctors.filter(d => d.distance_priority === 0);
    const sameCity = availableDoctors.filter(d => d.distance_priority === 1);
    const otherCities = availableDoctors.filter(d => d.distance_priority === 2);

    // 6. Log conflict if original doctor is busy
    if (isCurrentDoctorBusy && currentDoctorId) {
      await supabase.from('appointment_conflicts').insert({
        patient_id: null, // Will be filled when patient actually tries to book
        requested_doctor_id: currentDoctorId,
        requested_date: date,
        requested_time: time,
        specialty: specialty,
        branch_id: currentBranchId,
        alternative_suggested: availableDoctors.length > 0
      });
    }

    return NextResponse.json({
      success: true,
      original_doctor_busy: isCurrentDoctorBusy,
      total_alternatives: availableDoctors.length,
      statistics: {
        same_branch: sameBranch.length,
        same_city: sameCity.length,
        other_cities: otherCities.length
      },
      recommendations: availableDoctors.slice(0, 10), // Top 10
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error finding alternative doctors:', error);
    return NextResponse.json(
      { 
        error: 'Failed to find alternative doctors',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// GET: Get doctor availability for specific doctor
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date');
    const time = searchParams.get('time');

    if (!doctorId || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required parameters: doctorId, date, time' },
        { status: 400 }
      );
    }

    // Check if doctor has appointment at that time
    const { data: appointments } = await supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('appointment_date', date)
      .eq('appointment_time', time)
      .in('status', ['confirmed', 'pending']);

    const isBusy = appointments && appointments.length > 0;

    // Check doctor_availability table
    const { data: availability } = await supabase
      .from('doctor_availability')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('date', date)
      .eq('time_slot', time)
      .single();

    return NextResponse.json({
      success: true,
      doctor_id: doctorId,
      date,
      time,
      is_available: !isBusy && (!availability || availability.is_available),
      is_busy: isBusy,
      appointments_count: appointments ? appointments.length : 0,
      availability_record: availability
    });

  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { error: 'Failed to check availability', message: error.message },
      { status: 500 }
    );
  }
}
