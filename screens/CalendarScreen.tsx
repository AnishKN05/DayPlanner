import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Button, TextInput, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { openDatabase } from 'expo-sqlite';

const db = openDatabase('tasks.db');

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [task, setTask] = useState('');
  const [markedDates, setMarkedDates] = useState({});

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, task TEXT);'
      );
    });
  }, []);

  const addTask = () => {
    db.transaction(tx => {
      tx.executeSql('INSERT INTO tasks (date, task) VALUES (?, ?);', [selectedDate, task]);
    });
    setMarkedDates({
      ...markedDates,
      [selectedDate]: { marked: true, dotColor: 'blue' }
    });
    setTask('');
    setModalVisible(false);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={day => {
          setSelectedDate(day.dateString);
          setModalVisible(true);
        }}
        markedDates={{
          [today]: { selected: true, selectedColor: 'green' },
          ...markedDates,
        }}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modal}>
          <Text>Add Task for {selectedDate}</Text>
          <TextInput
            value={task}
            onChangeText={setTask}
            placeholder="Enter task"
            style={styles.input}
          />
          <Button title="Add Task" onPress={addTask} />
          <Button title="Close" onPress={() => setModalVisible(false)} />
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
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
  },
});
