export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  BLOCKED = 'Blocked'
}

export interface Resource {
  id: string;
  name: string;
  role: string;
  department: string;
  email?: string;
  avatarUrl?: string;
  capacity: number; // Hours available per day
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedResourceId: string;
  projectName: string;
  date: string; // ISO Date string YYYY-MM-DD
  duration: number; // Hours
  status: TaskStatus;
  priority: 'Low' | 'Medium' | 'High';
}

export interface AppState {
  resources: Resource[];
  tasks: Task[];
  projects: string[];
  isLoading: boolean;
  error: string | null;
}

export interface FilterState {
  date: Date;
  project: string; // 'All' or specific project name
  role: string;
  department: string;
  search: string;
}