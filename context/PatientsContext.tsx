import { Patient as PatientDB } from "@/db/domain/patients/patient";
import { Filter, SortValue } from "@/db/domain/utils/queryHandle";
import { Patient, patient } from "@/db/schema";
import { returnResult } from "@/domain/entities/db-result";
import { PagedResult, ResultItem } from "@/interfaces/interface";
import { createContext, useContext, useEffect, useState } from "react";

interface PatientsContextType {
  patients: PagedResult<Patient>;
  patientsCount: number;
  getPatients: (
    search?: string,
    page?: number,
    limit?: number,
    filters?: Filter<typeof patient>[],
    sort?: SortValue<typeof patient>
  ) => Promise<ResultItem<PagedResult<Patient>>>;
  getPatient: (id: number) => Promise<ResultItem<Patient>>;
  addPatient: (patient: Patient) => Promise<ResultItem<Patient>>;
  updatePatient: (patient: Patient) => Promise<ResultItem<Patient>>;
  deletePatient: (patientId: number) => Promise<ResultItem<void>>;
  countPatients: () => Promise<ResultItem<number>>;
  isLoading: boolean;
}

const PatientsContext = createContext<PatientsContextType | undefined>(
  undefined
);

export const PatientsProvder: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [patients, setPatients] = useState<PagedResult<Patient>>({
    data: [],
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [patientsCount, setPatientsCount] = useState<number>(0);

  const getPatients = async (
    search?: string,
    page = 1,
    limit = 10,
    filters: Filter<typeof patient>[] = [],
    sort?: SortValue<typeof patient>
  ): Promise<ResultItem<PagedResult<Patient>>> => {
    setIsLoading(true);
    try {
      const response = await PatientDB.getAll(search, page, limit, filters, sort);
      setPatients(response);
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

  const getPatient = async (id: number): Promise<ResultItem<Patient>> => {
    setIsLoading(true);
    try {
      const response = await PatientDB.getById(id);
      return returnResult("Patiente obtenido correctamente", true, response);
    } catch (error) {
      if (error instanceof Error) {
        return returnResult(error.message, false, null, error);
      }
      return returnResult("Error al obtener el paciente", false, null, error);
    } finally {
      setIsLoading(false);
    }
  };

  const addPatient = async (patient: Patient): Promise<ResultItem<Patient>> => {
    setIsLoading(true);
    try {
      const response = await PatientDB.create(patient);
      return returnResult("Patiente creado correctamente", true, response);
    } catch (error) {
      if (error instanceof Error) {
        return returnResult(error.message, false, null, error);
      }
      return returnResult("Error al crear el paciente", false, null, error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePatient = async (
    patient: Patient
  ): Promise<ResultItem<Patient>> => {
    setIsLoading(true);
    try {
      const response = await PatientDB.update(patient);
      return returnResult("Patiente actualizado correctamente", true, response);
    } catch (error) {
      if (error instanceof Error) {
        return returnResult(error.message, false, null, error);
      }
      return returnResult(
        "Error al actualizar el paciente",
        false,
        null,
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  const deletePatient = async (patientId: number) => {
    setIsLoading(true);
    try {
      await PatientDB.delete(patientId);
      return returnResult("Patiente eliminado correctamente", true, null);
    } catch (error) {
      if (error instanceof Error) {
        return returnResult(error.message, false, null, error);
      }
      return returnResult("Error al eliminar el paciente", false, null, error);
    } finally {
      setIsLoading(false);
    }
  };

  const countPatients = async () => {
    setIsLoading(true);
    try {
      const response = await PatientDB.countPatients();
      setPatientsCount(response);
      return returnResult(
        "Número de pacientes obtenidos correctamente",
        true,
        response
      );
    } catch (error) {
      if (error instanceof Error) {
        return returnResult(error.message, false, null, error);
      }
      return returnResult(
        "Error al obtener el número de pacientes",
        false,
        null,
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    countPatients();
  }, []);

  return (
    <PatientsContext.Provider
      value={{
        patients,
        patientsCount,
        getPatients,
        getPatient,
        addPatient,
        updatePatient,
        deletePatient,
        countPatients,
        isLoading,
      }}
    >
      {children}
    </PatientsContext.Provider>
  );
};

export const usePatients = () => {
  const context = useContext(PatientsContext);
  if (context === undefined) {
    throw new Error("usePatients must be used within a PatientsProvider");
  }
  return context;
};
