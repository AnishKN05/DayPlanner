// import React, { useState, useEffect } from 'react';
// import { View, Text, Modal, Button, TextInput, StyleSheet } from 'react-native';
// import { Calendar } from 'react-native-calendars';
// import { openDatabase } from 'expo-sqlite';

// const db = openDatabase('tasks.db');

// export default function CalendarScreen() {
//   const [selectedDate, setSelectedDate] = useState('');
//   const [modalVisible, setModalVisible] = useState(false);
//   const [task, setTask] = useState('');
//   const [markedDates, setMarkedDates] = useState({});

//   useEffect(() => {
//     db.transaction(tx => {
//       tx.executeSql(
//         'CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, task TEXT);'
//       );
//     });
//   }, []);

//   const addTask = () => {
//     db.transaction(tx => {
//       tx.executeSql('INSERT INTO tasks (date, task) VALUES (?, ?);', [selectedDate, task]);
//     });
//     setMarkedDates({
//       ...markedDates,
//       [selectedDate]: { marked: true, dotColor: 'blue' }
//     });
//     setTask('');
//     setModalVisible(false);
//   };

//   const today = new Date().toISOString().split('T')[0];

//   return (
//     <View style={styles.container}>
//       <Calendar
//         onDayPress={day => {
//           setSelectedDate(day.dateString);
//           setModalVisible(true);
//         }}
//         markedDates={{
//           [today]: { selected: true, selectedColor: 'green' },
//           ...markedDates,
//         }}
//       />

//       <Modal visible={modalVisible} animationType="slide" transparent>
//         <View style={styles.modal}>
//           <Text>Add Task for {selectedDate}</Text>
//           <TextInput
//             value={task}
//             onChangeText={setTask}
//             placeholder="Enter task"
//             style={styles.input}
//           />
//           <Button title="Add Task" onPress={addTask} />
//           <Button title="Close" onPress={() => setModalVisible(false)} />
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, marginTop: 50 },
//   modal: {
//     backgroundColor: 'white',
//     padding: 20,
//     margin: 20,
//     borderRadius: 10,
//     elevation: 5,
//   },
//   input: {
//     borderColor: '#ccc',
//     borderWidth: 1,
//     padding: 10,
//     marginVertical: 10,
//   },
// });
// src/screens/CalendarScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Button, TextInput, StyleSheet, FlatList, Platform } from 'react-native';
import { Calendar, DateObject } from 'react-native-calendars';
import { initDB, insertTask, fetchTasks, removeTask, markTaskCompleted } from '../services/db';
import { Task } from '../types';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import uuid from 'react-native-uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskTime, setTaskTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tasksByDate, setTasksByDate] = useState<{ [key: string]: Task[] }>({});
  const [markedDates, setMarkedDates] = useState({});

  useEffect(() => {
    initDB();
    loadAllTasks();
  }, []);

  const loadAllTasks = async () => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const tasksString = await AsyncStorage.getItem('tasks');
      const allTasks = tasksString ? JSON.parse(tasksString) : {};

      const marks: any = {};

      Object.keys(allTasks).forEach((date) => {
        if (allTasks[date].length > 0) {
          marks[date] = { marked: true, dotColor: 'blue' };
        }
      });

      if (!marks[today]) {
        marks[today] = { selected: true, selectedColor: 'green' };
      }

      setTasksByDate(allTasks);
      setMarkedDates(marks);
    } catch (error) {
      console.error('Error loading tasks', error);
    }
  };

  const handleDayPress = (day: DateObject) => {
    setSelectedDate(day.dateString);
    setModalVisible(true);
  };

  const handleAddTask = async () => {
    if (taskTitle.trim() === '') return;

    const timeString = taskTime.toTimeString().slice(0, 5); // HH:MM

    const newTask: Task = {
      id: uuid.v4().toString(),
      title: taskTitle,
      date: selectedDate,
      time: timeString,
      completed: false,
    };

    await insertTask(newTask);
    scheduleExactNotification(newTask);

    setTaskTitle('');
    setTaskTime(new Date());
    setModalVisible(false);
    loadAllTasks();
  };

  const scheduleExactNotification = async (task: Task) => {
    const [hour, minute] = task.time.split(':').map(Number);
    const [year, month, day] = task.date.split('-').map(Number);

    const scheduledDate = new Date(year, month - 1, day, hour, minute);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Task Reminder 📋',
        body: 'You have a task due!',
      },
      trigger: scheduledDate,
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    await removeTask(selectedDate, taskId);
    loadAllTasks();
  };

  const handleMarkComplete = async (taskId: string) => {
    await markTaskCompleted(selectedDate, taskId);
    loadAllTasks();
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={markedDates}
        theme={{
          todayTextColor: 'red',
          selectedDayBackgroundColor: '#00adf5',
          selectedDayTextColor: '#ffffff',
          dotColor: '#00adf5',
          selectedDotColor: '#ffffff',
          arrowColor: 'black',
        }}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Tasks for {selectedDate}</Text>

          <TextInput
            value={taskTitle}
            onChangeText={setTaskTitle}
            placeholder="Enter new task"
            style={styles.input}
          />

          <Button title="Pick Time" onPress={() => setShowTimePicker(true)} />

          {showTimePicker && (
            <DateTimePicker
              value={taskTime}
              mode="time"
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedTime) => {
                if (selectedTime) setTaskTime(selectedTime);
                setShowTimePicker(false);
              }}
            />
          )}

          <Button title="Add Task" onPress={handleAddTask} />

          <FlatList
            data={tasksByDate[selectedDate] || []}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.taskItem}>
                <Text style={[styles.taskText, item.completed && { textDecorationLine: 'line-through', color: 'gray' }]}>
                  {item.title} ({item.time})
                </Text>
                <View style={styles.taskButtons}>
                  {!item.completed && (
                    <Button title="Done" onPress={() => handleMarkComplete(item.id)} />
                  )}
                  <Button title="Delete" onPress={() => handleDeleteTask(item.id)} color="red" />
                </View>
              </View>
            )}
          />

          <Button title="Close" onPress={() => setModalVisible(false)} color="red" />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 50 },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
    elevation: 5,
    flex: 1,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  taskText: {
    fontSize: 16,
  },
  taskButtons: {
    flexDirection: 'row',
    gap: 10,
  },
});
