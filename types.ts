
export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  race: string; // Included as per prompt requirements
  bio: string;
}

export enum TaskType {
  FIXED = 'FIXED',
  FLEXIBLE = 'FLEXIBLE',
}

export enum Priority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
}

export interface FixedEvent {
  id: string;
  title: string;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  type: TaskType.FIXED;
  doNotDisturb?: boolean;
}

export interface FlexibleTask {
  id: string;
  title: string;
  // Duration is decided when scheduling, not in the library
  priority: Priority;
  type: TaskType.FLEXIBLE;
}

// New Interface for Fixed Task Library (Sub-tasks for Fixed Events)
export interface FixedTaskPreset {
  id: string;
  title: string;
  defaultDuration?: number;
}

// An instance of a task scheduled in a specific gap
export interface ScheduledBlock {
  id: string;
  title: string;
  startTime: string; // Calculated HH:mm
  endTime: string;   // Calculated HH:mm
  type: TaskType;
  isCompleted: boolean;
  originalFlexibleTaskId?: string; // If derived from a preset
  notes?: string;
  parentId?: string; // Optional: ID of the FixedEvent containing this block
  
  // Visuals
  bannerUrl?: string; // Generated abstract banner

  // Reflection / Log Data
  facts?: string[]; // Array of up to 3 short facts
  description?: string; // Detailed description
  imageUrl?: string; // Base64 string of the generated/uploaded image
  
  // App Tracking
  generatedAppKey?: string; // If an interactive app was generated
  generatedWebPageKey?: string; // If a static info page was generated
}

export interface Achievement {
  id: string;
  date: string; // ISO Date
  description: string;
  relatedTaskId: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string; // Life-long description
  achievements: Achievement[];
}

export interface DailyLog {
  date: string;
  completedTaskIds: string[];
  aiReflection?: string;
}

export interface MindCategory {
  score: number; // 0 - 100
  label: string; // e.g., "High", "Moderate", "Low"
}

export interface MindAnalysis {
  date: string; // ISO Date string (YYYY-MM-DD)
  overallMood: string;
  categories: {
    stress: MindCategory;
    energy: MindCategory;
    focus: MindCategory;
    satisfaction: MindCategory;
  };
  advice: string;
}

export interface StatsReflection {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  summary: string;
}

export interface BookmarkedApp {
  id: string;
  title: string;
  description: string;
  code: string;
  createdAt: string;
  type?: 'APP' | 'PAGE'; // Differentiate between interactive app and static page
}

// --- ESSAY TYPES ---
export type EssaySectionType = 'text' | 'image' | 'app_link' | 'highlight';

export interface EssaySection {
  type: EssaySectionType;
  content: string; // Text content, or image caption, or highlight text
  
  // For Images
  relatedTaskId?: string; 
  
  // For App Links
  appTitle?: string;
  
  // For Highlights (Method/Action mentions)
  tooltip?: string;
}

export interface EssayData {
  title: string;
  date: string;
  sections: EssaySection[];
}

// Detailed Settings for specific features
export interface ModelSettings {
  // Text Features
  basicAnalysisModel: string; // Suggestions, Mental Health, Stats (Default: Flash)
  appGeneratorModel: string; // App Building (Default: Pro)
  storytellingModel: string; // Essay (Default: Pro)

  // Image Features
  bannerImageModel: string; // UI Banners (Default: Flash Image)
  reflectionImageModel: string; // Photorealistic Memories (Default: Pro Image)
}
