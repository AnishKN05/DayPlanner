
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import CalendarGrid from '../components/CalendarGrid';
import TaskList from '../components/TaskList';
import TaskModal from '../components/TaskModal';
import { insertTask, fetchTasks, removeTask } from '../services/db'; // AsyncStorage-based

const PlannerScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [tasksByDate, setTasksByDate] = useState<{ [date: string]: string[] }>({});

  // When a date is tapped:
  const handleDateSelect = async (date: string) => {
    setSelectedDate(date);
    // load any existing tasks
    const existing = await fetchTasks(date);
    setTasksByDate((prev) => ({ ...prev, [date]: existing }));
    setModalVisible(true);
  };

  // Save new task
  const handleSaveTask = async (task: string) => {
    if (!selectedDate) return;
    try {
      await insertTask(selectedDate, task);
      const updated = await fetchTasks(selectedDate);
      setTasksByDate((prev) => ({ ...prev, [selectedDate]: updated }));
    } catch {
      Alert.alert('Error', 'Could not save task');
    }
  };

  // Remove a task
  const handleRemoveTask = async (task: string) => {
    if (!selectedDate) return;
    try {
      await removeTask(selectedDate, task);
      const updated = await fetchTasks(selectedDate);
      setTasksByDate((prev) => ({ ...prev, [selectedDate]: updated }));
    } catch {
      Alert.alert('Error', 'Could not remove task');
    }
  };

  return (
    <View style={styles.container}>
      <CalendarGrid
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
      />

      <TaskList tasks={tasksByDate} selectedDate={selectedDate} />

      <TaskModal
        visible={modalVisible}
        selectedDate={selectedDate}
        onSave={handleSaveTask}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, backgroundColor: '#fff' },
});

export default PlannerScreen;
