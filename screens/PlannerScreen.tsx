// import React, { useState, useEffect } from 'react';
// import { View, StyleSheet, Button, Alert } from 'react-native';
// import CalendarView from '../components/CalendarView';
// import TaskModal from '../components/TaskModal';
// import TaskList from '../components/TaskList';
// import { initDB, insertTask, fetchTasks } from '../services/db';

// const PlannerScreen = () => {
//   const [selectedDate, setSelectedDate] = useState('');
//   const [modalVisible, setModalVisible] = useState(false);
//   const [tasks, setTasks] = useState<{ [key: string]: string[] }>({});

//   useEffect(() => {
//     initDB();
//   }, []);

//   const handleDateSelect = (date: string) => {
//     setSelectedDate(date);
//     setModalVisible(true);
//   };

//   const handleSaveTask = async (task: string) => {
//     try {
//       await insertTask(selectedDate, task);
//       const updatedTasks = await fetchTasks(selectedDate);
//       setTasks(prev => ({ ...prev, [selectedDate]: updatedTasks }));
//     } catch (err) {
//       Alert.alert('Error', 'Failed to save task.');
//     }
//   };

//   useEffect(() => {
//     if (selectedDate) {
//       fetchTasks(selectedDate).then(taskList => {
//         setTasks(prev => ({ ...prev, [selectedDate]: taskList }));
//       });
//     }
//   }, [selectedDate]);

//   return (
//     <View style={styles.container}>
//       <CalendarView onDateSelect={handleDateSelect} />
//       <TaskList tasks={tasks} selectedDate={selectedDate} />
//       <TaskModal
//         visible={modalVisible}
//         onClose={() => setModalVisible(false)}
//         onSave={handleSaveTask}
//         selectedDate={selectedDate}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingTop: 50,
//   },
// });

// export default PlannerScreen;
import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, FlatList, StyleSheet } from 'react-native';
import { insertTask, fetchTasks, removeTask } from '../services/db'; // Update with correct path to your db.js file

export default function PlannerScreen() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('2025-04-25'); // Use the actual selected date

  useEffect(() => {
    const loadTasks = async () => {
      const loadedTasks = await fetchTasks(selectedDate);
      setTasks(loadedTasks);
    };

    loadTasks();
  }, [selectedDate]);

  const handleAddTask = async () => {
    if (task.trim()) {
      await insertTask(selectedDate, task);
      setTask('');
      const updatedTasks = await fetchTasks(selectedDate);
      setTasks(updatedTasks);
    }
  };

  const handleRemoveTask = async (taskToRemove: string) => {
    await removeTask(selectedDate, taskToRemove);
    const updatedTasks = await fetchTasks(selectedDate);
    setTasks(updatedTasks);
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={task}
        onChangeText={setTask}
        placeholder="Enter a task"
        style={styles.input}
      />
      <Button title="Add Task" onPress={handleAddTask} />
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text>{item}</Text>
            <Button title="Remove" onPress={() => handleRemoveTask(item)} />
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 8,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
});
