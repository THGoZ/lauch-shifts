import { Shifts as ShiftsDB } from "@/db/domain/shifts/shifts";
import { Filter } from "@/db/domain/utils/queryHandle";
import { shift, Shift } from "@/db/schema";
import { returnResult } from "@/domain/entities/db-result";
import { CustomError } from "@/domain/entities/error-entity";
import { PagedResult, ResultItem, ShiftWithPatient } from "@/interfaces/interface";
import { createContext, useContext, useEffect, useState } from "react";

interface ShiftsContextType {
  shifts: PagedResult<ShiftWithPatient>;
  activeShiftsCount: number;
  getShifts: (
    search?: string,
    filters?: Filter<typeof shift>[],
    include_patient?: boolean,
    page?: number,
    limit?: number
  ) => Promise<ResultItem<PagedResult<ShiftWithPatient>>>;
  addShift: (shift: Omit<Shift, "id">) => Promise<ResultItem<Shift>>;
  updateShift: (id: number, shift: Partial<Omit<Shift, "id">>) => Promise<void>;
  addShiftBulk: (shifts: Omit<Shift, "id">[]) => Promise<boolean>;
  deleteShift: (id: number) => Promise<void>;
  getShiftByDate: (date: string) => Promise<ShiftWithPatient[]>;
  getPureShifts: () => Promise<Shift[]>;
  getPureShiftsOfDate: (date: string) => Promise<Shift[]>;
  countActiveShifts: () => Promise<void>;
  error: CustomError | null;
  isLoading: boolean;
}

const ShiftsContext = createContext<ShiftsContextType | undefined>(undefined);

export const ShiftsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [shifts, setShifts] = useState<PagedResult<ShiftWithPatient>>({
    data: [],
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [error, setError] = useState<CustomError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeShiftsCount, setShiftsActiveCount] = useState<number>(0);

  const getShifts = async (
    search?: string,
    filters?: Filter<typeof shift>[],
    include_patient = true,
    page?: number,
    limit?: number
  ): Promise<ResultItem<PagedResult<ShiftWithPatient>>> => {
    setIsLoading(true);
    try {
      const response = await ShiftsDB.getShifts(
        search,
        filters,
        include_patient,
        page,
        limit
      );
      setShifts(response);
      return returnResult("Patientes obtenidos correctamente", true, response);
    } catch (error) {
      if (error instanceof Error) {
        return returnResult(error.message, false, null, error);
      }
      return returnResult("Error al obtener los pacientes", false, null, error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPureShifts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await ShiftsDB.getPureShifts();
      return response;
    } catch (error) {
      if (error instanceof CustomError) {
        setError(error);
        return [];
      } else {
        setError(new CustomError("Error al obtener los turnos"));
        return [];
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPureShiftsOfDate = async (date: string): Promise<Shift[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await ShiftsDB.getAllOfDate(date);
      return response;
    } catch (error) {
      if (error instanceof CustomError) {
        setError(error);
        return [];
      } else {
        setError(new CustomError("Error al obtener los turnos"));
        return [];
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addShift = async (
    shift: Omit<Shift, "id">
  ): Promise<ResultItem<Shift>> => {
    setIsLoading(true);
    try {
      const response = await ShiftsDB.create(shift);
      return returnResult("Turno creado correctamente", true, response);
    } catch (error) {
      if (error instanceof Error) {
        return returnResult(error.message, false, null, error);
      }
      return returnResult("Error al crear turno", false, null, error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateShift = async (id: number, shift: Partial<Omit<Shift, "id">>) => {
    setIsLoading(true);
    setError(null);
    try {
      await ShiftsDB.update(id, shift);
      await getShifts();
    } catch (error) {
      if (error instanceof CustomError) {
        setError(error);
      } else {
        setError(new CustomError("Error al actualizar el turno"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const deleteShift = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await ShiftsDB.delete(id);
      await getShifts();
    } catch (error) {
      if (error instanceof CustomError) {
        setError(error);
      } else {
        setError(new CustomError("Error al eliminar el turno"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addShiftBulk = async (shifts: Omit<Shift, "id">[]) => {
    setIsLoading(true);
    setError(null);
    try {
      await ShiftsDB.createBulk(shifts);
      await getShifts();
      return true;
    } catch (error) {
      if (error instanceof CustomError) {
        setError(error);
        return false;
      } else {
        setError(new CustomError("Error al crear los turnos"));
        return false;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getShiftByDate = async (date: string): Promise<ShiftWithPatient[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await ShiftsDB.getAllOfDate(date);
      return response;
    } catch (error) {
      if (error instanceof CustomError) {
        setError(error);
        return [];
      } else {
        setError(new CustomError("Error al obtener los turnos"));
        return [];
      }
    } finally {
      setIsLoading(false);
    }
  };

  const countActiveShifts = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await ShiftsDB.countActiveShifts();
      setShiftsActiveCount(response);
    } catch (error) {
      if (error instanceof CustomError) {
        setError(error);
      } else {
        setError(
          new CustomError("Error al obtener el número de turnos activos")
        );
      }
      setShiftsActiveCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    countActiveShifts();
  }, []);

  return (
    <ShiftsContext.Provider
      value={{
        shifts,
        getShifts,
        addShift,
        updateShift,
        addShiftBulk,
        deleteShift,
        getShiftByDate,
        getPureShifts,
        getPureShiftsOfDate,
        activeShiftsCount,
        countActiveShifts,
        error,
        isLoading,
      }}
    >
      {children}
    </ShiftsContext.Provider>
  );
};

export const useShifts = () => {
  const context = useContext(ShiftsContext);
  if (context === undefined) {
    throw new Error("useShifts must be used within a ShiftsProvider");
  }
  return context;
};
