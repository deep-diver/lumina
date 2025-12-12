
import React, { useState, useMemo, useEffect } from 'react';
import { 
  User, Calendar, Target, Plus, Activity, Sparkles, List, Trash2, ArrowRight, Smile, Zap, Coffee, Crosshair, Pencil, Save, X, Clock, Briefcase, AppWindow, BarChart3, PieChart, ThumbsUp, AlertTriangle, Lightbulb, PenTool, BookOpen, Smartphone, Play, Heart, Star, BellOff, Edit3, Settings, Monitor, Image as ImageIcon, Layers, Maximize2, Minimize2, Sun, Moon
} from 'lucide-react';
import { UserProfile, FixedEvent, FlexibleTask, TaskType, ScheduledBlock, Goal, MindAnalysis, Priority, FixedTaskPreset, StatsReflection, BookmarkedApp, EssayData, ModelSettings, MindCategory } from './types';
import { Timeline } from './components/Timeline';
import { PomodoroModal } from './components/PomodoroModal';
import { ActionModal } from './components/ActionModal';
import { AppGeneratorModal } from './components/AppGeneratorModal';
import { AppLibraryModal } from './components/AppLibraryModal';
import { TaskReflectionPanel } from './components/TaskReflectionPanel';
import { LandingPage } from './components/LandingPage';
import { suggestFlexibleTask, analyzeDailyLog, analyzeMentalHealth, generateStatsReflection, generateTaskBanner, generateStatsBanner, generateDailyEssay, updateModelSettings } from './services/geminiService';
import { DEMO_SCENARIOS, DemoScenarioKey } from './data/demoData';
import { Loader2 } from 'lucide-react';

// --- COMMON OPTIONS ---
const COMMON_FIXED_TITLES = ['Sleep 🌙', 'Work 💼', 'Breakfast 🍳', 'Lunch 🍱', 'Dinner 🍽️', 'Commute 🚗', 'Gym 💪', 'Shower 🚿', 'Family Time 👨‍👩‍👧', 'Night Routine 🌚'];
const COMMON_PRESET_TITLES = ['Email Check 📧', 'Meeting 🤝', 'Deep Work 🧠', 'Coffee Break ☕', 'Planning 📝', 'Code Review 💻', 'Learning 📖', 'Brainstorming 💡'];
const COMMON_FLEXIBLE_TITLES = ['Read Book 📖', 'Workout 💪', 'Meditation 🧘‍♀️', 'Study 📚', 'Journaling ✍️', 'Walk 🚶', 'Clean 🧹', 'Grocery Shopping 🛒', 'Call Parents 📞', 'Nap 😴'];

// --- MOCK INITIAL DATA ---
const INITIAL_FIXED_EVENTS: FixedEvent[] = [
  { id: '1', title: 'Sleep 🌙', startTime: '07:00', endTime: '07:30', type: TaskType.FIXED, doNotDisturb: true },
  { id: '2', title: 'Work 💼', startTime: '09:00', endTime: '18:00', type: TaskType.FIXED },
  { id: '3', title: 'Dinner 🍱', startTime: '19:00', endTime: '20:00', type: TaskType.FIXED },
  { id: '4', title: 'Sleep 😴', startTime: '23:00', endTime: '23:30', type: TaskType.FIXED, doNotDisturb: true },
];

const INITIAL_FIXED_PRESETS: FixedTaskPreset[] = [
  { id: 'fp1', title: 'Email Check 📧', defaultDuration: 15 },
  { id: 'fp2', title: 'Meeting 🤝', defaultDuration: 30 },
  { id: 'fp3', title: 'Deep Work 🧠', defaultDuration: 60 },
  { id: 'fp4', title: 'Coffee Break ☕', defaultDuration: 10 },
];

const INITIAL_FLEXIBLE_TASKS: FlexibleTask[] = [
  { id: 'f1', title: 'Read Book 📖', priority: Priority.HIGH, type: TaskType.FLEXIBLE },
  { id: 'f2', title: 'Workout 💪', priority: Priority.MEDIUM, type: TaskType.FLEXIBLE },
  { id: 'f3', title: 'Meditation 🧘‍♀️', priority: Priority.LOW, type: TaskType.FLEXIBLE },
];

const INITIAL_GOALS: Goal[] = [
  { id: 'g1', title: 'Master Mathematics 🧮', description: 'Understand advanced calculus and apply it to real world problems.', achievements: [] },
  { id: 'g2', title: 'Healthy Life 🌿', description: 'Maintain physical and mental well-being until 80+.', achievements: [] },
];

enum Tab {
  PROFILE = 'PROFILE',
  STRUCTURE = 'STRUCTURE',
  DAILY = 'DAILY',
  GOALS = 'GOALS',
  INSIGHTS = 'INSIGHTS', // Merged Stats + Mind
  ESSAY = 'ESSAY',
  SETTINGS = 'SETTINGS',
}

// Helper for sorting
const timeToMin = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

// Helper: Convert minutes to "HH:mm"
const minToTime = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// Helper to generate distinct consistent colors from a string
const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 360);
    const s = 80; // High saturation for cute
    const l = 70; // High lightness for pastel
    return `hsl(${h}, ${s}%, ${l}%)`;
};

// --- REUSABLE COMPONENTS ---
interface CreatableSelectProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

const CreatableSelect: React.FC<CreatableSelectProps> = ({ options, value, onChange, placeholder, className, autoFocus }) => {
  // Initialize as Custom (Text Input) if the value is not in the predefined options.
  // This ensures new items (empty value) or custom values start as text boxes.
  const [isCustom, setIsCustom] = useState(!options.includes(value));

  // If the value changes externally to something not in options, ensure we are in custom mode.
  useEffect(() => {
    if (value && !options.includes(value)) {
        setIsCustom(true);
    }
  }, [value, options]);

  if (isCustom) {
    return (
        <div className="flex gap-1 w-full">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder || "Type custom name..."}
                className={className}
                autoFocus={autoFocus}
            />
            <button
                onClick={() => { setIsCustom(false); onChange(options[0]); }} 
                className="bg-slate-200 dark:bg-slate-700/50 border border-slate-300 dark:border-white/10 rounded-xl px-2 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 transition-colors"
                title="Choose from list"
            >
                <List className="w-4 h-4" />
            </button>
        </div>
    );
  }

  return (
    <select
        value={options.includes(value) ? value : 'CUSTOM_TRIGGER'}
        onChange={(e) => {
            if (e.target.value === 'CUSTOM_TRIGGER') {
                setIsCustom(true);
                onChange(''); // Clear value for custom input
            } else {
                onChange(e.target.value);
            }
        }}
        className={className}
        autoFocus={autoFocus}
    >
        <option value="" disabled>{placeholder || "Select..."}</option>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        <option value="CUSTOM_TRIGGER" className="font-bold text-pink-600 dark:text-pink-300 bg-white dark:bg-slate-800">+ Custom...</option>
    </select>
  );
};

