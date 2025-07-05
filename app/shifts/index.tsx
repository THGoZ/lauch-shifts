import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Agenda, AgendaEntry, AgendaSchedule, DateData } from 'react-native-calendars';

// Aquamarine Color Palette
const colors = {
  light: {
    background: '#f8fdfd',
    foreground: '#0a2e2e',
    primary: '#4fd1c7',
    primaryForeground: '#ffffff',
    secondary: '#7dd3d8',
    secondaryForeground: '#1a4b4b',
    accent: '#40e0d0',
    accentForeground: '#0f3333',
    muted: '#e6f7f7',
    mutedForeground: '#5a7a7a',
    border: '#b8e6e6',
    destructive: '#ef4444',
    warning: '#f59e0b',
    success: '#10b981',
  },
};

// Interfaces based on SQLite schema
interface Patient {
  id: number;
  name: string;
  lastname: string;
  dni: string;
}

interface Shift {
  id: number;
  patient_id: number;
  date: string;
  start_time: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'canceled';
  reason_incomplete?: string;
  created_at: string;
  updated_at: string;
  patient?: Patient;
}

interface ShiftAgendaItem extends AgendaEntry {
  shift: Shift;
}

// Mock data
const mockPatients: Patient[] = [
  { id: 1, name: 'John', lastname: 'Doe', dni: '12345678A' },
  { id: 2, name: 'Jane', lastname: 'Smith', dni: '87654321B' },
  { id: 3, name: 'Maria', lastname: 'Garcia', dni: '11223344C' },
];

const mockShifts: Shift[] = [
  {
    id: 1,
    patient_id: 1,
    date: '2024-01-20',
    start_time: '09:00',
    duration: 60,
    status: 'confirmed',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
  },
  {
    id: 2,
    patient_id: 2,
    date: '2024-01-20',
    start_time: '14:30',
    duration: 90,
    status: 'pending',
    created_at: '2024-01-16T14:20:00Z',
    updated_at: '2024-01-16T14:20:00Z',
  },
  {
    id: 3,
    patient_id: 3,
    date: '2024-01-21',
    start_time: '11:00',
    duration: 45,
    status: 'canceled',
    reason_incomplete: 'Patient canceled',
    created_at: '2024-01-17T09:15:00Z',
    updated_at: '2024-01-17T09:15:00Z',
  },
  {
    id: 4,
    patient_id: 1,
    date: '2024-01-22',
    start_time: '16:00',
    duration: 120,
    status: 'confirmed',
    created_at: '2024-01-18T11:00:00Z',
    updated_at: '2024-01-18T11:00:00Z',
  },
];

