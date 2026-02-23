export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  BLOCKED = 'Blocked'
}

export interface PriorityConfig {
  label: string;
  color: string;
  textColor: string;
}

export interface Resource {
  id: string;
  name: string;
  role: string;
  department: string;
  email?: string;
  avatarUrl?: string;
  capacity: number; // Hours available per day
  weeklyCapacity?: number; // Hours available per week
  skills: string[];
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
  priority: string;
  requiredSkills?: string[];
}

export interface Leave {
  id: string;
  resourceId: string;
  date: string; // ISO Date string YYYY-MM-DD
  reason: string;
  type: 'Sick' | 'Vacation' | 'Personal' | 'Other';
  status: 'Approved' | 'Pending';
}

export interface AppState {
  resources: Resource[];
  tasks: Task[];
  leaves: Leave[];
  projects: string[];
  priorityConfigs: PriorityConfig[];
  isLoading: boolean;
  error: string | null;
}

export interface FilterState {
  date: Date;
  project: string; // 'All' or specific project name
  role: string;
  department: string;
  search: string;
  skill: string;
}