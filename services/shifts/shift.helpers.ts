import { shiftStatus } from "@/constants/enums";
import { Shift } from "@/db/schema";
import { CustomError } from "@/domain/entities/error-entity";
import { FieldError, ShiftWithPatient } from "@/interfaces/interface";
import { TimelineProps } from "react-native-calendars";
import { MarkedDates } from "react-native-calendars/src/types";

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

export const formatTime = (time: string, use24HourFormat = false) => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  if (use24HourFormat) {
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  } else {
    return `${hour}:${minutes}`;
  }
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

export function returnShiftsWithSections(shifts: ShiftWithPatient[], weeks: Date[]) {
  const sections: string[] = weeks.map(week => week.toISOString().split("T")[0]);

  /*   shifts.map(shift => {
      const date = shift.date;
  
      if (!sections.includes(date)) {
        sections.push(date);
      }
    }); */

  const shiftsWithSections = sections.map(section => {
    return {
      title: section,
      data: shifts.filter(shift => shift.date === section)
    }
  })
  return shiftsWithSections;
}

export function getWeekRange(date: Date): Date[] {
  const day = date.getDay(); 
  const diffToMonday = day === 0 ? -6 : 1 - day; 
  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);

  const week = [];

  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(monday);
    currentDay.setDate(monday.getDate() + i);
    week.push(currentDay);
  }

  return week;
}

export function getStatusColor(status: shiftStatus) {
  switch (status) {
    case "confirmed":
      return "#10b981";
    case "pending":
      return "#f59e0b";
    case "canceled":
      return "#ef4444";
    default:
      return "#e6f7f7";
  }
}

export function checkIfDateIsInRange(date: Date, week: Date[]) {
  return !week.some(day => day.toISOString().split("T")[0] === date.toISOString().split("T")[0]);
}

export function mapShiftsToEvents(date: string, shifts: ShiftWithPatient[]) {
  const datedEvents: {
    [date: string]: TimelineProps['events'];
  } = {};

  const events = shifts.map(shift => {
    const start = new Date(`${date}T${shift.start_time}`);
    const end = new Date(start.getTime() + shift.duration * 60 * 1000);

    return {
      id: shift.id.toString(),
      title: `${shift.patient?.name} ${shift.patient?.lastname}`,
      start: start.toISOString(),
      end: end.toISOString(),
      color: getStatusColor(shift.status as shiftStatus),
    };
  });


  datedEvents[date] = events;

  return datedEvents;
}

export function getMarkedDates(shifts: ShiftWithPatient[]) : MarkedDates {
  const markedDates: MarkedDates = {};

  shifts.forEach(shift => {
    const date = shift.date;
    markedDates[date] = {marked: true};
  });
  return markedDates;
}