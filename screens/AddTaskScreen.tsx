import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';

export default function AddTaskScreen() {
  const [task, setTask] = useState('');

  const handleAdd = () => {
    // Save to DB
    console.log("Task Added:", task);
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Enter your task"
        style={styles.input}
        onChangeText={setTask}
        value={task}
      />
      <Button title="Save Task" onPress={handleAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
});
