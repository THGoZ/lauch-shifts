import { Patient } from "@/db/schema";


interface ShiftWithPatient {
  id: number;
  date: string;
  start_time: string;
  duration: number;
  status: string;
  details: string | null;
  patient?: Patient
  reason_incomplete?: string | null;
  reprogramed?: boolean | null;
}

interface ShiftUpdate {
  date?: string;
  start_time?: string;
  duration?: number;
  status?: "pending" | "confirmed" | "canceled";
  reason_incomplete?: string | null;
  details?: string | null;
  reprogramed?: boolean | null;
}

interface ResultItem<T> {
  success: boolean;
  message: string;
  result: T;
  error?: any;
  extraData?: Record<string, any>;
}

type FieldError = {
  field: string;
  message: string;
};

interface PagedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}