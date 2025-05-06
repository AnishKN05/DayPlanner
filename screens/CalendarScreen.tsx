
// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   Modal,
//   Button,
//   TextInput,
//   StyleSheet,
//   FlatList,
//   Platform,
// } from 'react-native';
// import { Calendar, DateObject } from 'react-native-calendars';
// import {
//   initDB,
//   insertTask,
//   fetchTasks,
//   removeTask,
//   markTaskCompleted,
// } from '../services/db';
// import { Task } from '../types';
// import * as Notifications from 'expo-notifications';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import uuid from 'react-native-uuid';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//   }),
// });

// export default function CalendarScreen() {
//   const [selectedDate, setSelectedDate] = useState<string>('');
//   const [modalVisible, setModalVisible] = useState<boolean>(false);
//   const [taskTitle, setTaskTitle] = useState<string>('');
//   const [taskTime, setTaskTime] = useState<Date>(new Date());
//   const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
//   const [tasksByDate, setTasksByDate] = useState<{ [key: string]: Task[] }>({});
//   const [markedDates, setMarkedDates] = useState<any>({});

//   useEffect(() => {
//     initDB();
//     loadAllTasks();
//   }, []);

//   const loadAllTasks = async () => {
//     const today = new Date().toISOString().split('T')[0];
//     try {
//       const tasksString = await AsyncStorage.getItem('tasks');
//       const allTasks: { [key: string]: Task[] } = tasksString
//         ? JSON.parse(tasksString)
//         : {};

//       const marks: any = {};
//       Object.keys(allTasks).forEach((date) => {
//         if (allTasks[date].length > 0) {
//           marks[date] = { marked: true, dotColor: 'blue' };
//         }
//       });
//       if (!marks[today]) {
//         marks[today] = { selected: true, selectedColor: 'green' };
//       }

//       setTasksByDate(allTasks);
//       setMarkedDates(marks);
//     } catch (error) {
//       console.error('Error loading tasks', error);
//     }
//   };

//   const handleDayPress = (day: DateObject) => {
//     setSelectedDate(day.dateString);
//     setModalVisible(true);
//   };

//   const handleAddTask = async () => {
//     if (taskTitle.trim() === '' || !selectedDate) return;

//     const timeString = taskTime.toTimeString().slice(0, 5);
//     const newTask: Task = {
//       id: uuid.v4().toString(),
//       title: taskTitle.trim(),
//       date: selectedDate,
//       time: timeString,
//       completed: false,
//     };

//     await insertTask(newTask);
//     scheduleExactNotification(newTask);
//     setTaskTitle('');
//     setTaskTime(new Date());
//     setModalVisible(false);
//     loadAllTasks();
//   };

//   const scheduleExactNotification = async (task: Task) => {
//     const [hour, minute] = task.time.split(':').map(Number);
//     const [year, month, day] = task.date.split('-').map(Number);
//     const triggerTimestamp = new Date(
//       year,
//       month - 1,
//       day,
//       hour,
//       minute
//     ).getTime();

//     await Notifications.scheduleNotificationAsync({
//       content: {
//         title: 'Task Reminder 📋',
//         body: `${task.title} at ${task.time}`,
//       },
//       trigger: { type: 'timestamp', timestamp: triggerTimestamp },
//     });
//   };

//   const handleDeleteTask = async (taskId: string) => {
//     await removeTask(selectedDate, taskId);
//     loadAllTasks();
//   };

//   const handleMarkComplete = async (taskId: string) => {
//     await markTaskCompleted(selectedDate, taskId);
//     loadAllTasks();
//   };

//   return (
//     <View style={styles.container}>
//       <Calendar
//         onDayPress={handleDayPress}
//         markedDates={markedDates}
//         theme={{
//           todayTextColor: 'red',
//           selectedDayBackgroundColor: '#00adf5',
//           selectedDayTextColor: '#ffffff',
//           dotColor: '#00adf5',
//           selectedDotColor: '#ffffff',
//           arrowColor: 'black',
//         }}
//       />

//       <Modal visible={modalVisible} animationType="slide" transparent>
//         <View style={styles.modal}>
//           <Text style={styles.modalTitle}>Tasks for {selectedDate}</Text>

//           <TextInput
//             value={taskTitle}
//             onChangeText={setTaskTitle}
//             placeholder="Enter new task"
//             style={styles.input}
//           />

//           <Button title="Pick Time" onPress={() => setShowTimePicker(true)} />
//           {showTimePicker && (
//             <DateTimePicker
//               value={taskTime}
//               mode="time"
//               is24Hour
//               display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//               onChange={(_, selected) => {
//                 if (selected) setTaskTime(selected);
//                 setShowTimePicker(false);
//               }}
//             />
//           )}

