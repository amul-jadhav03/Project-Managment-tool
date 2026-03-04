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
  order: number;
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
  isBillable: boolean;
  billingRate?: number;
}

export interface TaskHistoryItem {
  id: string;
  field: 'status' | 'assignee' | 'priority' | 'general';
  oldValue: string;
  newValue: string;
  timestamp: Date;
  changedBy: string;
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
  history?: TaskHistoryItem[];
}

export interface Leave {
  id: string;
  resourceId: string;
  date: string; // ISO Date string YYYY-MM-DD
  reason: string;
  type: 'Sick' | 'Vacation' | 'Personal' | 'Other';
  status: 'Approved' | 'Pending';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'deadline' | 'assignment' | 'status' | 'info';
  timestamp: Date;
  read: boolean;
  taskId?: string;
}

export interface AppState {
  resources: Resource[];
  tasks: Task[];
  leaves: Leave[];
  projects: string[];
  priorityConfigs: PriorityConfig[];
  notifications: Notification[];
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