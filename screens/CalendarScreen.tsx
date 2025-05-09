
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  FlatList,
  Platform,
  ScrollView,
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
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [previousTasks, setPreviousTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [showPrevious, setShowPrevious] = useState<boolean>(false);
  const [showCompleted, setShowCompleted] = useState<boolean>(false);

  useEffect(() => {
    initDB();
    loadAllTasks();
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const storedTheme = await AsyncStorage.getItem('theme');
    if (storedTheme === 'dark') setIsDarkMode(true);
  };

  useEffect(() => {
    AsyncStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    return `${day}-${month}`;
  };

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

      const upcoming: Task[] = [];
      const previous: Task[] = [];
      const completed: Task[] = [];

      Object.entries(allTasks).forEach(([date, tasks]) => {
        tasks.forEach((task) => {
          if (task.completed) {
            completed.push(task);
          } else if (date >= today) {
            upcoming.push(task);
          } else {
            previous.push(task);
          }
        });
      });

      setTasksByDate(allTasks);
      setMarkedDates(marks);
      setUpcomingTasks(upcoming);
      setPreviousTasks(previous);
      setCompletedTasks(completed);
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
    const triggerTimestamp = new Date(year, month - 1, day, hour, minute).getTime();

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

  const themeColors = {
    background: isDarkMode ? '#121212' : '#f2f2f2',
    text: isDarkMode ? '#ffffff' : '#000000',
    inputBg: isDarkMode ? '#2a2a2a' : '#ffffff',
    inputText: isDarkMode ? '#ffffff' : '#000000',
    placeholder: isDarkMode ? '#aaa' : '#666',
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Button
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          onPress={() => setIsDarkMode((prev) => !prev)}
          color={isDarkMode ? '#888' : '#000'}
        />

        <Calendar
          onDayPress={handleDayPress}
          markedDates={markedDates}
          theme={{
            backgroundColor: themeColors.background,
            calendarBackground: themeColors.background,
            textSectionTitleColor: isDarkMode ? '#ccc' : '#222',
            selectedDayBackgroundColor: isDarkMode ? '#1e90ff' : '#00adf5',
            selectedDayTextColor: '#fff',
            todayTextColor: isDarkMode ? '#ff6347' : 'red',
            dayTextColor: themeColors.text,
            textDisabledColor: isDarkMode ? '#444' : '#ccc',
            dotColor: isDarkMode ? '#1e90ff' : '#00adf5',
            arrowColor: themeColors.text,
            monthTextColor: themeColors.text,
          }}
        />

        {/* UPCOMING TASKS */}
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Upcoming Tasks</Text>
        {upcomingTasks.length === 0 ? (
          <Text style={{ color: themeColors.text }}>No upcoming tasks.</Text>
        ) : (
          upcomingTasks.map((task) => (
            <Text key={task.id} style={{ color: themeColors.text }}>
              {formatDate(task.date)}{"\n"}{task.time} - {task.title}
            </Text>
          ))
        )}

        {/* PREVIOUS TASKS */}
        <Button
          title={showPrevious ? 'Hide Previous Tasks' : 'Show Previous Tasks'}
          onPress={() => setShowPrevious(!showPrevious)}
        />
        {showPrevious && (
          <>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Previous Tasks</Text>
            {previousTasks.length === 0 ? (
              <Text style={{ color: themeColors.text }}>No previous tasks.</Text>
            ) : (
              previousTasks.map((task) => (
                <Text key={task.id} style={{ color: themeColors.text }}>
                  {formatDate(task.date)}{"\n"}{task.time} - {task.title}
                </Text>
              ))
            )}
          </>
        )}

        {/* COMPLETED TASKS */}
        <Button
          title={showCompleted ? 'Hide Completed Tasks' : 'Show Completed Tasks'}
          onPress={() => setShowCompleted(!showCompleted)}
        />
        {showCompleted && (
          <>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Completed Tasks</Text>
            {completedTasks.length === 0 ? (
              <Text style={{ color: themeColors.text }}>No completed tasks.</Text>
            ) : (
              completedTasks.map((task) => (
                <Text key={task.id} style={{ color: themeColors.text }}>
                  {formatDate(task.date)}{"\n"}{task.time} - {task.title} <Text style={{ fontStyle: 'italic' }}>(task completed)</Text>
                </Text>
              ))
            )}
          </>
        )}

        {selectedDate !== '' && (
          <View style={[styles.taskPanel, { backgroundColor: themeColors.inputBg }]}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>
              Tasks for {selectedDate}
            </Text>

            <TextInput
              value={taskTitle}
              onChangeText={setTaskTitle}
              placeholder="Enter new task"
              placeholderTextColor={themeColors.placeholder}
              style={[
                styles.input,
                {
                  backgroundColor: themeColors.inputBg,
                  color: themeColors.inputText,
                },
              ]}
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
                      { color: themeColors.text },
                    ]}
                  >
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

            <Button title="Hide Tasks" onPress={() => setSelectedDate('')} color="red" />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    paddingTop: 50,
  },
  taskPanel: {
    padding: 20,
    marginVertical: 20,
    borderRadius: 10,
    elevation: 3,
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
    marginVertical: 8,
  },
  taskText: {
    fontSize: 16,
    flex: 1,
  },
  taskButtons: {
    flexDirection: 'row',
    gap: 10,
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
});
