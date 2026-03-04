import { Resource, Task, TaskStatus, Leave, PriorityConfig } from '../types';
import Papa from 'papaparse';

// The ID from the user provided URL
const SHEET_ID = '1ABC0KX7P220ODjWXI_JDbzqsVXLH4R8jwOrXvrKsoW8';
const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

export const fetchSheetData = async (): Promise<{ resources: Resource[], tasks: Task[], leaves: Leave[], priorityConfigs: PriorityConfig[] }> => {
  // Prevent network errors if the Sheet ID is still the default placeholder
  if (SHEET_ID === '1ABC0KX7P220ODjWXI_JDbzqsVXLH4R8jwOrXvrKsoW8') {
    console.info("Using mock data (Sheet ID is configured to placeholder).");
    return getMockData();
  }

  try {
    const response = await fetch(SHEET_CSV_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch sheet: ${response.statusText}`);
    }
    const text = await response.text();
    const parsed = parseCSVData(text);
    return { ...parsed, leaves: getMockLeaves(), priorityConfigs: getDefaultPriorityConfigs() };
  } catch (error) {
    console.warn("Using mock data due to fetch error (likely CORS or private sheet):", error);
    return getMockData();
  }
};

export const getDefaultPriorityConfigs = (): PriorityConfig[] => [
  { label: 'Urgent', color: '#ef4444', textColor: '#ffffff', order: 0 },
  { label: 'High', color: '#f97316', textColor: '#ffffff', order: 1 },
  { label: 'Medium', color: '#eab308', textColor: '#ffffff', order: 2 },
  { label: 'Low', color: '#3b82f6', textColor: '#ffffff', order: 3 },
];

const parseCSVData = (csvText: string): { resources: Resource[], tasks: Task[] } => {
  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase()
  });

  const data = result.data as any[];
  const resourcesMap = new Map<string, Resource>();
  const tasks: Task[] = [];

  data.forEach((row, index) => {
    // Robust checks for Resource Name columns
    const resourceName = row['name'] || row['resource'] || row['resource name'] || row['employee'] || row['team member'] || 'Unknown';
    const resourceId = resourceName.toLowerCase().replace(/\s+/g, '-');
    
    // Skip invalid rows
    if (resourceName === 'Unknown' && !row['task'] && !row['title']) return;

    // Build Resource List
    if (!resourcesMap.has(resourceId)) {
      resourcesMap.set(resourceId, {
        id: resourceId,
        name: resourceName,
        role: row['role'] || row['job title'] || 'Team Member',
        department: row['department'] || 'Engineering',
        capacity: 8,
        weeklyCapacity: 40,
        skills: (row['skills'] || '').split(',').map((s: string) => s.trim()).filter(Boolean),
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(resourceName)}&background=random`,
        isBillable: true
      });
    }

    // Build Task List
    tasks.push({
      id: `task-${index}`,
      title: row['task'] || row['title'] || 'Untitled Task',
      description: row['description'] || '',
      assignedResourceId: resourceId,
      projectName: row['project'] || 'General',
      date: parseDate(row['date']), 
      duration: parseFloat(row['hours'] || row['duration'] || '0') || 1,
      status: mapStatus(row['status']),
      priority: 'Medium',
      requiredSkills: (row['required skills'] || row['skills'] || '').split(',').map((s: string) => s.trim()).filter(Boolean)
    });
  });

  return {
    resources: Array.from(resourcesMap.values()),
    tasks
  };
};

const parseDate = (dateString: string): string => {
  if (!dateString) return new Date().toISOString().split('T')[0];
  // Handle formats like DD/MM/YYYY or MM/DD/YYYY if necessary, currently assumes ISO or standard
  const d = new Date(dateString);
  return !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
}

const mapStatus = (status: string): TaskStatus => {
  const s = status?.toLowerCase() || '';
  if (s.includes('done') || s.includes('complete')) return TaskStatus.COMPLETED;
  if (s.includes('progress')) return TaskStatus.IN_PROGRESS;
  if (s.includes('block')) return TaskStatus.BLOCKED;
  return TaskStatus.TODO;
};

const getMockLeaves = (): Leave[] => {
  const today = new Date().toISOString().split('T')[0];
  return [
    { id: 'l1', resourceId: 'mike-ross', date: today, reason: 'Doctor Appointment', type: 'Sick', status: 'Approved' },
  ];
};

// Fallback data if the sheet is inaccessible
const getMockData = () => {
  const resources: Resource[] = [
    { id: 'alex-chen', name: 'Alex Chen', role: 'Senior Dev', department: 'Frontend', capacity: 8, weeklyCapacity: 40, skills: ['React', 'TypeScript', 'Tailwind'], avatarUrl: 'https://i.pravatar.cc/150?u=alex', isBillable: true },
    { id: 'sarah-jones', name: 'Sarah Jones', role: 'Product Manager', department: 'Product', capacity: 8, weeklyCapacity: 40, skills: ['Roadmapping', 'Agile', 'Communication'], avatarUrl: 'https://i.pravatar.cc/150?u=sarah', isBillable: true },
    { id: 'mike-ross', name: 'Mike Ross', role: 'UX Designer', department: 'Design', capacity: 6, weeklyCapacity: 30, skills: ['Figma', 'User Research', 'Prototyping'], avatarUrl: 'https://i.pravatar.cc/150?u=mike', isBillable: false },
    { id: 'emily-wong', name: 'Emily Wong', role: 'Backend Dev', department: 'Backend', capacity: 8, weeklyCapacity: 40, skills: ['Node.js', 'PostgreSQL', 'Docker'], avatarUrl: 'https://i.pravatar.cc/150?u=emily', isBillable: true },
  ];

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const tasks: Task[] = [
    { id: '1', title: 'Q3 Roadmap Review', assignedResourceId: 'sarah-jones', projectName: 'Strategy', date: today, duration: 2, status: TaskStatus.COMPLETED, priority: 'High', requiredSkills: ['Roadmapping'] },
    { id: '2', title: 'Fix Login Bug', assignedResourceId: 'alex-chen', projectName: 'Auth Service', date: today, duration: 4, status: TaskStatus.IN_PROGRESS, priority: 'High', requiredSkills: ['TypeScript', 'React'] },
    { id: '3', title: 'Design System Update, Colors & Typography', assignedResourceId: 'mike-ross', projectName: 'UI Kit', date: today, duration: 3, status: TaskStatus.TODO, priority: 'Medium', requiredSkills: ['Figma'] },
    { id: '4', title: 'API Schema Migration', assignedResourceId: 'emily-wong', projectName: 'Core API', date: today, duration: 5, status: TaskStatus.IN_PROGRESS, priority: 'High', requiredSkills: ['PostgreSQL', 'Node.js'] },
    { id: '5', title: 'Sprint Planning', assignedResourceId: 'sarah-jones', projectName: 'Operations', date: tomorrow, duration: 1.5, status: TaskStatus.TODO, priority: 'Medium', requiredSkills: ['Agile'] },
    { id: '6', title: 'Code Review', assignedResourceId: 'alex-chen', projectName: 'Auth Service', date: today, duration: 1, status: TaskStatus.TODO, priority: 'Low', requiredSkills: ['TypeScript'] },
  ];

  const leaves = getMockLeaves();
  const priorityConfigs = getDefaultPriorityConfigs();

  return { resources, tasks, leaves, priorityConfigs };
};