export default function ShiftsScreen() {
  const [shifts, setShifts] = useState<Shift[]>(mockShifts);
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [agendaItems, setAgendaItems] = useState<AgendaSchedule>({});
  const [selectedDate, setSelectedDate] = useState<string>('');

/*   useEffect(() => {
    loadAgendaItems();
  }, [shifts, patients]); */

  const loadAgendaItems = () => {
    const items: AgendaSchedule = {};

    // Populate shifts with patient data
    const shiftsWithPatients = shifts.map(shift => ({
      ...shift,
      patient: patients.find(p => p.id === shift.patient_id),
    }));

    shiftsWithPatients.forEach(shift => {
      const dateKey = shift.date;
      
      if (!items[dateKey]) {
        items[dateKey] = [];
      }

      const agendaItem: ShiftAgendaItem = {
        name: `${shift.patient?.name} ${shift.patient?.lastname}`,
        height: 80,
        day: dateKey,
        shift: shift,
      };

      items[dateKey].push(agendaItem);
    });

    // Sort shifts by start time for each day
    Object.keys(items).forEach(date => {
      items[date].sort((a, b) => {
        const timeA = (a as ShiftAgendaItem).shift.start_time;
        const timeB = (b as ShiftAgendaItem).shift.start_time;
        return timeA.localeCompare(timeB);
      });
    });

    setAgendaItems(items);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return colors.light.success;
      case 'pending':
        return colors.light.warning;
      case 'canceled':
        return colors.light.destructive;
      default:
        return colors.light.mutedForeground;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'canceled':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDuration = (duration: number) => {
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

  const handleShiftPress = (shift: Shift) => {
    Alert.alert(
      'Shift Details',
      `Patient: ${shift.patient?.name} ${shift.patient?.lastname}\nTime: ${formatTime(shift.start_time)}\nDuration: ${formatDuration(shift.duration)}\nStatus: ${shift.status.charAt(0).toUpperCase() + shift.status.slice(1)}${shift.reason_incomplete ? `\nReason: ${shift.reason_incomplete}` : ''}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Edit', onPress: () => console.log('Edit shift', shift.id) },
      ]
    );
  };

  const renderItem = (item: AgendaEntry, isFirst: boolean) => {
    const shiftItem = item as ShiftAgendaItem;
    const shift = shiftItem.shift;
    const statusColor = getStatusColor(shift.status);
    const statusIcon = getStatusIcon(shift.status);

    return (
      <TouchableOpacity
        style={[styles.shiftCard, isFirst && styles.firstShiftCard]}
        onPress={() => handleShiftPress(shift)}
        activeOpacity={0.7}
      >
        <View style={styles.shiftHeader}>
          <View style={styles.timeContainer}>
            <Text style={styles.shiftTime}>{formatTime(shift.start_time)}</Text>
            <Text style={styles.shiftDuration}>{formatDuration(shift.duration)}</Text>
          </View>
          
          <View style={styles.shiftInfo}>
            <Text style={styles.patientName}>
              {shift.patient?.name} {shift.patient?.lastname}
            </Text>
            <Text style={styles.patientDni}>DNI: {shift.patient?.dni}</Text>
          </View>

          <View style={styles.statusContainer}>
            <Ionicons 
              name={statusIcon as any} 
              size={20} 
              color={statusColor} 
            />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {shift.status.charAt(0).toUpperCase() + shift.status.slice(1)}
            </Text>
          </View>
        </View>

        {shift.reason_incomplete && (
          <View style={styles.reasonContainer}>
            <Text style={styles.reasonText}>
              Reason: {shift.reason_incomplete}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyDate = () => (
    <View style={styles.emptyDate}>
      <Ionicons name="calendar-outline" size={32} color={colors.light.mutedForeground} />
      <Text style={styles.emptyDateText}>No shifts scheduled</Text>
    </View>
  );

  const renderKnob = () => (
    <View style={styles.knob} />
  );

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.light.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.light.foreground} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Shifts</Text>
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/shifts/create-recurring')}
        >
          <LinearGradient
            colors={[colors.light.primary, colors.light.accent]}
            style={styles.addButtonGradient}
          >
            <Ionicons name="add" size={24} color={colors.light.primaryForeground} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {shifts.filter(s => s.status === 'confirmed').length}
          </Text>
          <Text style={styles.statLabel}>Confirmed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {shifts.filter(s => s.status === 'pending').length}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {shifts.filter(s => s.status === 'canceled').length}
          </Text>
          <Text style={styles.statLabel}>Canceled</Text>
        </View>
      </View>

      <Agenda
        items={agendaItems}
        loadItemsForMonth={() => {}}
        selected={selectedDate || new Date().toISOString().split('T')[0]}
        renderItem={renderItem}
        renderEmptyDate={renderEmptyDate}
        renderKnob={renderKnob}
        onDayPress={onDayPress}
        pastScrollRange={50}
        futureScrollRange={50}
        showClosingKnob={true}
        theme={{
          backgroundColor: colors.light.background,
          calendarBackground: colors.light.background,
          textSectionTitleColor: colors.light.foreground,
          selectedDayBackgroundColor: colors.light.primary,
          selectedDayTextColor: colors.light.primaryForeground,
          todayTextColor: colors.light.primary,
          dayTextColor: colors.light.foreground,
          textDisabledColor: colors.light.mutedForeground,
          dotColor: colors.light.primary,
          selectedDotColor: colors.light.primaryForeground,
          arrowColor: colors.light.primary,
          monthTextColor: colors.light.foreground,
          indicatorColor: colors.light.primary,
          textDayFontWeight: '500',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '600',
          agendaDayTextColor: colors.light.foreground,
          agendaDayNumColor: colors.light.primary,
          agendaTodayColor: colors.light.primary,
          agendaKnobColor: colors.light.border,
          reservationsBackgroundColor: colors.light.muted,
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.light.foreground,
  },
  addButton: {
    borderRadius: 20,
  },
  addButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: colors.light.background,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.light.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: colors.light.mutedForeground,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.light.border,
    marginHorizontal: 16,
  },
  shiftCard: {
    backgroundColor: colors.light.background,
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
    shadowColor: colors.light.foreground,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  firstShiftCard: {
    marginTop: 16,
  },
  shiftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeContainer: {
    marginRight: 16,
    alignItems: 'center',
    minWidth: 60,
  },
  shiftTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.light.foreground,
  },
  shiftDuration: {
    fontSize: 12,
    color: colors.light.mutedForeground,
    marginTop: 2,
  },
  shiftInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.foreground,
    marginBottom: 2,
  },
  patientDni: {
    fontSize: 12,
    color: colors.light.mutedForeground,
  },
  statusContainer: {
    alignItems: 'center',
    minWidth: 70,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  reasonContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
  },
  reasonText: {
    fontSize: 14,
    color: colors.light.mutedForeground,
    fontStyle: 'italic',
  },
  emptyDate: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  emptyDateText: {
    fontSize: 16,
    color: colors.light.mutedForeground,
    marginTop: 8,
  },
  knob: {
    width: 40,
    height: 4,
    backgroundColor: colors.light.border,
    borderRadius: 2,
    marginVertical: 8,
  },
});