// --- ESSAY IMAGE COMPONENT ---
const EssayImage: React.FC<{ src: string; alt: string; caption: string }> = ({ src, alt, caption }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <figure className="my-8 scroll-mt-20">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          w-full bg-slate-200 dark:bg-slate-800 rounded-xl shadow-inner relative cursor-pointer group overflow-hidden
          transition-[max-height] duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]
          ${isExpanded ? 'max-h-[150vh]' : 'max-h-32 md:max-h-48'}
        `}
      >
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-auto object-cover block min-h-full"
        />
        
        {/* Overlay for hover state */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none">
            {/* Center Icon for Opening */}
            <div className={`
                bg-black/40 backdrop-blur-sm text-white p-3 rounded-full 
                transition-all duration-300 transform 
                ${isExpanded ? 'opacity-0 scale-75' : 'opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'}
            `}>
               <Maximize2 className="w-6 h-6"/>
            </div>
            
            {/* Corner Icon for Closing */}
             <div className={`
                absolute bottom-4 right-4 bg-black/60 text-white p-2 rounded-full 
                transition-all duration-500 transform 
                ${isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
             `}>
               <Minimize2 className="w-5 h-5"/>
            </div>
        </div>
      </div>
      <figcaption className="text-center text-sm text-slate-500 dark:text-slate-400 mt-3 italic font-sans flex items-center justify-center gap-2">
        {caption}
      </figcaption>
    </figure>
  );
};

const App: React.FC = () => {
  // --- STATE ---
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('theme') === 'light' ? 'light' : 'dark';
    }
    return 'dark';
  });

  const [landingStatus, setLandingStatus] = useState<'VISIBLE' | 'EXITING' | 'HIDDEN'>('VISIBLE');
  const [activeTab, setActiveTab] = useState<Tab>(Tab.STRUCTURE);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '', age: 25, gender: '', race: '', bio: ''
  });
  
  // Showcase State
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  // Feature-Specific Model Settings
  const [modelSettings, setModelSettings] = useState<ModelSettings>({
    basicAnalysisModel: 'gemini-2.5-flash',
    appGeneratorModel: 'gemini-3-pro-preview',
    storytellingModel: 'gemini-3-pro-preview',
    bannerImageModel: 'gemini-2.5-flash-image',
    reflectionImageModel: 'gemini-3-pro-image-preview'
  });

  // Sync settings with service
  useEffect(() => {
    updateModelSettings(modelSettings);
  }, [modelSettings]);

  // Persist Theme
  useEffect(() => {
      localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
      setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Data
  const [fixedEvents, setFixedEvents] = useState<FixedEvent[]>(INITIAL_FIXED_EVENTS);
  const [fixedPresets, setFixedPresets] = useState<FixedTaskPreset[]>(INITIAL_FIXED_PRESETS);
  const [flexibleTasks, setFlexibleTasks] = useState<FlexibleTask[]>(INITIAL_FLEXIBLE_TASKS);
  
  const [scheduledBlocks, setScheduledBlocks] = useState<ScheduledBlock[]>([]);
  const [completedFixedEventIds, setCompletedFixedEventIds] = useState<string[]>([]);
  
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [dailySummary, setDailySummary] = useState<string>("");
  const [bookmarkedApps, setBookmarkedApps] = useState<BookmarkedApp[]>([]);
  
  const [mindHistory, setMindHistory] = useState<Record<string, MindAnalysis>>({});

  // Stats
  const [statsReflection, setStatsReflection] = useState<StatsReflection | null>(null);
  const [statsBannerUrl, setStatsBannerUrl] = useState<string | null>(null);
  const [isStatsReflecting, setIsStatsReflecting] = useState(false);
  
  // Essay
  const [essayData, setEssayData] = useState<EssayData | null>(null);
  const [isEssayGenerating, setIsEssayGenerating] = useState(false);

  // Edit States
  const [editingFixedId, setEditingFixedId] = useState<string | null>(null);
  const [editFixedData, setEditFixedData] = useState<Partial<FixedEvent>>({});
  
  const [editingFlexibleId, setEditingFlexibleId] = useState<string | null>(null);
  const [editFlexibleData, setEditFlexibleData] = useState<Partial<FlexibleTask>>({});

  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editPresetData, setEditPresetData] = useState<Partial<FixedTaskPreset>>({});

  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState<{title: string, description: string}>({ title: '', description: '' });
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editGoalData, setEditGoalData] = useState<Partial<Goal>>({});

  const [isAddingFixed, setIsAddingFixed] = useState(false);
  const [isAddingPreset, setIsAddingPreset] = useState(false);
  const [isAddingFlexible, setIsAddingFlexible] = useState(false);

  // UI State for Adding New Items
  const [newEvent, setNewEvent] = useState({ title: '', start: '', end: '', doNotDisturb: false });
  const [newFlexibleTask, setNewFlexibleTask] = useState<{title: string, priority: Priority}>({ 
    title: '', priority: Priority.MEDIUM 
  });
  const [newPreset, setNewPreset] = useState<{title: string}>({ title: '' });


  // UI State for Modal (Daily Schedule)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalGap, setModalGap] = useState<{start: string, end: string, duration: number, parentId?: string} | null>(null);
  const [customTaskInput, setCustomTaskInput] = useState("");
  const [fillDuration, setFillDuration] = useState(15);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pendingOriginalId, setPendingOriginalId] = useState<string | undefined>(undefined);

  const [activeTimerBlock, setActiveTimerBlock] = useState<ScheduledBlock | null>(null);
  const [activeIdeaBlock, setActiveIdeaBlock] = useState<ScheduledBlock | null>(null);
  const [isAppLibraryOpen, setIsAppLibraryOpen] = useState(false);
  const [appGeneratorData, setAppGeneratorData] = useState<{methodTitle: string, methodDesc: string, mode: 'APP' | 'PAGE', initialCode?: string} | null>(null);
  const [generatedApps, setGeneratedApps] = useState<Record<string, string>>({}); // Stores both Apps and Pages
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // --- STATS CALCULATION ---
  const currentStats = useMemo(() => {
    // UPDATED: Include titles from completed blocks to capture custom tasks
    const allCategories = new Set([
        ...fixedPresets.map(p => p.title),
        ...flexibleTasks.map(t => t.title),
        ...fixedEvents.map(e => e.title),
        ...scheduledBlocks.filter(b => b.isCompleted).map(b => b.title)
    ]);

    const stats: Record<string, number> = {};
    allCategories.forEach(cat => { stats[cat] = 0; });

    let totalTime = 0;

    fixedEvents.forEach(event => {
       if (completedFixedEventIds.includes(event.id)) {
          const duration = timeToMin(event.endTime) - timeToMin(event.startTime);
          stats[event.title] = (stats[event.title] || 0) + duration;
          totalTime += duration;
       }
    });

    scheduledBlocks.forEach(block => {
        if (block.isCompleted) {
            const duration = timeToMin(block.endTime) - timeToMin(block.startTime);
            // Directly use title as it is now in allCategories, or fall back if somehow missing
            const category = block.title;
            stats[category] = (stats[category] || 0) + duration;
            totalTime += duration;
        }
    });

    return {
        totalTime,
        items: Object.entries(stats)
            .filter(([_, minutes]) => minutes > 0) // Only show items with time
            .map(([category, minutes]) => ({
                category,
                minutes,
                color: stringToColor(category),
                percentage: totalTime > 0 ? (minutes / totalTime) * 100 : 0
            }))
            .sort((a, b) => b.minutes - a.minutes)
    };
  }, [scheduledBlocks, fixedEvents, fixedPresets, flexibleTasks, completedFixedEventIds]);

  // --- HANDLERS (Same logic, new styling calls implicitly) ---
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setUserProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEnterApp = () => {
    setLandingStatus('EXITING');
    setTimeout(() => {
        setLandingStatus('HIDDEN');
    }, 1000); // 1s animation match
  };

  const handleStartShowcase = (key: DemoScenarioKey) => {
    const dataset = DEMO_SCENARIOS[key];
    
    // 1. Load Demo Data
    setUserProfile(dataset.profile);
    setGoals(dataset.goals);
    setFixedEvents(dataset.fixedEvents);
    setScheduledBlocks(dataset.schedule);
    setStatsReflection(dataset.stats);
    setMindHistory({ [new Date().toISOString().split('T')[0]]: dataset.mind });
    setEssayData(dataset.essay);
    
    // Load generated apps and bookmarked apps
    setGeneratedApps(dataset.generatedApps);
    setBookmarkedApps(dataset.bookmarkedApps);
    
    // Select a block to show reflection
    if(dataset.schedule.length > 0) {
        // Trigger banner generation for the first item if needed, but since it's initial load, wait for user interaction or render
        setSelectedBlockId(dataset.schedule[0].id);
        const firstBlock = dataset.schedule[0];
        if (!firstBlock.bannerUrl) {
            generateTaskBanner(firstBlock.title).then(url => {
               if(url) {
                   setScheduledBlocks(prev => prev.map(b => b.id === firstBlock.id ? { ...b, bannerUrl: url } : b));
               }
            });
        }
    }

    // 2. Set State
    setIsDemoMode(true);
    setTourStep(0); // Start at Profile
    setActiveTab(Tab.PROFILE);

    // 3. Enter App
    handleEnterApp();
  };

  // Tour Logic: Auto-switch tabs when step changes
  useEffect(() => {
    if (!isDemoMode) return;
    
    // Mapping steps to tabs
    const steps = [Tab.PROFILE, Tab.GOALS, Tab.STRUCTURE, Tab.DAILY, Tab.ESSAY, Tab.INSIGHTS];
    if (tourStep < steps.length) {
        setActiveTab(steps[tourStep]);
    } else {
        // End of tour
        setIsDemoMode(false);
    }
  }, [tourStep, isDemoMode]);

  const handleAddFixedEvent = () => {
    if (!newEvent.title || !newEvent.start || !newEvent.end) return;
    const event: FixedEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      startTime: newEvent.start,
      endTime: newEvent.end,
      type: TaskType.FIXED,
      doNotDisturb: newEvent.doNotDisturb
    };
    setFixedEvents(prev => [...prev, event].sort((a,b) => timeToMin(a.startTime) - timeToMin(b.startTime)));
    setNewEvent({ title: '', start: '', end: '', doNotDisturb: false });
    setIsAddingFixed(false);
  };
  
  const handleStartEditFixed = (event: FixedEvent) => {
    setEditingFixedId(event.id);
    setEditFixedData({ ...event });
  };
  const handleCancelEditFixed = () => {
    setEditingFixedId(null);
    setEditFixedData({});
  };
  const handleSaveFixed = () => {
    if (!editingFixedId || !editFixedData.title || !editFixedData.startTime || !editFixedData.endTime) return;
    setFixedEvents(prev => prev.map(ev => ev.id === editingFixedId ? { ...ev, title: editFixedData.title!, startTime: editFixedData.startTime!, endTime: editFixedData.endTime!, doNotDisturb: editFixedData.doNotDisturb } : ev).sort((a,b) => timeToMin(a.startTime) - timeToMin(b.startTime)));
    handleCancelEditFixed();
  };
  const handleDeleteFixedEvent = (id: string) => {
    setFixedEvents(prev => prev.filter(e => e.id !== id));
  };
  const handleToggleFixedComplete = (id: string) => {
    setCompletedFixedEventIds(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]);
  };

  const handleAddPreset = () => {
    if (!newPreset.title) return;
    const preset: FixedTaskPreset = {
      id: Date.now().toString(),
      title: newPreset.title,
      defaultDuration: 30
    };
    setFixedPresets(prev => [...prev, preset]);
    setNewPreset({ title: '' });
    setIsAddingPreset(false);
  }
  const handleDeletePreset = (id: string) => {
    setFixedPresets(prev => prev.filter(p => p.id !== id));
  }

  const handleAddFlexibleTask = () => {
    if (!newFlexibleTask.title) return;
    const task: FlexibleTask = {
      id: Date.now().toString(),
      title: newFlexibleTask.title,
      priority: newFlexibleTask.priority,
      type: TaskType.FLEXIBLE
    };
    setFlexibleTasks(prev => [...prev, task]);
    setNewFlexibleTask({ title: '', priority: Priority.MEDIUM });
    setIsAddingFlexible(false);
  };
  const handleStartEditFlexible = (task: FlexibleTask) => {
    setEditingFlexibleId(task.id);
    setEditFlexibleData({ ...task });
  };
  const handleCancelEditFlexible = () => {
    setEditingFlexibleId(null);
    setEditFlexibleData({});
  };
  const handleSaveFlexible = () => {
    if (!editingFlexibleId || !editFlexibleData.title) return;
    setFlexibleTasks(prev => prev.map(task => task.id === editingFlexibleId ? { ...task, title: editFlexibleData.title!, priority: editFlexibleData.priority || Priority.MEDIUM } : task));
    handleCancelEditFlexible();
  };
  const handleDeleteFlexibleTask = (id: string) => {
    setFlexibleTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleAddGoal = () => {
    if (!newGoal.title) return;
    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      achievements: []
    };
    setGoals(prev => [goal, ...prev]);
    setNewGoal({ title: '', description: '' });
    setIsAddingGoal(false);
  };
  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };
  const handleStartEditGoal = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setEditGoalData({ ...goal });
  };
  const handleCancelEditGoal = () => {
    setEditingGoalId(null);
    setEditGoalData({});
  };
  const handleSaveGoal = () => {
    if (!editingGoalId || !editGoalData.title) return;
    setGoals(prev => prev.map(g => g.id === editingGoalId ? { ...g, title: editGoalData.title!, description: editGoalData.description || '' } : g));
    handleCancelEditGoal();
  };

  const handleOpenAddBlock = (startTime: string, endTime: string, parentId?: string) => {
    const startMin = timeToMin(startTime);
    const endMin = timeToMin(endTime);
    const duration = endMin - startMin;
    setModalGap({ start: startTime, end: endTime, duration, parentId });
    setFillDuration(Math.min(30, duration));
    setCustomTaskInput("");
    setPendingOriginalId(undefined);
    setIsModalOpen(true);
  };

  const handleAddScheduledBlock = (title: string, durationMinutes: number, originalId?: string) => {
    if (!modalGap) return;
    const startMin = timeToMin(modalGap.start);
    const endMin = startMin + durationMinutes;
    const h = Math.floor(endMin / 60);
    const m = endMin % 60;
    const endTimeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

    const newBlockId = Date.now().toString();
    const newBlock: ScheduledBlock = {
      id: newBlockId,
      title,
      startTime: modalGap.start,
      endTime: endTimeStr,
      type: TaskType.FLEXIBLE,
      isCompleted: false,
      originalFlexibleTaskId: originalId,
      parentId: modalGap.parentId
    };

    setScheduledBlocks(prev => [...prev, newBlock]);
    setIsModalOpen(false);

    generateTaskBanner(title).then(bannerUrl => {
       if (bannerUrl) {
           setScheduledBlocks(prev => prev.map(b => b.id === newBlockId ? { ...b, bannerUrl } : b));
       }
    });
  };

  const handleDeleteBlock = (blockId: string) => {
    setScheduledBlocks(prev => prev.filter(b => b.id !== blockId));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  };

  const handleGenerateTask = async () => {
    if (!modalGap) return;
    setIsAiLoading(true);
    setPendingOriginalId(undefined);
    try {
      const suggestion = await suggestFlexibleTask(userProfile, fillDuration, customTaskInput);
      setCustomTaskInput(suggestion.title);
    } catch (e) {
      alert("Failed to get AI suggestion");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleToggleComplete = (id: string) => {
    setScheduledBlocks(prev => prev.map(b => b.id === id ? { ...b, isCompleted: !b.isCompleted } : b));
  };
  const handleOpenTimer = (block: ScheduledBlock) => setActiveTimerBlock(block);
  const handleTimerComplete = (blockId: string) => { handleToggleComplete(blockId); setActiveTimerBlock(null); };
  
  const handleOpenIdeas = (block: ScheduledBlock) => {
      setActiveIdeaBlock(block);
      setIsAppLibraryOpen(false);
  };
  const handleOpenAppLibrary = (block: ScheduledBlock) => {
      setActiveIdeaBlock(block);
      setIsAppLibraryOpen(true);
  };
  const handleOpenAppGenerator = (methodTitle: string, methodDesc: string, mode: 'APP' | 'PAGE') => {
      setAppGeneratorData({ methodTitle, methodDesc, mode });
  };
  const handleSaveGeneratedApp = (code: string) => { 
      if (activeIdeaBlock && appGeneratorData) { 
          // Use unique key combining TaskID, App Name, and Mode
          const key = `${activeIdeaBlock.id}_${appGeneratorData.methodTitle.replace(/\s+/g, '_')}_${appGeneratorData.mode}`; 
          
          setGeneratedApps(prev => ({ ...prev, [key]: code })); 
          
          setScheduledBlocks(prev => prev.map(b => {
             if (b.id !== activeIdeaBlock.id) return b;
             if (appGeneratorData.mode === 'PAGE') {
                 return { ...b, generatedWebPageKey: key };
             } else {
                 return { ...b, generatedAppKey: key };
             }
          }));
      } 
  };
  const handleBookmarkApp = (code: string) => {
     if (activeIdeaBlock && appGeneratorData) {
         const newBookmark: BookmarkedApp = {
             id: Date.now().toString(),
             title: appGeneratorData.methodTitle,
             description: appGeneratorData.methodDesc,
             code: code,
             createdAt: new Date().toISOString(),
             type: appGeneratorData.mode // Save type
         };
         setBookmarkedApps(prev => [newBookmark, ...prev]);
     }
  };
  const handleSelectAppFromLibrary = (app: { title: string, description: string, code: string, type: 'APP' | 'PAGE' }) => {
      setAppGeneratorData({ 
          methodTitle: app.title, 
          methodDesc: app.description,
          initialCode: app.code,
          mode: app.type
      });
      // Link the selected app/page code to this task instance
      if (activeIdeaBlock) {
          const key = `${activeIdeaBlock.id}_${app.title.replace(/\s+/g, '_')}_${app.type}`;
          setGeneratedApps(prev => ({ ...prev, [key]: app.code }));
          
          setScheduledBlocks(prev => prev.map(b => {
              if (b.id !== activeIdeaBlock.id) return b;
              if (app.type === 'PAGE') {
                  return { ...b, generatedWebPageKey: key };
              } else {
                  return { ...b, generatedAppKey: key };
              }
          }));
      }
      setIsAppLibraryOpen(false);
  };
  const handleReopenAppFromEssay = (taskId: string, appTitle?: string) => {
     const task = scheduledBlocks.find(b => b.id === taskId);
     if (task && task.generatedAppKey) {
        const code = generatedApps[task.generatedAppKey];
        if (code) {
             setActiveIdeaBlock(task);
             setAppGeneratorData({
                 methodTitle: appTitle || "App",
                 methodDesc: "Re-opened from Essay",
                 initialCode: code,
                 mode: 'APP'
             });
        }
     }
  }
  const handleDeleteBookmarkedApp = (id: string) => {
      setBookmarkedApps(prev => prev.filter(app => app.id !== id));
  }
  const handleSaveReflection = (taskId: string, data: Partial<ScheduledBlock>) => {
    setScheduledBlocks(prev => prev.map(b => b.id === taskId ? { ...b, ...data } : b));
  };
  const handleSelectBlock = (blockId: string) => {
    setSelectedBlockId(blockId);
    // NEW: Auto-generate banner if missing
    const block = scheduledBlocks.find(b => b.id === blockId);
    if (block && !block.bannerUrl) {
         generateTaskBanner(block.title).then(url => {
            if(url) {
                setScheduledBlocks(prev => prev.map(b => b.id === blockId ? { ...b, bannerUrl: url } : b));
            }
         });
    }
  }

  const handleStatsReflection = async () => {
    if (currentStats.items.length === 0) return;
    setIsStatsReflecting(true);
    setStatsBannerUrl(null);
    try {
        const statsObj = currentStats.items.reduce((acc, item) => {
            acc[item.category] = item.minutes;
            return acc;
        }, {} as Record<string, number>);
        const [reflection, bannerUrl] = await Promise.all([
          generateStatsReflection(userProfile, statsObj),
          generateStatsBanner(userProfile, statsObj)
        ]);
        setStatsReflection(reflection);
        setStatsBannerUrl(bannerUrl);
    } catch (e) {
        console.error(e);
    } finally {
        setIsStatsReflecting(false);
    }
  }

  const handleGenerateEssay = async () => {
    setIsEssayGenerating(true);
    try {
        const completedFlexible = scheduledBlocks.filter(b => b.isCompleted);
        const completedFixed = fixedEvents
            .filter(e => completedFixedEventIds.includes(e.id))
            .map(e => ({
                id: e.id, title: e.title, startTime: e.startTime, endTime: e.endTime, type: TaskType.FIXED, isCompleted: true
            } as ScheduledBlock));
        const allCompleted = [...completedFlexible, ...completedFixed].sort((a,b) => timeToMin(a.startTime) - timeToMin(b.startTime));
        
        if (allCompleted.length === 0) {
            alert("No completed tasks to write about! 📝");
            return;
        }
        const data = await generateDailyEssay(userProfile, allCompleted);
        setEssayData(data);
    } catch (e) {
        console.error(e);
        alert("Failed to write essay.");
    } finally {
        setIsEssayGenerating(false);
    }
  }

  const handleAnalyzeDay = async () => {
    setIsAnalyzing(true);
    try {
      const completed = scheduledBlocks.filter(b => b.isCompleted);
      const goalPromise = analyzeDailyLog(userProfile, completed, goals);
      const fixedAsBlocks: ScheduledBlock[] = fixedEvents.map(e => ({
        id: e.id, title: e.title, startTime: e.startTime, endTime: e.endTime, type: TaskType.FIXED, isCompleted: true
      }));
      const allBlocks = [...fixedAsBlocks, ...scheduledBlocks].sort((a,b) => timeToMin(a.startTime) - timeToMin(b.startTime));
      const mindPromise = analyzeMentalHealth(userProfile, allBlocks);

      const [goalResult, mindResult] = await Promise.all([goalPromise, mindPromise]);
      setDailySummary(goalResult.summary);
      setMindHistory(prev => ({ ...prev, [mindResult.date]: mindResult }));
      const newGoals = [...goals];
      goalResult.achievements.forEach(ach => {
        const goalIdx = newGoals.findIndex(g => g.id === ach.goalId);
        if (goalIdx > -1) {
           newGoals[goalIdx] = { ...newGoals[goalIdx], achievements: [{ id: Date.now().toString() + Math.random(), date: new Date().toISOString(), description: ach.description, relatedTaskId: "batch" }, ...newGoals[goalIdx].achievements] };
        }
      });
      setGoals(newGoals);
    } catch (e) { alert("Analysis failed."); } finally { setIsAnalyzing(false); }
  };

  const getPriorityColor = (p: Priority) => {
    switch(p) {
      case Priority.HIGH: return 'bg-pink-500/20 text-pink-600 dark:text-pink-300 border-pink-500/30';
      case Priority.MEDIUM: return 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30';
      case Priority.LOW: return 'bg-teal-500/20 text-teal-600 dark:text-teal-300 border-teal-500/30';
    }
  };

  const selectedBlockData = scheduledBlocks.find(b => b.id === selectedBlockId);
  const todayDate = new Date().toISOString().split('T')[0];
  const displayMindAnalysis = mindHistory[todayDate] || Object.values(mindHistory).pop() || null;

  // Reusable Setting Selector Component
  const ModelSelector = ({ 
    label, 
    subLabel, 
    value, 
    onChange, 
    options 
  }: { 
    label: string, 
    subLabel: string, 
    value: string, 
    onChange: (val: string) => void,
    options: { value: string, label: string, tag?: string }[]
  }) => (
    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">{label}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subLabel}</p>
        </div>
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
            {options.map(opt => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        value === opt.value 
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-600' 
                        : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    </div>
  );

  // --- TOUR OVERLAY COMPONENT ---
  const TourOverlay = () => {
    const tourContent = [
        {
            title: "Your Identity 🌸",
            desc: "It starts here. The AI uses your profile to tailor every suggestion and analysis to your specific context."
        },
        {
            title: "Long-term Vision 🔭",
            desc: "Define your life's work. Notice how your big goals are already tracking achievements from your daily tasks."
        },
        {
            title: "Routine Design 🎨",
            desc: "Set your non-negotiables. This creates the canvas for your day, revealing the gaps where magic happens."
        },
        {
            title: "The Flow Timeline 🚀",
            desc: "This is the heart. Click on the task blocks. You'll see AI-generated reflections and even interactive apps created just for that task.",
            highlight: true
        },
        {
            title: "Your Daily Story 📔",
            desc: "No more blank pages. The AI Ghostwriter weaves your completed tasks into a beautiful narrative, complete with generated visuals."
        },
        {
            title: "Deep Insights 📊",
            desc: "Track your balance. See how your 'Energy' and 'Focus' scores fluctuate and get actionable advice to avoid burnout."
        }
    ];

    const currentTour = tourContent[tourStep];
    
    // Safety check if step is out of bounds
    if (!currentTour) return null;

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-md animate-fade-in">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-indigo-500/50 rounded-3xl p-6 shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
                {/* Glowing border effect */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">Showcase Mode • {tourStep + 1}/{tourContent.length}</span>
                    <button onClick={() => setIsDemoMode(false)} className="text-slate-500 hover:text-indigo-600 dark:hover:text-white"><X className="w-4 h-4"/></button>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{currentTour.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">{currentTour.desc}</p>
                
                <div className="flex gap-3">
                    <button 
                        onClick={() => setTourStep(Math.max(0, tourStep - 1))}
                        disabled={tourStep === 0}
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold disabled:opacity-50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        Previous
                    </button>
                    <button 
                        onClick={() => {
                            if (tourStep < tourContent.length - 1) {
                                setTourStep(tourStep + 1);
                            } else {
                                setIsDemoMode(false);
                            }
                        }}
                        className="flex-1 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2"
                    >
                        {tourStep < tourContent.length - 1 ? (
                            <>Next Step <ArrowRight className="w-3 h-3"/></>
                        ) : (
                            "End Showcase"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className={theme}>
      {landingStatus !== 'HIDDEN' && (
        <LandingPage 
            onEnter={handleEnterApp} 
            onShowcase={handleStartShowcase}
            isExiting={landingStatus === 'EXITING'} 
        />
      )}
      
      <div className={`transition-all duration-1000 ease-in-out ${landingStatus !== 'HIDDEN' ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-200/40 via-slate-50 to-white dark:from-pink-900/40 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-20 md:pb-0 h-screen overflow-hidden flex flex-col relative selection:bg-pink-500/30 animate-fade-in transition-colors duration-500">
          
          {/* Header */}
          <header className="shrink-0 z-40 bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 px-6 py-4 flex justify-between items-center relative shadow-sm transition-colors duration-300">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-teal-500 dark:from-pink-300 dark:via-purple-300 dark:to-teal-300 bg-clip-text text-transparent drop-shadow-sm flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-pink-500 dark:text-pink-400 fill-pink-500/10 dark:fill-pink-400/50" /> Lumina
            </h1>
            <div className="flex items-center gap-4">
                 {userProfile.name && <span className="text-sm text-pink-600 dark:text-pink-200/80 font-medium tracking-wide flex items-center gap-2 hidden sm:flex">✨ Hi, {userProfile.name}</span>}
                 <button 
                   onClick={toggleTheme}
                   className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                   title="Toggle Theme"
                 >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                 </button>
            </div>
          </header>

          <main className={`flex-1 mx-auto p-4 md:p-6 w-full relative z-10 ${activeTab === Tab.DAILY || activeTab === Tab.STRUCTURE ? 'h-full overflow-hidden' : 'overflow-y-auto'}`}>
            
            {/* DEMO TOUR OVERLAY */}
            {isDemoMode && <TourOverlay />}

            {/* PROFILE TAB */}
            {activeTab === Tab.PROFILE && (
              <div className="space-y-6 animate-fade-in overflow-y-auto h-full p-2 w-full md:w-[70%] mx-auto">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">My Profile 🌸</h2>
                <div className="bg-white/60 dark:bg-slate-800/40 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 space-y-6 shadow-xl transition-colors">
                  {/* ... Existing Profile Inputs ... */}
                  <div>
                    <label className="block text-sm font-bold text-pink-600 dark:text-pink-200 mb-2">Name</label>
                    <input type="text" name="name" value={userProfile.name} onChange={handleProfileChange} className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-pink-500/50 outline-none backdrop-blur-sm transition-all text-slate-900 dark:text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-pink-600 dark:text-pink-200 mb-2">Age</label>
                      <input type="number" name="age" value={userProfile.age} onChange={handleProfileChange} className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-pink-500/50 outline-none backdrop-blur-sm transition-all text-slate-900 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-pink-600 dark:text-pink-200 mb-2">Gender</label>
                      <select name="gender" value={userProfile.gender} onChange={handleProfileChange} className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-pink-500/50 outline-none backdrop-blur-sm transition-all text-slate-900 dark:text-slate-300">
                        <option value="">Select...</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-pink-600 dark:text-pink-200 mb-2">Background</label>
                    <input type="text" name="race" value={userProfile.race} onChange={handleProfileChange} className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-pink-500/50 outline-none backdrop-blur-sm transition-all text-slate-900 dark:text-white" placeholder="e.g. Asian, Hispanic, etc." />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-pink-600 dark:text-pink-200 mb-2">Bio</label>
                    <textarea name="bio" value={userProfile.bio} onChange={handleProfileChange} className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-pink-500/50 outline-none h-32 backdrop-blur-sm transition-all resize-none text-slate-900 dark:text-white" />
                  </div>
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === Tab.SETTINGS && (
              <div className="space-y-8 animate-fade-in mx-auto p-2 w-full md:w-[70%] h-full overflow-y-auto">
                 <div className="flex flex-col gap-1 mb-6">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                      <Settings className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
                      App Settings
                    </h2>
                    <p className="text-indigo-600/60 dark:text-indigo-200/60 text-sm">Configure the intelligence behind each feature.</p>
                 </div>

                 {/* Group 1: Text Models */}
                 <div className="bg-white/60 dark:bg-slate-800/40 backdrop-blur-xl rounded-[2rem] border border-slate-200 dark:border-white/5 p-8 shadow-xl space-y-6 transition-colors">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                       <Sparkles className="w-5 h-5 text-indigo-500 dark:text-indigo-400" /> Reasoning Engines
                    </h3>
                    
                    <ModelSelector 
                        label="General Assistant" 
                        subLabel="Task suggestions, Mental health analysis, Stats reflections."
                        value={modelSettings.basicAnalysisModel}
                        onChange={(val) => setModelSettings({...modelSettings, basicAnalysisModel: val})}
                        options={[
                            { value: 'gemini-2.5-flash', label: 'Flash 2.5 (Fast)' },
                            { value: 'gemini-3-pro-preview', label: 'Pro 3.0 (Smart)' }
                        ]}
                    />

                    <ModelSelector 
                        label="App Builder" 
                        subLabel="Code generation for mini-tools and learning aids."
                        value={modelSettings.appGeneratorModel}
                        onChange={(val) => setModelSettings({...modelSettings, appGeneratorModel: val})}
                        options={[
                            { value: 'gemini-2.5-flash', label: 'Flash 2.5' },
                            { value: 'gemini-3-pro-preview', label: 'Pro 3.0 (Rec)' }
                        ]}
                    />

                    <ModelSelector 
                        label="Storyteller" 
                        subLabel="Writing your daily essay/diary entry."
                        value={modelSettings.storytellingModel}
                        onChange={(val) => setModelSettings({...modelSettings, storytellingModel: val})}
                        options={[
                            { value: 'gemini-2.5-flash', label: 'Flash 2.5' },
                            { value: 'gemini-3-pro-preview', label: 'Pro 3.0' }
                        ]}
                    />
                 </div>

                 {/* Group 2: Image Models */}
                 <div className="bg-white/60 dark:bg-slate-800/40 backdrop-blur-xl rounded-[2rem] border border-slate-200 dark:border-white/5 p-8 shadow-xl space-y-6 transition-colors">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                       <Zap className="w-5 h-5 text-pink-500 dark:text-pink-400" /> Visual Studio
                    </h3>
                    
                    <ModelSelector 
                        label="Interface Banners" 
                        subLabel="Abstract headers for Tasks and Stats."
                        value={modelSettings.bannerImageModel}
                        onChange={(val) => setModelSettings({...modelSettings, bannerImageModel: val})}
                        options={[
                            { value: 'gemini-2.5-flash-image', label: 'Flash Image' },
                            { value: 'gemini-3-pro-image-preview', label: 'Pro Image' }
                        ]}
                    />

                    <ModelSelector 
                        label="Memory Visualization" 
                        subLabel="Photorealistic reflection images for logs."
                        value={modelSettings.reflectionImageModel}
                        onChange={(val) => setModelSettings({...modelSettings, reflectionImageModel: val})}
                        options={[
                            { value: 'gemini-2.5-flash-image', label: 'Flash Image' },
                            { value: 'gemini-3-pro-image-preview', label: 'Pro Image (Rec)' }
                        ]}
                    />
                 </div>
              </div>
            )}

            {/* STRUCTURE TAB */}
            {activeTab === Tab.STRUCTURE && (
              <div className="flex flex-col h-full animate-fade-in w-full md:w-[70%] mx-auto">
                <div className="shrink-0 mb-6 flex flex-col gap-1 p-2">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Design Your Day 🎨</h2>
                  <p className="text-pink-600/60 dark:text-pink-200/60 text-sm">Create your perfect routine!</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto pb-20 pr-2">
                    {/* COLUMN 1: FIXED */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-pink-600 dark:text-pink-300 flex items-center gap-2 border-b border-pink-500/20 pb-2"><Clock className="w-5 h-5"/> Fixed Schedule</h3>
                      <div className="space-y-3">
                        {fixedEvents.map((event) => (
                          <div key={event.id} className="bg-white/80 dark:bg-slate-800/40 backdrop-blur-md border border-slate-200 dark:border-white/5 p-4 rounded-3xl flex justify-between items-center group relative shadow-lg hover:bg-white dark:hover:bg-slate-800/60 transition-all hover:scale-[1.02]">
                              {editingFixedId === event.id ? (
                                <div className="flex flex-col gap-3 w-full">
                                  <CreatableSelect 
                                    options={COMMON_FIXED_TITLES}
                                    value={editFixedData.title || ''}
                                    onChange={(val) => setEditFixedData({...editFixedData, title: val})}
                                    placeholder="Event Name"
                                    className="bg-white dark:bg-slate-900/50 border border-pink-500/30 rounded-xl px-3 py-2 text-sm outline-none w-full text-slate-900 dark:text-white"
                                    autoFocus
                                  />
                                  <div className="flex gap-2 items-center">
                                      <input type="time" value={editFixedData.startTime} onChange={e => setEditFixedData({...editFixedData, startTime: e.target.value})} className="flex-1 bg-white dark:bg-slate-900/50 border border-pink-500/30 rounded-xl px-2 py-2 text-sm outline-none text-slate-900 dark:text-white" />
                                      <input type="time" value={editFixedData.endTime} onChange={e => setEditFixedData({...editFixedData, endTime: e.target.value})} className="flex-1 bg-white dark:bg-slate-900/50 border border-pink-500/30 rounded-xl px-2 py-2 text-sm outline-none text-slate-900 dark:text-white" />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <label className="flex items-center gap-2 text-xs text-pink-600 dark:text-pink-200 cursor-pointer select-none">
                                        <input type="checkbox" checked={editFixedData.doNotDisturb || false} onChange={e => setEditFixedData({...editFixedData, doNotDisturb: e.target.checked})} className="accent-pink-500 w-4 h-4 rounded border-pink-500/50 bg-white dark:bg-slate-900/50" />
                                        <span>Do not disturb 🚫</span>
                                    </label>
                                  </div>
                                  <div className="flex gap-2 mt-1">
                                      <button onClick={handleSaveFixed} className="flex-1 p-2 bg-teal-500/20 text-teal-600 dark:text-teal-300 rounded-xl hover:bg-teal-500/30"><Save className="w-4 h-4 mx-auto"/></button>
                                      <button onClick={handleCancelEditFixed} className="flex-1 p-2 bg-pink-500/20 text-pink-600 dark:text-pink-300 rounded-xl hover:bg-pink-500/30"><X className="w-4 h-4 mx-auto"/></button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center gap-4">
                                    <div className="w-1.5 h-10 bg-pink-400 rounded-full shadow-[0_0_10px_rgba(244,114,182,0.5)]"></div>
                                    <div>
                                      <h3 className="font-bold text-slate-900 dark:text-pink-100 flex items-center gap-2">
                                        {event.title}
                                        {event.doNotDisturb && <BellOff className="w-3 h-3 text-pink-500 dark:text-pink-400/70" />}
                                      </h3>
                                      <p className="text-xs text-slate-500 dark:text-pink-300/70 font-mono tracking-wider">{event.startTime} - {event.endTime}</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity absolute right-4">
                                    <button onClick={() => handleStartEditFixed(event)} className="p-2 bg-slate-200 dark:bg-slate-700/50 rounded-full text-slate-500 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-300 hover:bg-pink-500/20 backdrop-blur-sm"><Pencil className="w-4 h-4"/></button>
                                    <button onClick={() => handleDeleteFixedEvent(event.id)} className="p-2 bg-slate-200 dark:bg-slate-700/50 rounded-full text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-500/20 backdrop-blur-sm"><Trash2 className="w-4 h-4"/></button>
                                  </div>
                                </>
                              )}
                          </div>
                        ))}
                        
                        {/* Inline Add Fixed */}
                        {isAddingFixed ? (
                            <div className="bg-white/80 dark:bg-slate-800/60 border border-pink-500/30 p-4 rounded-3xl space-y-3 shadow-lg backdrop-blur-md">
                                <CreatableSelect 
                                    options={COMMON_FIXED_TITLES}
                                    value={newEvent.title}
                                    onChange={(val) => setNewEvent({...newEvent, title: val})}
                                    placeholder="Event Name"
                                    className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-pink-500 text-slate-900 dark:text-white"
                                    autoFocus
                                />
                                <div className="flex gap-2 items-center">
                                  <input type="time" value={newEvent.start} onChange={e => setNewEvent({...newEvent, start: e.target.value})} className="flex-1 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl px-2 py-2 text-sm outline-none text-slate-900 dark:text-white" />
                                  <input type="time" value={newEvent.end} onChange={e => setNewEvent({...newEvent, end: e.target.value})} className="flex-1 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl px-2 py-2 text-sm outline-none text-slate-900 dark:text-white" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="flex items-center gap-2 text-xs text-pink-600 dark:text-pink-200 cursor-pointer select-none">
                                        <input type="checkbox" checked={newEvent.doNotDisturb} onChange={e => setNewEvent({...newEvent, doNotDisturb: e.target.checked})} className="accent-pink-500 w-4 h-4 rounded border-pink-500/50 bg-white dark:bg-slate-900/50" />
                                        <span>Do not disturb 🚫</span>
                                    </label>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleAddFixedEvent} className="flex-1 bg-pink-500 text-white rounded-xl py-2 text-xs font-bold uppercase hover:bg-pink-400 shadow-lg shadow-pink-500/20">Save</button>
                                    <button onClick={() => setIsAddingFixed(false)} className="px-3 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:text-slate-900 dark:hover:text-white"><X className="w-4 h-4"/></button>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => setIsAddingFixed(true)} className="w-full py-3 border-2 border-dashed border-pink-500/20 rounded-3xl text-pink-400 dark:text-pink-300/50 hover:border-pink-500/50 hover:text-pink-600 dark:hover:text-pink-300 hover:bg-pink-500/5 transition-all flex items-center justify-center gap-2 font-medium text-sm backdrop-blur-sm">
                                <Plus className="w-4 h-4" /> Add Fixed Event
                            </button>
                        )}
                      </div>
                    </div>

                    {/* COLUMN 2: FIXED LIBRARY */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-violet-600 dark:text-violet-300 flex items-center gap-2 border-b border-violet-500/20 pb-2">
                        <Briefcase className="w-5 h-5"/> Task Library
                      </h3>
                      <div className="space-y-3">
                          {fixedPresets.map(preset => (
                            <div key={preset.id} className="bg-white/80 dark:bg-slate-800/40 backdrop-blur-md border border-slate-200 dark:border-white/5 p-4 rounded-3xl flex justify-between items-center group hover:bg-white dark:hover:bg-slate-800/60 transition-all hover:scale-[1.02] shadow-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-violet-400 rounded-full group-hover:bg-violet-300 transition-colors"></div>
                                    <span className="font-medium text-slate-900 dark:text-violet-100 text-sm">{preset.title}</span>
                                </div>
                                <button onClick={() => handleDeletePreset(preset.id)} className="text-slate-500 hover:text-red-500 dark:hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-200 dark:bg-slate-700/50 p-1.5 rounded-full backdrop-blur-sm"><X className="w-4 h-4"/></button>
                            </div>
                          ))}

                          {/* Inline Add Preset */}
                          {isAddingPreset ? (
                              <div className="bg-white/80 dark:bg-slate-800/60 border border-violet-500/30 p-3 rounded-3xl flex gap-2 shadow-lg backdrop-blur-md items-center">
                                  <CreatableSelect 
                                    options={COMMON_PRESET_TITLES}
                                    value={newPreset.title}
                                    onChange={(val) => setNewPreset({...newPreset, title: val})}
                                    placeholder="Preset Name"
                                    className="flex-1 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-violet-500 w-full text-slate-900 dark:text-white"
                                    autoFocus
                                  />
                                  <button onClick={handleAddPreset} className="bg-violet-500 text-white rounded-xl px-3 hover:bg-violet-400 py-2 h-full"><Plus className="w-4 h-4"/></button>
                                  <button onClick={() => setIsAddingPreset(false)} className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl px-3 hover:text-slate-900 dark:hover:text-white py-2 h-full"><X className="w-4 h-4"/></button>
                              </div>
                          ) : (
                              <button onClick={() => setIsAddingPreset(true)} className="w-full py-3 border-2 border-dashed border-violet-500/20 rounded-3xl text-violet-400 dark:text-violet-300/50 hover:border-violet-500/50 hover:text-violet-600 dark:hover:text-violet-300 hover:bg-violet-500/5 transition-all flex items-center justify-center gap-2 font-medium text-sm backdrop-blur-sm">
                                  <Plus className="w-4 h-4" /> Add Preset
                              </button>
                          )}
                      </div>
                    </div>

                    {/* COLUMN 3: FLEXIBLE LIBRARY */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-teal-600 dark:text-teal-300 flex items-center gap-2 border-b border-teal-500/20 pb-2">
                        <List className="w-5 h-5"/> Flexible Tasks
                      </h3>
                      <div className="space-y-3">
                        {flexibleTasks.map((task) => (
                          <div key={task.id} className="bg-white/80 dark:bg-slate-800/40 backdrop-blur-md border border-slate-200 dark:border-white/5 p-4 rounded-3xl flex justify-between items-center group relative shadow-lg hover:bg-white dark:hover:bg-slate-800/60 transition-all hover:scale-[1.02]">
                            {editingFlexibleId === task.id ? (
                                <div className="flex flex-col gap-3 w-full">
                                  <CreatableSelect 
                                    options={COMMON_FLEXIBLE_TITLES}
                                    value={editFlexibleData.title || ''}
                                    onChange={(val) => setEditFlexibleData({...editFlexibleData, title: val})}
                                    placeholder="Task Name"
                                    className="bg-white dark:bg-slate-900/50 border border-teal-500/30 rounded-xl px-3 py-2 text-sm outline-none w-full text-slate-900 dark:text-white"
                                    autoFocus
                                  />
                                  <div className="flex gap-2 items-center">
                                      <select value={editFlexibleData.priority} onChange={e => setEditFlexibleData({...editFlexibleData, priority: e.target.value as Priority})} className="w-full bg-white dark:bg-slate-900/50 border border-teal-500/30 rounded-xl px-3 py-2 text-sm outline-none text-slate-900 dark:text-white">
                                          <option value={Priority.HIGH}>High</option>
                                          <option value={Priority.MEDIUM}>Medium</option>
                                          <option value={Priority.LOW}>Low</option>
                                      </select>
                                  </div>
                                  <div className="flex gap-2 mt-1">
                                      <button onClick={handleSaveFlexible} className="flex-1 p-2 bg-teal-500/20 text-teal-600 dark:text-teal-300 rounded-xl hover:bg-teal-500/30"><Save className="w-4 h-4 mx-auto"/></button>
                                      <button onClick={handleCancelEditFlexible} className="flex-1 p-2 bg-pink-500/20 text-pink-600 dark:text-pink-300 rounded-xl hover:bg-pink-500/30"><X className="w-4 h-4 mx-auto"/></button>
                                  </div>
                                </div>
                            ) : (
                                <>
                                  <div className="flex items-center gap-4">
                                      <div className="w-1.5 h-10 bg-teal-400 rounded-full shadow-[0_0_10px_rgba(45,212,191,0.5)]"></div>
                                      <div>
                                        <h3 className="font-bold text-slate-900 dark:text-teal-100">{task.title}</h3>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                                      </div>
                                  </div>
                                  <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity absolute right-4">
                                      <button onClick={() => handleStartEditFlexible(task)} className="p-2 bg-slate-200 dark:bg-slate-700/50 rounded-full text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-300 hover:bg-teal-500/20 backdrop-blur-sm"><Pencil className="w-4 h-4"/></button>
                                      <button onClick={() => handleDeleteFlexibleTask(task.id)} className="p-2 bg-slate-200 dark:bg-slate-700/50 rounded-full text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-500/20 backdrop-blur-sm"><Trash2 className="w-4 h-4"/></button>
                                  </div>
                                </>
                            )}
                          </div>
                        ))}

                        {/* Inline Add Flexible */}
                        {isAddingFlexible ? (
                            <div className="bg-white/80 dark:bg-slate-800/60 border border-teal-500/30 p-4 rounded-3xl space-y-3 shadow-lg backdrop-blur-md">
                                <CreatableSelect 
                                    options={COMMON_FLEXIBLE_TITLES}
                                    value={newFlexibleTask.title}
                                    onChange={(val) => setNewFlexibleTask({...newFlexibleTask, title: val})}
                                    placeholder="Task Name"
                                    className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-white"
                                    autoFocus
                                />
                                <select value={newFlexibleTask.priority} onChange={e => setNewFlexibleTask({...newFlexibleTask, priority: e.target.value as Priority})} className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none text-slate-900 dark:text-white">
                                    <option value={Priority.HIGH}>High Priority</option>
                                    <option value={Priority.MEDIUM}>Medium Priority</option>
                                    <option value={Priority.LOW}>Low Priority</option>
                                </select>
                                <div className="flex gap-2">
                                    <button onClick={handleAddFlexibleTask} className="flex-1 bg-teal-500 text-white rounded-xl py-2 text-xs font-bold uppercase hover:bg-teal-400 shadow-lg shadow-teal-500/20">Save</button>
                                    <button onClick={() => setIsAddingFlexible(false)} className="px-3 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:text-slate-900 dark:hover:text-white"><X className="w-4 h-4"/></button>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => setIsAddingFlexible(true)} className="w-full py-3 border-2 border-dashed border-teal-500/20 rounded-3xl text-teal-400 dark:text-teal-300/50 hover:border-teal-500/50 hover:text-teal-600 dark:hover:text-teal-300 hover:bg-teal-500/5 transition-all flex items-center justify-center gap-2 font-medium text-sm backdrop-blur-sm">
                                <Plus className="w-4 h-4" /> Add Flexible Task
                            </button>
                        )}
                      </div>
                    </div>
                </div>
              </div>
            )}

            {/* DAILY TAB (RECONSTRUCTED) */}
            {activeTab === Tab.DAILY && (
              <div className="h-full flex flex-col md:flex-row gap-6 overflow-hidden animate-fade-in w-full md:w-[70%] mx-auto">
                {/* Left: Timeline */}
                <div className="flex-1 overflow-y-auto pb-20 custom-scrollbar relative">
                    <div className="mb-4 flex justify-between items-center sticky top-0 bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl z-20 py-3 transition-colors rounded-xl border border-white/20 dark:border-white/5 shadow-sm">
                      <h2 className="text-3xl font-bold text-slate-900 dark:text-white pl-4">Daily Flow 🌊</h2>
                      <div className="flex gap-2 pr-2">
                          <button onClick={handleAnalyzeDay} disabled={isAnalyzing} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50 shadow-md shadow-indigo-500/20">
                            {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3"/>}
                            Analyze
                          </button>
                      </div>
                    </div>
                    
                    <Timeline 
                      fixedEvents={fixedEvents}
                      flexibleBlocks={scheduledBlocks}
                      onAddBlock={handleOpenAddBlock}
                      onToggleComplete={handleToggleComplete}
                      onOpenTimer={handleOpenTimer}
                      onOpenIdeas={handleOpenIdeas}
                      onOpenAppLibrary={handleOpenAppLibrary}
                      selectedBlockId={selectedBlockId}
                      onSelectBlock={handleSelectBlock}
                      completedFixedEventIds={completedFixedEventIds}
                      onToggleFixedComplete={handleToggleFixedComplete}
                      onDeleteBlock={handleDeleteBlock}
                    />
                </div>

                {/* Right: Reflection / Details */}
                <div className={`md:w-[400px] shrink-0 border-l border-slate-200 dark:border-white/10 bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl absolute md:relative inset-y-0 right-0 transform transition-transform duration-300 z-30 ${selectedBlockId ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
                    {selectedBlockData ? (
                      <TaskReflectionPanel 
                          task={selectedBlockData}
                          user={userProfile}
                          onSave={handleSaveReflection}
                      />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-8 text-center">
                          <Activity className="w-12 h-12 mb-4 opacity-20" />
                          <p>Select a task from the timeline to journal, capture memories, or use tools.</p>
                      </div>
                    )}
                    {/* Close button for mobile */}
                    {selectedBlockId && (
                        <button onClick={() => setSelectedBlockId(null)} className="absolute top-4 right-4 md:hidden p-2 bg-slate-200 dark:bg-slate-800 rounded-full text-slate-900 dark:text-white"><X className="w-4 h-4"/></button>
                    )}
                </div>
              </div>
            )}

            {/* GOALS TAB */}
            {activeTab === Tab.GOALS && (
              <div className="h-full overflow-y-auto pb-20 animate-fade-in w-full md:w-[70%] mx-auto">
                <div className="flex justify-between items-end mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Life Goals 🔭</h2>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Align your daily actions with your biggest dreams.</p>
                    </div>
                    <button onClick={() => setIsAddingGoal(true)} className="px-4 py-2 bg-pink-500 hover:bg-pink-400 text-white rounded-xl text-xs font-bold flex items-center gap-2">
                      <Plus className="w-4 h-4"/> New Goal
                    </button>
                </div>

                <div className="space-y-6">
                    {isAddingGoal && (
                        <div className="bg-white/80 dark:bg-slate-800/60 border border-pink-500/50 p-6 rounded-3xl animate-fade-in space-y-4 shadow-lg">
                          <input type="text" placeholder="Goal Title (e.g., Run a Marathon)" value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:border-pink-500" autoFocus />
                          <textarea placeholder="Why is this important?" value={newGoal.description} onChange={e => setNewGoal({...newGoal, description: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:border-pink-500 h-24 resize-none" />
                          <div className="flex justify-end gap-2">
                              <button onClick={() => setIsAddingGoal(false)} className="px-4 py-2 text-slate-500 hover:text-slate-800 dark:hover:text-white">Cancel</button>
                              <button onClick={handleAddGoal} className="px-6 py-2 bg-pink-500 text-white rounded-xl font-bold">Save Goal</button>
                          </div>
                        </div>
                    )}

                    {goals.map(goal => (
                        <div key={goal.id} className="bg-white/60 dark:bg-slate-800/40 border border-slate-200 dark:border-white/5 rounded-3xl p-6 hover:bg-white/80 dark:hover:bg-slate-800/60 transition-all group shadow-sm">
                            {editingGoalId === goal.id ? (
                                <div className="space-y-4">
                                  <input type="text" value={editGoalData.title} onChange={e => setEditGoalData({...editGoalData, title: e.target.value})} className="w-full bg-white dark:bg-slate-900 p-2 rounded-lg text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700" />
                                  <textarea value={editGoalData.description} onChange={e => setEditGoalData({...editGoalData, description: e.target.value})} className="w-full bg-white dark:bg-slate-900 p-2 rounded-lg text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700" />
                                  <div className="flex gap-2">
                                      <button onClick={handleSaveGoal} className="px-3 py-1 bg-green-500/20 text-green-600 dark:text-green-300 rounded">Save</button>
                                      <button onClick={handleCancelEditGoal} className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">Cancel</button>
                                  </div>
                                </div>
                            ) : (
                                <>
                                  <div className="flex justify-between items-start mb-4">
                                      <div>
                                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{goal.title}</h3>
                                          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-2xl">{goal.description}</p>
                                      </div>
                                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button onClick={() => handleStartEditGoal(goal)} className="p-2 bg-slate-200 dark:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"><Pencil className="w-4 h-4"/></button>
                                          <button onClick={() => handleDeleteGoal(goal.id)} className="p-2 bg-slate-200 dark:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"><Trash2 className="w-4 h-4"/></button>
                                      </div>
                                  </div>
                                  {/* Achievements */}
                                  <div className="space-y-2">
                                      {goal.achievements.length > 0 ? (
                                          goal.achievements.map(ach => (
                                              <div key={ach.id} className="flex items-center gap-3 text-sm text-emerald-700 dark:text-emerald-200/80 bg-emerald-100 dark:bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                                                  <Sparkles className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                                                  <span>{ach.description}</span>
                                                  <span className="text-xs text-emerald-600/60 dark:text-emerald-500/40 ml-auto">{new Date(ach.date).toLocaleDateString()}</span>
                                              </div>
                                          ))
                                      ) : (
                                          <div className="text-xs text-slate-500 dark:text-slate-600 italic">No achievements recorded yet. Complete tasks and earn them!</div>
                                      )}
                                  </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
              </div>
            )}

            {/* INSIGHTS TAB */}
            {activeTab === Tab.INSIGHTS && (
              <div className="h-full overflow-y-auto pb-20 animate-fade-in w-full md:w-[70%] mx-auto space-y-8">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Insights & Analytics 📊</h2>
                  
                  {/* Stats Banner */}
                  <div className="bg-white/60 dark:bg-slate-800/40 border border-slate-200 dark:border-white/5 rounded-3xl p-6 relative overflow-hidden shadow-sm transition-colors">
                      {statsBannerUrl ? (
                          <div className="absolute inset-0">
                              <img src={statsBannerUrl} className="w-full h-full object-cover opacity-20 dark:opacity-40" />
                              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-slate-900 dark:via-slate-900/80 dark:to-transparent"></div>
                          </div>
                      ) : null}
                      <div className="relative z-10">
                          <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><PieChart className="w-5 h-5"/> Time Distribution</h3>
                            <button onClick={handleStatsReflection} disabled={isStatsReflecting} className="px-3 py-1.5 bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/30 rounded-lg text-xs font-bold flex items-center gap-2">
                                {isStatsReflecting ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3"/>} Reflect
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-4">
                              {currentStats.items.map(stat => (
                                  <div key={stat.category} className="flex items-center gap-2 bg-white/80 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-200 dark:border-white/5 shadow-sm">
                                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stat.color }}></div>
                                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{stat.category}</span>
                                      <span className="text-xs text-slate-500">({Math.round(stat.percentage)}%)</span>
                                  </div>
                              ))}
                          </div>
                          {statsReflection && (
                              <div className="mt-6 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-xl border border-indigo-500/20 text-sm space-y-4 shadow-sm">
                                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">"{statsReflection.summary}"</p>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div><h4 className="font-bold text-emerald-600 dark:text-emerald-400 mb-1 text-xs uppercase">Strengths</h4><div className="flex flex-wrap gap-1">{statsReflection.strengths.map(s => <span key={s} className="px-2 py-0.5 bg-emerald-500/10 rounded text-emerald-700 dark:text-emerald-300 text-xs">{s}</span>)}</div></div>
                                      <div><h4 className="font-bold text-red-600 dark:text-red-400 mb-1 text-xs uppercase">Weaknesses</h4><div className="flex flex-wrap gap-1">{statsReflection.weaknesses.map(s => <span key={s} className="px-2 py-0.5 bg-red-500/10 rounded text-red-700 dark:text-red-300 text-xs">{s}</span>)}</div></div>
                                      <div><h4 className="font-bold text-yellow-600 dark:text-yellow-400 mb-1 text-xs uppercase">Suggestions</h4><div className="flex flex-wrap gap-1">{statsReflection.suggestions.map(s => <span key={s} className="px-2 py-0.5 bg-yellow-500/10 rounded text-yellow-700 dark:text-yellow-300 text-xs">{s}</span>)}</div></div>
                                  </div>
                              </div>
                          )}
                      </div>
                  </div>

                  {/* Mental Health */}
                  <div className="bg-white/60 dark:bg-slate-800/40 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Activity className="w-5 h-5"/> Mental Wellness</h3>
                      {displayMindAnalysis ? (
                          <div className="space-y-6">
                              <div className="flex items-center gap-4">
                                  <div className="text-4xl">🧘</div>
                                  <div>
                                      <div className="text-sm text-slate-500 dark:text-slate-400 uppercase font-bold">Overall Mood</div>
                                      <div className="text-2xl font-bold text-slate-900 dark:text-white">{displayMindAnalysis.overallMood}</div>
                                  </div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  {Object.entries(displayMindAnalysis.categories).map(([key, val]) => {
                                      const data = val as MindCategory;
                                      return (
                                      <div key={key} className="bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-white/5 text-center shadow-sm">
                                          <div className="text-xs text-slate-500 uppercase font-bold mb-2">{key}</div>
                                          <div className="text-xl font-bold text-slate-900 dark:text-white mb-1">{data.label}</div>
                                          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                              <div className={`h-full ${key === 'stress' ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${data.score}%` }}></div>
                                          </div>
                                      </div>
                                  )})}
                              </div>
                              <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl flex items-start gap-3">
                                  <Lightbulb className="w-5 h-5 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" />
                                  <p className="text-indigo-800 dark:text-indigo-200 text-sm">{displayMindAnalysis.advice}</p>
                              </div>
                          </div>
                      ) : (
                          <div className="text-center py-8 text-slate-500">
                              No analysis for today yet. Complete tasks and click "Analyze" in the Daily tab.
                          </div>
                      )}
                  </div>
              </div>
            )}

            {/* ESSAY TAB */}
            {activeTab === Tab.ESSAY && (
              <div className="h-full overflow-y-auto pb-20 animate-fade-in w-full md:w-[70%] mx-auto">
                  <div className="flex justify-between items-center mb-8">
                      <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><BookOpen className="w-6 h-6"/> Daily Story</h2>
                      <button onClick={handleGenerateEssay} disabled={isEssayGenerating} className="px-5 py-2 bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-400 hover:to-violet-500 text-white rounded-full font-bold shadow-lg shadow-purple-500/20 flex items-center gap-2 disabled:opacity-50 transition-all">
                          {isEssayGenerating ? <Loader2 className="w-4 h-4 animate-spin"/> : <PenTool className="w-4 h-4"/>}
                          Write My Story
                      </button>
                  </div>

                  {essayData ? (
                      <article className="bg-slate-50 text-slate-900 p-8 md:p-12 rounded-[2px] shadow-2xl relative">
                          {/* Paper texture effect */}
                          <div className="absolute inset-0 bg-[#fdfbf7] opacity-100 rounded-[2px] pointer-events-none"></div>
                          <div className="relative z-10 font-serif">
                              <div className="text-center mb-10 border-b-2 border-slate-900/10 pb-8">
                                  <div className="text-xs font-sans font-bold text-slate-400 uppercase tracking-widest mb-2">{new Date(essayData.date).toLocaleDateString(undefined, {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}</div>
                                  <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-4">{essayData.title}</h1>
                                  <div className="w-16 h-1 bg-slate-900 mx-auto"></div>
                              </div>
                              
                              <div className="space-y-6 text-lg leading-relaxed text-slate-800">
                                  {essayData.sections.map((section, idx) => {
                                      if (section.type === 'text') return <p key={idx}>{section.content}</p>;
                                      if (section.type === 'highlight') return (
                                          <span key={idx} className="bg-yellow-200 px-1 py-0.5 rounded cursor-help relative group" title={section.tooltip}>
                                              {section.content}
                                          </span>
                                      );
                                      if (section.type === 'app_link') return (
                                          <div key={idx} className="my-6 p-4 bg-slate-50 border-l-4 border-indigo-500 rounded-r-lg flex items-center justify-between group cursor-pointer hover:bg-indigo-50 transition-colors" onClick={() => section.relatedTaskId && handleReopenAppFromEssay(section.relatedTaskId, section.appTitle)}>
                                              <div>
                                                  <div className="text-xs font-sans font-bold text-indigo-500 uppercase tracking-wider mb-1">Tool Used</div>
                                                  <div className="font-sans font-bold text-slate-900">{section.appTitle || "Custom App"}</div>
                                              </div>
                                              <div className="flex items-center gap-2 text-indigo-600 font-sans font-bold text-sm group-hover:translate-x-1 transition-transform">
                                                  {section.content} <ArrowRight className="w-4 h-4"/>
                                              </div>
                                          </div>
                                      );
                                      if (section.type === 'image') return (
                                          <EssayImage 
                                            key={idx}
                                            src={(() => {
                                                const task = scheduledBlocks.find(b => b.id === section.relatedTaskId);
                                                return task?.imageUrl || '';
                                            })()}
                                            alt={section.content}
                                            caption={section.content}
                                          />
                                      );
                                      return null;
                                  })}
                              </div>
                          </div>
                      </article>
                  ) : (
                      <div className="text-center py-20 opacity-50">
                          <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-400 dark:text-slate-600" />
                          <p className="text-xl text-slate-500 dark:text-slate-500">Your story hasn't been written yet.</p>
                      </div>
                  )}
              </div>
            )}

            {/* Add Task Modal */}
            {isModalOpen && modalGap && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 w-full max-w-md p-6 shadow-2xl space-y-6 transition-colors">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Fill Gap</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white"><X className="w-5 h-5"/></button>
                        </div>
                        
                        <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Available Time</div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{modalGap.start} - {modalGap.end} <span className="text-emerald-600 dark:text-emerald-400">({modalGap.duration}m)</span></div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Task Duration</label>
                                <input 
                                  type="range" 
                                  min="5" 
                                  max={modalGap.duration} 
                                  step="5" 
                                  value={fillDuration} 
                                  onChange={e => setFillDuration(Number(e.target.value))} 
                                  className="w-full accent-indigo-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="text-right text-indigo-600 dark:text-indigo-400 font-bold mt-1">{fillDuration} min</div>
                            </div>

                            <div className="relative">
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Task Title</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={customTaskInput} 
                                        onChange={e => setCustomTaskInput(e.target.value)} 
                                        placeholder="What do you want to do?" 
                                        className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                    />
                                    <button onClick={handleGenerateTask} disabled={isAiLoading} className="p-3 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-600 dark:text-indigo-300 rounded-xl transition-colors disabled:opacity-50">
                                        {isAiLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5"/>}
                                    </button>
                                </div>
                            </div>

                            {/* Presets Grid */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Quick Pick</label>
                                <div className="flex flex-wrap gap-2">
                                    {fixedPresets.map(preset => (
                                        <button 
                                          key={preset.id} 
                                          onClick={() => handleAddScheduledBlock(preset.title, Math.min(preset.defaultDuration || 30, modalGap.duration), preset.id)}
                                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
                                        >
                                            {preset.title}
                                        </button>
                                    ))}
                                    {flexibleTasks.map(ft => (
                                        <button 
                                          key={ft.id} 
                                          onClick={() => handleAddScheduledBlock(ft.title, fillDuration, ft.id)}
                                          className={`px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border rounded-lg text-xs font-medium transition-colors ${getPriorityColor(ft.priority)}`}
                                        >
                                            {ft.title}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button 
                          onClick={() => handleAddScheduledBlock(customTaskInput || "New Task", fillDuration)}
                          disabled={!customTaskInput}
                          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                        >
                            Schedule Task
                        </button>
                    </div>
                </div>
            )}

            {/* Other Modals */}
            {activeTimerBlock && (
                <PomodoroModal 
                  task={activeTimerBlock} 
                  durationMinutes={(timeToMin(activeTimerBlock.endTime) - timeToMin(activeTimerBlock.startTime))}
                  onClose={() => setActiveTimerBlock(null)}
                  onComplete={() => handleTimerComplete(activeTimerBlock.id)}
                />
            )}

            {activeIdeaBlock && !isAppLibraryOpen && !appGeneratorData && (
                <ActionModal 
                    task={activeIdeaBlock}
                    user={userProfile}
                    durationMinutes={(timeToMin(activeIdeaBlock.endTime) - timeToMin(activeIdeaBlock.startTime))}
                    onClose={() => setActiveIdeaBlock(null)}
                    onOpenAppGenerator={handleOpenAppGenerator}
                />
            )}

            {appGeneratorData && activeIdeaBlock && (
                <AppGeneratorModal 
                    user={userProfile}
                    taskTitle={activeIdeaBlock.title}
                    methodTitle={appGeneratorData.methodTitle}
                    methodDescription={appGeneratorData.methodDesc}
                    mode={appGeneratorData.mode}
                    existingCode={appGeneratorData.initialCode || (appGeneratorData.mode === 'PAGE' ? (activeIdeaBlock.generatedWebPageKey ? generatedApps[activeIdeaBlock.generatedWebPageKey] : undefined) : (activeIdeaBlock.generatedAppKey ? generatedApps[activeIdeaBlock.generatedAppKey] : undefined))}
                    onClose={() => { setAppGeneratorData(null); setActiveIdeaBlock(null); }}
                    onCodeUpdate={handleSaveGeneratedApp}
                    onBookmark={handleBookmarkApp}
                />
            )}

            {isAppLibraryOpen && (
                <AppLibraryModal 
                    apps={bookmarkedApps}
                    currentApp={(() => {
                        if (activeIdeaBlock && activeIdeaBlock.generatedAppKey && generatedApps[activeIdeaBlock.generatedAppKey]) {
                            const key = activeIdeaBlock.generatedAppKey;
                            let title = 'Linked App';
                            const prefix = activeIdeaBlock.id + '_';
                            if (key.startsWith(prefix)) {
                                title = key.substring(prefix.length).replace(/_/g, ' ').replace('APP', '').trim();
                            }
                            return { title, code: generatedApps[key] };
                        }
                        return undefined;
                    })()}
                    currentWebPage={(() => {
                        if (activeIdeaBlock && activeIdeaBlock.generatedWebPageKey && generatedApps[activeIdeaBlock.generatedWebPageKey]) {
                            const key = activeIdeaBlock.generatedWebPageKey;
                            let title = 'Linked Guide';
                            const prefix = activeIdeaBlock.id + '_';
                            if (key.startsWith(prefix)) {
                                title = key.substring(prefix.length).replace(/_/g, ' ').replace('PAGE', '').trim();
                            }
                            return { title, code: generatedApps[key] };
                        }
                        return undefined;
                    })()}
                    onClose={() => setIsAppLibraryOpen(false)}
                    onSelect={handleSelectAppFromLibrary}
                    onDelete={handleDeleteBookmarkedApp}
                />
            )}

          </main>

           {/* Bottom Nav */}
           <div className="fixed bottom-0 inset-x-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 p-2 z-50 md:hidden transition-colors">
               <div className="flex justify-around items-center">
                   {[
                       { tab: Tab.PROFILE, icon: User, label: 'Me' },
                       { tab: Tab.STRUCTURE, icon: Layers, label: 'Plan' },
                       { tab: Tab.DAILY, icon: Calendar, label: 'Today' },
                       { tab: Tab.GOALS, icon: Target, label: 'Goals' },
                       { tab: Tab.INSIGHTS, icon: Activity, label: 'Stats' },
                       { tab: Tab.ESSAY, icon: BookOpen, label: 'Story' },
                   ].map(({ tab, icon: Icon, label }) => (
                       <button 
                         key={tab} 
                         onClick={() => setActiveTab(tab)}
                         className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${activeTab === tab ? 'text-pink-600 dark:text-pink-400 bg-slate-100 dark:bg-white/5' : 'text-slate-500'}`}
                       >
                           <Icon className="w-5 h-5" />
                           <span className="text-[9px] font-bold uppercase tracking-wide">{label}</span>
                       </button>
                   ))}
               </div>
           </div>

           {/* Desktop Sidebar / Nav */}
           <div className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-20 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/10 z-50 items-center py-8 gap-8 transition-colors">
                <div className="text-2xl">💎</div>
                <div className="flex flex-col gap-6 w-full px-2">
                   {[
                       { tab: Tab.PROFILE, icon: User, label: 'Me' },
                       { tab: Tab.STRUCTURE, icon: Layers, label: 'Plan' },
                       { tab: Tab.DAILY, icon: Calendar, label: 'Today' },
                       { tab: Tab.GOALS, icon: Target, label: 'Goals' },
                       { tab: Tab.INSIGHTS, icon: Activity, label: 'Stats' },
                       { tab: Tab.ESSAY, icon: BookOpen, label: 'Story' },
                       { tab: Tab.SETTINGS, icon: Settings, label: 'Config' },
                   ].map(({ tab, icon: Icon, label }) => (
                       <button 
                         key={tab} 
                         onClick={() => setActiveTab(tab)}
                         className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all group relative ${activeTab === tab ? 'text-pink-600 dark:text-pink-400 bg-slate-100 dark:bg-white/5 shadow-[0_0_15px_rgba(236,72,153,0.1)]' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                       >
                           <Icon className="w-6 h-6" />
                           <div className="absolute left-full ml-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap border border-slate-200 dark:border-white/10 z-50 shadow-md">
                               {label}
                           </div>
                       </button>
                   ))}
                </div>
           </div>
           
           {/* Adjustment for Desktop Left Nav */}
           <style>{`
               @media (min-width: 768px) {
                   main { margin-left: 5rem; max-width: calc(100% - 5rem) !important; }
                   header { margin-left: 5rem; }
               }
           `}</style>
        </div>
      </div>
    </div>
  );
};

export default App;
