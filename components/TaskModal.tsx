
import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet } from 'react-native';

interface TaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (task: string) => void;
  selectedDate: string;
}

const TaskModal: React.FC<TaskModalProps> = ({ visible, onClose, onSave, selectedDate }) => {
  const [task, setTask] = useState('');

  const handleSave = () => {
    onSave(task);
    setTask('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Add Task for {selectedDate}</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your task"
            value={task}
            onChangeText={setTask}
          />
          <Button title="Save Task" onPress={handleSave} />
          <Button title="Cancel" onPress={onClose} color="red" />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
  },
  container: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    padding: 8,
  },
});

export default TaskModal;
