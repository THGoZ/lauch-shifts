import { Shift } from "@/db/schema";
import { CustomError } from "@/domain/entities/error-entity";
import { FieldError, ShiftWithPatient } from "@/interfaces/interface";

const startTimeAM = 8;
const endTimeAM = 12;
const startTimePM = 14;
const endTimePM = 20;

export const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour < 12; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      const displayTime = formatTime(timeString);
      slots.push({ value: timeString, label: displayTime });
    }
  }
  // PM slots
  for (let hour = 14; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      const displayTime = formatTime(timeString);
      slots.push({ value: timeString, label: displayTime });
    }
  }
  return slots;
};

export const availableSlots = (shifts: ShiftWithPatient[], slotDuration: number = 30) => {
  const allSlots = generateTimeSlots();
  console.log("shifts", shifts);

  const available = allSlots.filter(slot => {
    return !shifts.some(shift =>
      isOverlapping(slot.value, slotDuration, shift.start_time, shift.duration ?? 30)
    );
  });

  return available;
};

export const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const formatDuration = (duration: number) => {
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}m`;
  }
};

export const durationAddition = (
  time: string,
  duration: number,
  use24HourFormat = false
) => {
  const [hours, minutes] = time.split(":").map(Number);

  const totalMinutes = hours * 60 + minutes + duration;

  const newHours24 = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  const paddedMinutes = newMinutes.toString().padStart(2, "0");

  if (use24HourFormat) {
    const paddedHours = newHours24.toString().padStart(2, "0");
    return `${paddedHours}:${paddedMinutes}`;
  } else {
    const ampm = newHours24 >= 12 ? "PM" : "AM";
    const displayHour = newHours24 % 12 || 12;
    return `${displayHour}:${paddedMinutes} ${ampm}`;
  }
};

export const parseTimeString = (time: string): { hour: number; minute: number } => {
  const [hours, minutes] = time.split(":");
  return {
    hour: parseInt(hours, 10),
    minute: parseInt(minutes, 10),
  };
};

export function getOverlappingShifts(
  shifts: Shift[],
  slotStart: string,
  slotDuration: number = 30
): Shift[] {
  return shifts.filter(shift =>
    isOverlapping(slotStart, slotDuration, shift.start_time, shift.duration ?? 30)
  );
}

export const newOverlapping = (shifts: Shift[], slotStart: string, slotDuration: number = 30): boolean => {
  return shifts.some(shift =>
    isOverlapping(slotStart, slotDuration, shift.start_time, shift.duration ?? 30)
  );
};


export function isOverlapping(slotStart: string, slotDuration: number, shiftStart: string, shiftDuration: number) {
  const slotStartMinutes = parseTimeString(slotStart).hour * 60 + parseTimeString(slotStart).minute;
  const slotEndMinutes = slotStartMinutes + slotDuration;
  const shiftStartMinutes = parseTimeString(shiftStart).hour * 60 + parseTimeString(shiftStart).minute;
  const shiftEndMinutes = shiftStartMinutes + shiftDuration;
  return slotStartMinutes < shiftEndMinutes && slotEndMinutes > shiftStartMinutes;
}


export function checkOverLappingAndThrowFields(existingShifts: Shift[], slotStart: string, slotDuration: number = 30) {

  const overlappingShift = getOverlappingShifts(existingShifts, slotStart, slotDuration);
  if (overlappingShift.length > 0) {

    const overlappingMessage = overlappingShift.map(shift => { return `Patient ${shift.patient_id} is already booked on ${shift.date} for ${shift.start_time} • ${shift.duration} min` }
    )
    const fields: FieldError[] = [{ field: "start_time", message: "conflictingShifts" }, { field: "duration", message: "conflictingShifts" }, { field: "date", message: "conflictingShifts" }];

    throw new CustomError(
      "El turno se superpone con otro turno existente.",
      fields,
      overlappingMessage
    );
  }
}