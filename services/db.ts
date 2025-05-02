
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types';


const TASKS_KEY = 'tasks';


export const initDB = async () => {
  try {
    const storedTasks = await AsyncStorage.getItem(TASKS_KEY);
    if (storedTasks === null) {
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify({}));
    }
  } catch (error) {
    console.error('Failed to initialize the database', error);
  }
};


export const insertTask = async (task: Task): Promise<boolean> => {
  try {
    if (!task || !task.id || !task.title || !task.date) {
      console.error('Invalid task structure:', task);
      return false;
    }

    const tasksString = await AsyncStorage.getItem(TASKS_KEY);
    const tasks = tasksString ? JSON.parse(tasksString) : {};

    const existingTasks: Task[] = tasks[task.date] || [];
    tasks[task.date] = [...existingTasks, task];

    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    return true;
  } catch (error) {
    console.error('Failed to insert task', error);
    return false;
  }
};

// Fetch tasks for a particular date
export const fetchTasks = async (date: string): Promise<Task[]> => {
  try {
    const tasksString = await AsyncStorage.getItem(TASKS_KEY);
    const tasks = tasksString ? JSON.parse(tasksString) : {};

    return tasks[date] || [];
  } catch (error) {
    console.error('Failed to fetch tasks', error);
    return [];
  }
};


export const removeTask = async (date: string, taskId: string): Promise<boolean> => {
  try {
    const tasksString = await AsyncStorage.getItem(TASKS_KEY);
    const tasks = tasksString ? JSON.parse(tasksString) : {};

    const filteredTasks = tasks[date]?.filter((task: Task) => task.id !== taskId) || [];

    if (filteredTasks.length > 0) {
      tasks[date] = filteredTasks;
    } else {
      delete tasks[date]; 
    }

    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    return true;
  } catch (error) {
    console.error('Failed to remove task', error);
    return false;
  }
};

export const markTaskCompleted = async (date: string, taskId: string): Promise<boolean> => {
  try {
    const tasksString = await AsyncStorage.getItem(TASKS_KEY);
    const tasks = tasksString ? JSON.parse(tasksString) : {};

    tasks[date] = tasks[date]?.map((task: Task) => 
      task.id === taskId ? { ...task, completed: true } : task
    );

    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    return true;
  } catch (error) {
    console.error('Failed to mark task as completed', error);
    return false;
  }
};
