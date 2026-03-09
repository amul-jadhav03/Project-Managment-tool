export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  RESOURCE = 'resource'
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  assignedProjects?: string[]; // For Admin, Manager, Resource
  createdAt: string;
}

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
  reminderDays?: number; // Days before deadline to trigger reminder
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
  user: UserProfile | null;
  authLoading: boolean;
  isLoading: boolean;
  error: string | null;
  emailRemindersEnabled: boolean;
}

export interface FilterState {
  date: Date;
  project: string; // 'All' or specific project name
  role: string;
  department: string;
  search: string;
  skill: string;
}