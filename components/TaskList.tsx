// components/TaskList.tsx
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

interface TaskListProps {
  tasks: { [key: string]: string[] };
  selectedDate: string;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, selectedDate }) => {
  const taskList = tasks[selectedDate] || [];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tasks for {selectedDate}</Text>
      <FlatList
        data={taskList}
        keyExtractor={(item, index) => `${selectedDate}-${index}`}
        renderItem={({ item }) => <Text style={styles.taskItem}>• {item}</Text>}
        ListEmptyComponent={<Text style={styles.noTasks}>No tasks for this date</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  taskItem: {
    fontSize: 14,
    paddingVertical: 2,
  },
  noTasks: {
    fontStyle: 'italic',
    color: '#666',
  },
});

export default TaskList;
