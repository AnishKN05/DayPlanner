// // import * as SQLite from 'expo-sqlite';

// // const db = SQLite.openDatabase('planner.db');

// // export const initDB = () => {
// //   db.transaction(tx => {
// //     tx.executeSql(
// //       `CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);`
// //     );
// //   });
// // };

// // export const addTask = (name: string) => {
// //   db.transaction(tx => {
// //     tx.executeSql(`INSERT INTO tasks (name) VALUES (?);`, [name]);
// //   });
// // };

// // export const getTasks = (callback: (tasks: any[]) => void) => {
// //   db.transaction(tx => {
// //     tx.executeSql(`SELECT * FROM tasks;`, [], (_, result) => {
// //       callback(result.rows._array);
// //     });
// //   });
// // };
// // db.ts
// import * as SQLite from 'expo-sqlite';

// const db = SQLite.openDatabase('planner.db');

// export const initDB = () => {
//   db.transaction(tx => {
//     tx.executeSql(
//       'CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY NOT NULL, date TEXT NOT NULL, task TEXT NOT NULL);'
//     );
//   });
// };

// export const insertTask = (date: string, task: string) => {
//   return new Promise((resolve, reject) => {
//     db.transaction(tx => {
//       tx.executeSql(
//         'INSERT INTO tasks (date, task) VALUES (?, ?);',
//         [date, task],
//         (_, result) => resolve(result),
//         (_, error) => reject(error)
//       );
//     });
//   });
// };

// export const fetchTasks = (date: string) => {
//   return new Promise<string[]>((resolve, reject) => {
//     db.transaction(tx => {
//       tx.executeSql(
//         'SELECT task FROM tasks WHERE date = ?;',
//         [date],
//         (_, result) => {
//           const tasks = result.rows._array.map((row: any) => row.task);
//           resolve(tasks);
//         },
//         (_, error) => reject(error)
//       );
//     });
//   });
// };
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper function to get the current tasks for a specific date
const getTasksKey = (date: string) => `tasks_${date}`;

// Initialize the database by checking if tasks exist for a date
export const initDB = async () => {
  try {
    const storedTasks = await AsyncStorage.getItem('tasks');
    if (storedTasks === null) {
      // If no tasks are stored, initialize an empty object
      await AsyncStorage.setItem('tasks', JSON.stringify({}));
    }
  } catch (error) {
    console.error('Failed to initialize the database', error);
  }
};

// Insert a task for a specific date
export const insertTask = async (date: string, task: string) => {
  try {
    // Retrieve the current tasks for the date
    const tasksString = await AsyncStorage.getItem('tasks');
    const tasks = tasksString ? JSON.parse(tasksString) : {};

    // Check if tasks already exist for the date
    const existingTasks = tasks[date] || [];
    
    // Add the new task
    tasks[date] = [...existingTasks, task];

    // Store the updated tasks object
    await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to insert task', error);
  }
};

// Fetch tasks for a specific date
export const fetchTasks = async (date: string): Promise<string[]> => {
  try {
    const tasksString = await AsyncStorage.getItem('tasks');
    const tasks = tasksString ? JSON.parse(tasksString) : {};

    // Return the tasks for the specified date
    return tasks[date] || [];
  } catch (error) {
    console.error('Failed to fetch tasks', error);
    return [];
  }
};

// Remove a task from a specific date
export const removeTask = async (date: string, task: string) => {
  try {
    const tasksString = await AsyncStorage.getItem('tasks');
    const tasks = tasksString ? JSON.parse(tasksString) : {};

    // Filter out the task
    tasks[date] = tasks[date].filter((t: string) => t !== task);

    // Store the updated tasks object
    await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to remove task', error);
  }
};
