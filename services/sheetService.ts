import { Resource, Task, TaskStatus } from '../types';

// The ID from the user provided URL: https://docs.google.com/spreadsheets/d/1ABC0KX7P220ODjWXI_JDbzqsVXLH4R8jwOrXvrKsoW8/edit?gid=0#gid=0
const SHEET_ID = '1ABC0KX7P220ODjWXI_JDbzqsVXLH4R8jwOrXvrKsoW8';
const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

export const fetchSheetData = async (): Promise<{ resources: Resource[], tasks: Task[] }> => {
  try {
    const response = await fetch(SHEET_CSV_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch sheet: ${response.statusText}`);
    }
    const text = await response.text();
    return parseCSV(text);
  } catch (error) {
    console.warn("Using mock data due to fetch error (likely CORS or private sheet):", error);
    return getMockData();
  }
};

const parseCSV = (csvText: string): { resources: Resource[], tasks: Task[] } => {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  const resourcesMap = new Map<string, Resource>();
  const tasks: Task[] = [];

  // Simple CSV parser logic (assuming no complex quoting for this demo)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Handle simple CSV splitting
    const values = line.split(',').map(v => v.trim());
    const row: any = {};
    headers.forEach((h, index) => {
      // Clean up headers to handle potential quotes or extra spaces
      const key = h.replace(/^"|"$/g, '').trim();
      row[key] = (values[index] || '').replace(/^"|"$/g, '').trim();
    });

    // Map columns to our domain model. 
    // Robust checks for Resource Name columns
    const resourceName = row['name'] || row['resource'] || row['resource name'] || row['employee'] || row['team member'] || 'Unknown';
    const resourceId = resourceName.toLowerCase().replace(/\s+/g, '-');
    
    // Skip invalid rows where name is strictly Unknown AND task is empty (likely empty rows)
    if (resourceName === 'Unknown' && !row['task'] && !row['title']) continue;

    // Build Resource List
    if (!resourcesMap.has(resourceId)) {
      resourcesMap.set(resourceId, {
        id: resourceId,
        name: resourceName,
        role: row['role'] || row['job title'] || 'Team Member',
        department: row['department'] || 'Engineering',
        capacity: 8,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(resourceName)}&background=random`
      });
    }

    // Build Task List
    tasks.push({
      id: `task-${i}`,
      title: row['task'] || row['title'] || 'Untitled Task',
      description: row['description'] || '',
      assignedResourceId: resourceId,
      projectName: row['project'] || 'General',
      date: row['date'] || new Date().toISOString().split('T')[0], // Fallback to today if missing
      duration: parseFloat(row['hours'] || row['duration'] || '0') || 1,
      status: mapStatus(row['status']),
      priority: 'Medium'
    });
  }

  return {
    resources: Array.from(resourcesMap.values()),
    tasks
  };
};

const mapStatus = (status: string): TaskStatus => {
  const s = status?.toLowerCase() || '';
  if (s.includes('done') || s.includes('complete')) return TaskStatus.COMPLETED;
  if (s.includes('progress')) return TaskStatus.IN_PROGRESS;
  if (s.includes('block')) return TaskStatus.BLOCKED;
  return TaskStatus.TODO;
};

// Fallback data if the sheet is inaccessible
const getMockData = () => {
  const resources: Resource[] = [
    { id: 'alex-chen', name: 'Alex Chen', role: 'Senior Dev', department: 'Frontend', capacity: 8, avatarUrl: 'https://i.pravatar.cc/150?u=alex' },
    { id: 'sarah-jones', name: 'Sarah Jones', role: 'Product Manager', department: 'Product', capacity: 8, avatarUrl: 'https://i.pravatar.cc/150?u=sarah' },
    { id: 'mike-ross', name: 'Mike Ross', role: 'UX Designer', department: 'Design', capacity: 6, avatarUrl: 'https://i.pravatar.cc/150?u=mike' },
    { id: 'emily-wong', name: 'Emily Wong', role: 'Backend Dev', department: 'Backend', capacity: 8, avatarUrl: 'https://i.pravatar.cc/150?u=emily' },
  ];

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const tasks: Task[] = [
    { id: '1', title: 'Q3 Roadmap Review', assignedResourceId: 'sarah-jones', projectName: 'Strategy', date: today, duration: 2, status: TaskStatus.COMPLETED, priority: 'High' },
    { id: '2', title: 'Fix Login Bug', assignedResourceId: 'alex-chen', projectName: 'Auth Service', date: today, duration: 4, status: TaskStatus.IN_PROGRESS, priority: 'High' },
    { id: '3', title: 'Design System Update', assignedResourceId: 'mike-ross', projectName: 'UI Kit', date: today, duration: 3, status: TaskStatus.TODO, priority: 'Medium' },
    { id: '4', title: 'API Schema Migration', assignedResourceId: 'emily-wong', projectName: 'Core API', date: today, duration: 5, status: TaskStatus.IN_PROGRESS, priority: 'High' },
    { id: '5', title: 'Sprint Planning', assignedResourceId: 'sarah-jones', projectName: 'Operations', date: tomorrow, duration: 1.5, status: TaskStatus.TODO, priority: 'Medium' },
    { id: '6', title: 'Code Review', assignedResourceId: 'alex-chen', projectName: 'Auth Service', date: today, duration: 1, status: TaskStatus.TODO, priority: 'Low' },
  ];

  return { resources, tasks };
};