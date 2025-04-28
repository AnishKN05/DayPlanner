export interface Task {
    id: string;
    title: string;
    description?: string;
    date: string; // "2025-04-28"
    time?: string; // "10:00 AM"
    priority?: 'Low' | 'Medium' | 'High';
    completed: boolean;
  }
  