import { ShiftWithPatient } from '@/interfaces/interface';
import { getMarkedDates } from '@/services/shifts/shift.helpers';
import { useMemo } from 'react';


interface UseMarkedDatesProps {
    shifts: ShiftWithPatient[];
}

export function useMarkedDates({ shifts }: UseMarkedDatesProps) {
  const markedDates = useMemo(() => getMarkedDates(shifts), [shifts]);

  return { markedDates };
}