import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface CalendarGridProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  selectedDate,
  onDateSelect,
}) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-based

  const firstWeekday = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

  const cells = Array.from({ length: cellCount }, (_, i) => {
    const dayNum = i - firstWeekday + 1;
    return dayNum >= 1 && dayNum <= daysInMonth ? dayNum : null;
  });

  return (
    <View style={styles.container}>
      {/* Weekday headers */}
      <View style={styles.weekdays}>
        {['Sun', 'Mon', 'Tues', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <Text key={d} style={styles.weekdayText}>
            {d}
          </Text>
        ))}
      </View>

      {/* Date cells */}
      <View style={styles.grid}>
        {cells.map((day, idx) => {
          const dateString = day
            ? `${year}-${(month + 1).toString().padStart(2, '0')}-${day
                .toString()
                .padStart(2, '0')}`
            : '';
          const isToday = day === today.getDate();
          const isSelected = dateString === selectedDate;

          return (
            <Pressable
              key={idx}
              onPress={() => day && onDateSelect(dateString)}
              style={[
                styles.cell,
                isToday && styles.today,
                isSelected && styles.selected,
              ]}
            >
              <Text style={styles.cellText}>{day ?? ''}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10 },
  weekdays: { flexDirection: 'row', marginBottom: 4 },
  weekdayText: { flex: 1, textAlign: 'center', fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  cellText: { fontSize: 14 },
  today: { backgroundColor: '#def', borderRadius: 4 },
  selected: { borderWidth: 1, borderColor: '#00f', borderRadius: 4 },
});

export default CalendarGrid;