//           <Button title="Add Task" onPress={handleAddTask} />

//           <FlatList
//             data={tasksByDate[selectedDate] || []}
//             keyExtractor={(item, index) =>
//               item.id ? item.id.toString() : index.toString()
//             }
//             renderItem={({ item }) => (
//               <View style={styles.taskItem}>
//                 <Text
//                   style={[
//                     styles.taskText,
//                     item.completed && {
//                       textDecorationLine: 'line-through',
//                       color: 'gray',
//                     },
//                   ]}
//                 >
//                   {item.title} ({item.time})
//                 </Text>
//                 <View style={styles.taskButtons}>
//                   {!item.completed && (
//                     <Button
//                       title="Done"
//                       onPress={() => handleMarkComplete(item.id)}
//                     />
//                   )}
//                   <Button
//                     title="Delete"
//                     onPress={() => handleDeleteTask(item.id)}
//                     color="red"
//                   />
//                 </View>
//               </View>
//             )}
//           />

//           <Button
//             title="Close"
//             onPress={() => setModalVisible(false)}
//             color="red"
//           />
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
//     flex: 1,
//   },
//   input: {
//     borderColor: '#ccc',
//     borderWidth: 1,
//     padding: 10,
//     marginVertical: 10,
//     borderRadius: 5,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   taskItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginVertical: 5,
//   },
//   taskText: {
//     fontSize: 16,
//   },
//   taskButtons: {
//     flexDirection: 'row',
//     gap: 10,
//   },
// });
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  FlatList,
  Platform,
} from 'react-native';
import { Calendar, DateObject } from 'react-native-calendars';
import {
  initDB,
  insertTask,
  fetchTasks,
  removeTask,
  markTaskCompleted,
} from '../services/db';
import { Task } from '../types';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import uuid from 'react-native-uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [taskTime, setTaskTime] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [tasksByDate, setTasksByDate] = useState<{ [key: string]: Task[] }>({});
  const [markedDates, setMarkedDates] = useState<any>({});

  useEffect(() => {
    initDB();
    loadAllTasks();
  }, []);

  const loadAllTasks = async () => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const tasksString = await AsyncStorage.getItem('tasks');
      const allTasks: { [key: string]: Task[] } = tasksString
        ? JSON.parse(tasksString)
        : {};

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
  };

  const handleAddTask = async () => {
    if (taskTitle.trim() === '' || !selectedDate) return;

    const timeString = taskTime.toTimeString().slice(0, 5);
    const newTask: Task = {
      id: uuid.v4().toString(),
      title: taskTitle.trim(),
      date: selectedDate,
      time: timeString,
      completed: false,
    };

    await insertTask(newTask);
    scheduleExactNotification(newTask);
    setTaskTitle('');
    setTaskTime(new Date());
    loadAllTasks();
  };

  const scheduleExactNotification = async (task: Task) => {
    const [hour, minute] = task.time.split(':').map(Number);
    const [year, month, day] = task.date.split('-').map(Number);
    const triggerTimestamp = new Date(
      year,
      month - 1,
      day,
      hour,
      minute
    ).getTime();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Task Reminder 📋',
        body: `${task.title} at ${task.time}`,
      },
      trigger: { type: 'timestamp', timestamp: triggerTimestamp },
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

      {selectedDate !== '' && (
        <View style={styles.taskPanel}>
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
              is24Hour
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, selected) => {
                if (selected) setTaskTime(selected);
                setShowTimePicker(false);
              }}
            />
          )}

          <Button title="Add Task" onPress={handleAddTask} />

          <FlatList
            data={tasksByDate[selectedDate] || []}
            keyExtractor={(item, index) =>
              item.id ? item.id.toString() : index.toString()
            }
            renderItem={({ item }) => (
              <View style={styles.taskItem}>
                <Text
                  style={[
                    styles.taskText,
                    item.completed && {
                      textDecorationLine: 'line-through',
                      color: 'gray',
                    },
                  ]}
                >
                  {item.title} ({item.time})
                </Text>
                <View style={styles.taskButtons}>
                  {!item.completed && (
                    <Button
                      title="Done"
                      onPress={() => handleMarkComplete(item.id)}
                    />
                  )}
                  <Button
                    title="Delete"
                    onPress={() => handleDeleteTask(item.id)}
                    color="red"
                  />
                </View>
              </View>
            )}
          />

          <Button
            title="Hide Tasks"
            onPress={() => setSelectedDate('')}
            color="red"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 50 },
  taskPanel: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
    elevation: 5,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
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
