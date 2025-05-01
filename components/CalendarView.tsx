
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar, DateObject } from 'react-native-calendars';

interface CalendarViewProps {
  onDateSelect: (date: string) => void;
  markedDates: any;
}

const CalendarView: React.FC<CalendarViewProps> = ({ onDateSelect, markedDates }) => {
  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={(day: DateObject) => onDateSelect(day.dateString)}
        markedDates={markedDates}
        markingType="custom"
        enableSwipeMonths={true}
        theme={{
          todayTextColor: 'green',
          selectedDayBackgroundColor: 'green',
          arrowColor: 'black',
          monthTextColor: 'black',
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
});

export default CalendarView;
