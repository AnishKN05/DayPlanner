
import AsyncStorage from '@react-native-async-storage/async-storage';


const getTasksKey = (date: string) => `tasks_${date}`;


export const initDB = async () => {
  try {
    const storedTasks = await AsyncStorage.getItem('tasks');
    if (storedTasks === null) {
     
      await AsyncStorage.setItem('tasks', JSON.stringify({}));
    }
  } catch (error) {
    console.error('Failed to initialize the database', error);
  }
};

export const insertTask = async (date: string, task: string) => {
  try {
    
    const tasksString = await AsyncStorage.getItem('tasks');
    const tasks = tasksString ? JSON.parse(tasksString) : {};

    const existingTasks = tasks[date] || [];
   
    tasks[date] = [...existingTasks, task];

   
    await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to insert task', error);
  }
};

export const fetchTasks = async (date: string): Promise<string[]> => {
  try {
    const tasksString = await AsyncStorage.getItem('tasks');
    const tasks = tasksString ? JSON.parse(tasksString) : {};

    return tasks[date] || [];
  } catch (error) {
    console.error('Failed to fetch tasks', error);
    return [];
  }
};


export const removeTask = async (date: string, task: string) => {
  try {
    const tasksString = await AsyncStorage.getItem('tasks');
    const tasks = tasksString ? JSON.parse(tasksString) : {};

    
    tasks[date] = tasks[date].filter((t: string) => t !== task);

  
    await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to remove task', error);
  }
};
