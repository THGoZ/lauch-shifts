import { usePatients } from "@/context/PatientsContext";
import { useToast } from "@/context/ToastContext";
import { Patient } from "@/db/schema";
import { useEffect, useState } from "react";

interface UsePatientDetails {
    patientId: string | undefined;
}

export function usePatientDetails({ patientId }: UsePatientDetails) {
    const { getPatient } = usePatients();
    const { showToast } = useToast();
    const [patient, setPatient] = useState<Patient | undefined>(undefined);

    useEffect(() => {
        const fetchData = async () => {
            const result = await fetchPatient();
            if (!result) return;
            setPatient(result);
        };
        fetchData();
    }, [patientId]);

    const fetchPatient = async () => {
        if (!patientId) return;
        const result = await getPatient(parseInt(patientId));
        if (!result.success) {
            showToast("error", "Error loading patient", result.error.message);
            return;
        }
        return result.result;
    }

    return { patient };
}