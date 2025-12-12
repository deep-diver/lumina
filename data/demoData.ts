import { UserProfile, FixedEvent, FlexibleTask, TaskType, ScheduledBlock, Goal, MindAnalysis, Priority, FixedTaskPreset, StatsReflection, EssayData, BookmarkedApp } from '../types';

export type DemoScenarioKey = 'RESEARCHER' | 'SWITCHER' | 'BAKER' | 'NOMAD' | 'COACH' | 'DEVELOPER';

export interface DemoDataset {
  profile: UserProfile;
  goals: Goal[];
  fixedEvents: FixedEvent[];
  schedule: ScheduledBlock[];
  stats: StatsReflection;
  mind: MindAnalysis;
  essay: EssayData;
  generatedApps: Record<string, string>;
  bookmarkedApps: BookmarkedApp[];
}

const APP_ATTENTION_VIS = `<!DOCTYPE html>
<html><body class="bg-slate-900 flex flex-col items-center justify-center h-screen overflow-hidden"><script src="https://cdn.tailwindcss.com"></script>
<div class="relative w-64 h-64"><div class="absolute inset-0 border-2 border-indigo-500/30 rounded-full animate-[spin_10s_linear_infinite]"></div><div class="absolute inset-4 border-2 border-purple-500/30 rounded-full animate-[spin_7s_linear_infinite_reverse]"></div><div class="absolute inset-0 flex items-center justify-center"><div class="w-2 h-2 bg-white rounded-full shadow-[0_0_20px_white]"></div></div>
<div class="absolute top-0 left-1/2 w-full h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent rotate-45 origin-left opacity-50"></div>
<div class="absolute bottom-0 right-1/2 w-full h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent -rotate-45 origin-right opacity-50"></div></div>
<p class="mt-8 text-indigo-300 font-mono text-xs">Self-Attention Matrix: <span class="text-white animate-pulse">Converging...</span></p>
</body></html>`;

const APP_FLASHCARDS = `<!DOCTYPE html>
<html><body class="bg-slate-950 text-white font-sans flex flex-col items-center justify-center h-screen p-4"><script src="https://cdn.tailwindcss.com"></script>
<div id="card" onclick="flip()" class="w-full max-w-sm aspect-[4/3] bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl shadow-2xl flex items-center justify-center cursor-pointer transition-transform duration-500 hover:scale-105 border border-white/10 relative"><div class="absolute top-4 right-4 text-xs opacity-50">Click to Flip</div>
<h1 id="txt" class="text-2xl font-bold text-center px-4">What is Overfitting?</h1></div>
<div class="flex gap-4 mt-8"><button class="px-6 py-3 rounded-xl bg-slate-800 text-red-400 font-bold hover:bg-slate-700">Hard</button><button class="px-6 py-3 rounded-xl bg-slate-800 text-emerald-400 font-bold hover:bg-slate-700">Easy</button></div>
<script>let isFront=true; const c=document.getElementById('card'); const t=document.getElementById('txt');
function flip(){ isFront=!isFront; c.style.transform = "rotateY(180deg)"; setTimeout(()=>{ c.style.transform = "rotateY(0deg)"; t.innerText = isFront ? "What is Overfitting?" : "Model learns noise instead of signal."; }, 250); }
</script></body></html>`;

const APP_RECIPE_COST = `<!DOCTYPE html>
<html><body class="bg-[#1c1917] text-[#e7e5e4] font-serif flex flex-col items-center justify-center h-screen"><script src="https://cdn.tailwindcss.com"></script>
<div class="bg-[#292524] p-8 rounded-2xl border border-[#44403c] w-full max-w-xs shadow-xl"><h2 class="text-xl font-bold mb-4 text-orange-200">Sourdough Cost</h2>
<div class="space-y-3 text-sm"><div class="flex justify-between"><span>Flour (500g)</span><span>$0.80</span></div><div class="flex justify-between"><span>Water (350g)</span><span>$0.00</span></div><div class="flex justify-between"><span>Salt (10g)</span><span>$0.05</span></div><div class="border-t border-[#44403c] my-2"></div><div class="flex justify-between text-lg font-bold text-orange-400"><span>Total</span><span>$0.85</span></div></div>
<button class="mt-6 w-full py-2 bg-orange-700 hover:bg-orange-600 rounded-lg text-sm font-bold transition">Save Batch</button></div></body></html>`;

const APP_SHOT_LIST = `<!DOCTYPE html>
<html><body class="bg-slate-900 text-white font-sans flex flex-col items-center justify-center h-screen p-6"><script src="https://cdn.tailwindcss.com"></script>
<div class="w-full max-w-sm bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700">
<h2 class="text-xl font-bold mb-4 flex items-center gap-2 text-teal-400">📹 Vlog Shot List</h2>
<div class="space-y-3">
<label class="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl cursor-pointer hover:bg-slate-900 transition"><input type="checkbox" class="w-5 h-5 accent-teal-500 rounded"><span class="text-slate-300">Intro (Talking Head)</span></label>
<label class="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl cursor-pointer hover:bg-slate-900 transition"><input type="checkbox" class="w-5 h-5 accent-teal-500 rounded"><span class="text-slate-300">B-Roll: Market Food</span></label>
<label class="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl cursor-pointer hover:bg-slate-900 transition"><input type="checkbox" class="w-5 h-5 accent-teal-500 rounded"><span class="text-slate-300">Time-lapse: Sunset</span></label>
<label class="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl cursor-pointer hover:bg-slate-900 transition"><input type="checkbox" class="w-5 h-5 accent-teal-500 rounded"><span class="text-slate-300">Outro & CTA</span></label>
</div></div></body></html>`;

const APP_MACRO_CALC = `<!DOCTYPE html>
<html><body class="bg-slate-950 text-white font-mono flex flex-col items-center justify-center h-screen"><script src="https://cdn.tailwindcss.com"></script>
<div class="bg-slate-900 p-8 rounded-3xl border border-slate-800 w-full max-w-xs shadow-2xl relative overflow-hidden">
<div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-violet-500"></div>
<h2 class="text-2xl font-bold mb-6 text-center">Macro Check</h2>
<div class="space-y-4">
<div><label class="text-xs text-slate-500 uppercase">Protein (g)</label><input type="number" id="p" value="150" class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-right focus:border-violet-500 outline-none" oninput="calc()"></div>
<div><label class="text-xs text-slate-500 uppercase">Carbs (g)</label><input type="number" id="c" value="200" class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-right focus:border-pink-500 outline-none" oninput="calc()"></div>
<div><label class="text-xs text-slate-500 uppercase">Fats (g)</label><input type="number" id="f" value="60" class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-right focus:border-teal-500 outline-none" oninput="calc()"></div>
<div class="pt-4 border-t border-slate-800 flex justify-between items-center"><span class="text-slate-400">Total kcal</span><span id="total" class="text-2xl font-bold text-white">1940</span></div>
</div></div>
<script>function calc(){const p=Number(document.getElementById('p').value);const c=Number(document.getElementById('c').value);const f=Number(document.getElementById('f').value);document.getElementById('total').innerText=(p*4+c*4+f*9);}</script></body></html>`;

const APP_SPRITE_GRID = `<!DOCTYPE html>
<html><body class="bg-[#0f172a] flex flex-col items-center justify-center h-screen"><script src="https://cdn.tailwindcss.com"></script>
<div class="bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-700"><h3 class="text-center text-slate-400 text-xs font-bold uppercase mb-4">Pixel Grid Editor</h3>
<div id="grid" class="grid grid-cols-8 gap-1 w-64 h-64 bg-slate-900 p-1 rounded-lg"></div>
<button onclick="clearGrid()" class="mt-4 w-full py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-500">Reset Canvas</button></div>
<script>
const g=document.getElementById('grid');
for(let i=0;i<64;i++){const d=document.createElement('div');d.className="bg-slate-800 hover:bg-indigo-500/50 cursor-pointer rounded-sm transition-colors";d.onclick=function(){this.classList.toggle('bg-purple-500');this.classList.toggle('bg-slate-800');};g.appendChild(d);}
function clearGrid(){Array.from(g.children).forEach(c=>{c.className="bg-slate-800 hover:bg-indigo-500/50 cursor-pointer rounded-sm transition-colors";})}
</script></body></html>`;

export const DEMO_SCENARIOS: Record<DemoScenarioKey, DemoDataset> = {
  RESEARCHER: {
    profile: { name: 'Dr. Alara', age: 34, gender: 'Female', race: 'Mixed', bio: 'AI Researcher focused on LLM interpretability. Loves deep focus and tea.' },
    goals: [
        { id: 'g1', title: 'Publish in NeurIPS', description: 'Complete the interpretability paper.', achievements: [] },
        { id: 'g2', title: 'Mentor Juniors', description: 'Help 3 students graduate.', achievements: [] }
    ],
    fixedEvents: [
        { id: 'f1', title: 'Deep Work 🧠', startTime: '09:00', endTime: '12:00', type: TaskType.FIXED, doNotDisturb: true },
        { id: 'f2', title: 'Lab Meeting 🤝', startTime: '14:00', endTime: '15:00', type: TaskType.FIXED }
    ],
    schedule: [
        { id: 't1', title: 'Review Paper Drafts', startTime: '12:30', endTime: '13:30', type: TaskType.FLEXIBLE, isCompleted: true, bannerUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&auto=format&fit=crop' },
        { id: 't2', title: 'Visualize Attention Heads', startTime: '15:30', endTime: '17:00', type: TaskType.FLEXIBLE, isCompleted: false, generatedAppKey: 't2_Attention_Vis' }
    ],
    stats: {
        strengths: ['Focus', 'Writing'],
        weaknesses: ['Exercise', 'Sleep'],
        suggestions: ['Walk more', 'Sleep earlier'],
        summary: "You had a productive day with deep work blocks. Great job on the paper review."
    },
    mind: {
        date: new Date().toISOString().split('T')[0],
        overallMood: 'Focused',
        categories: {
            stress: { score: 40, label: 'Moderate' },
            energy: { score: 70, label: 'High' },
            focus: { score: 90, label: 'Deep' },
            satisfaction: { score: 80, label: 'Good' }
        },
        advice: 'Take a break to reset your eyes.'
    },
    essay: {
        title: "The Architecture of Thought",
        date: new Date().toISOString(),
        sections: [
            { type: 'text', content: "Today was buried in the depths of neural networks. The morning block was pure bliss—just me and the matrices." },
            { type: 'app_link', relatedTaskId: 't2', appTitle: 'Attention Vis', content: 'Checked the visualization tool' },
            { type: 'text', content: "Found a weird anomaly in layer 4. It looked like the model was hallucinating patterns where none existed." }
        ]
    },
    generatedApps: {
        't2_Attention_Vis': APP_ATTENTION_VIS
    },
    bookmarkedApps: []
  },
  SWITCHER: {
    profile: { name: 'Marcus', age: 28, gender: 'Male', race: 'Black', bio: 'Marketing Manager pivoting to Software Engineering. Learning Python at night.' },
    goals: [
        { id: 'g1', title: 'Become a Dev', description: 'Land a junior role in 6 months.', achievements: [] }
    ],
    fixedEvents: [
        { id: 'f1', title: 'Day Job 💼', startTime: '09:00', endTime: '17:00', type: TaskType.FIXED },
        { id: 'f2', title: 'Dinner 🥘', startTime: '18:00', endTime: '19:00', type: TaskType.FIXED }
    ],
    schedule: [
        { id: 't1', title: 'Python Flashcards', startTime: '19:30', endTime: '20:30', type: TaskType.FLEXIBLE, isCompleted: false, generatedAppKey: 't1_Flashcards' },
        { id: 't2', title: 'Build Portfolio', startTime: '21:00', endTime: '22:30', type: TaskType.FLEXIBLE, isCompleted: false }
    ],
    stats: {
        strengths: ['Persistence'],
        weaknesses: ['Burnout risk'],
        suggestions: ['Code earlier', 'Network'],
        summary: "Balancing a job and study is tough, but you are consistent."
    },
    mind: {
        date: new Date().toISOString().split('T')[0],
        overallMood: 'Determined',
        categories: {
            stress: { score: 60, label: 'Elevated' },
            energy: { score: 50, label: 'Medium' },
            focus: { score: 70, label: 'Good' },
            satisfaction: { score: 60, label: 'Okay' }
        },
        advice: 'Don\'t forget to rest on weekends.'
    },
    essay: {
        title: "Two Lives",
        date: new Date().toISOString(),
        sections: [
            { type: 'text', content: "The shift from marketing spreadsheets to VS Code is always jarring. But I love the logic of it." },
            { type: 'highlight', content: "Spaced Repetition", tooltip: "Using flashcards to memorize syntax" }
        ]
    },
    generatedApps: {
        't1_Flashcards': APP_FLASHCARDS
    },
    bookmarkedApps: []
  },
  BAKER: {
    profile: { name: 'Elena', age: 40, gender: 'Female', race: 'Hispanic', bio: 'Owner of "Crumb & Co". Passionate about sustainable baking.' },
    goals: [
        { id: 'g1', title: 'Zero Waste Shop', description: 'Reduce plastic by 100%.', achievements: [] }
    ],
    fixedEvents: [
        { id: 'f1', title: 'Baking Batch 1 🥖', startTime: '04:00', endTime: '08:00', type: TaskType.FIXED },
        { id: 'f2', title: 'Shop Open 🏪', startTime: '08:00', endTime: '15:00', type: TaskType.FIXED }
    ],
    schedule: [
        { id: 't1', title: 'Inventory Check', startTime: '15:30', endTime: '16:00', type: TaskType.FLEXIBLE, isCompleted: true },
        { id: 't2', title: 'Calculate Sourdough Cost', startTime: '16:30', endTime: '17:00', type: TaskType.FLEXIBLE, isCompleted: true, generatedAppKey: 't2_Cost_Calc' }
    ],
    stats: {
        strengths: ['Early bird'],
        weaknesses: ['Afternoon crash'],
        suggestions: ['Power nap', 'Hydrate'],
        summary: "The morning rush was intense, but you managed the inventory perfectly."
    },
    mind: {
        date: new Date().toISOString().split('T')[0],
        overallMood: 'Tired but Happy',
        categories: {
            stress: { score: 30, label: 'Low' },
            energy: { score: 40, label: 'Low' },
            focus: { score: 80, label: 'Sharp' },
            satisfaction: { score: 95, label: 'Fulfilled' }
        },
        advice: 'Go to bed early tonight.'
    },
    essay: {
        title: "Flour and Numbers",
        date: new Date().toISOString(),
        sections: [
            { type: 'text', content: "The smell of sourdough at 4 AM is my meditation. Today we sold out by noon." },
            { type: 'app_link', relatedTaskId: 't2', appTitle: 'Cost Calc', content: 'Ran the numbers' }
        ]
    },
    generatedApps: {
        't2_Cost_Calc': APP_RECIPE_COST
    },
    bookmarkedApps: []
  },
  NOMAD: {
    profile: { name: 'Kenji', age: 24, gender: 'Male', race: 'Asian', bio: 'Traveling the world, vlogging daily. Currently in Bali.' },
    goals: [
        { id: 'g1', title: '100k Subs', description: 'Grow YouTube channel.', achievements: [] }
    ],
    fixedEvents: [
        { id: 'f1', title: 'Sunrise 🌅', startTime: '06:00', endTime: '07:00', type: TaskType.FIXED },
        { id: 'f2', title: 'Edit Video 🎬', startTime: '10:00', endTime: '14:00', type: TaskType.FIXED }
    ],
    schedule: [
        { id: 't1', title: 'Plan Vlog Shots', startTime: '08:00', endTime: '09:00', type: TaskType.FLEXIBLE, isCompleted: false, generatedAppKey: 't1_Shot_List' },
        { id: 't2', title: 'Explore Waterfalls', startTime: '15:00', endTime: '18:00', type: TaskType.FLEXIBLE, isCompleted: false, bannerUrl: 'https://images.unsplash.com/photo-1518098268026-4e187743369b?w=800&auto=format&fit=crop' }
    ],
    stats: {
        strengths: ['Creativity'],
        weaknesses: ['Routine'],
        suggestions: ['Stick to schedule', 'Backup footage'],
        summary: "Great footage today. Editing block was efficient."
    },
    mind: {
        date: new Date().toISOString().split('T')[0],
        overallMood: 'Inspired',
        categories: {
            stress: { score: 20, label: 'Chill' },
            energy: { score: 90, label: 'High' },
            focus: { score: 60, label: 'Flowing' },
            satisfaction: { score: 90, label: 'High' }
        },
        advice: 'Enjoy the moment, don\'t just film it.'
    },
    essay: {
        title: "Chasing Waterfalls",
        date: new Date().toISOString(),
        sections: [
            { type: 'text', content: "Bali humidity hits different. The waterfall hike was treacherous but worth it for the drone shot." },
            { type: 'app_link', relatedTaskId: 't1', appTitle: 'Shot List', content: 'Checked the plan' }
        ]
    },
    generatedApps: {
        't1_Shot_List': APP_SHOT_LIST
    },
    bookmarkedApps: []
  },
  COACH: {
    profile: { name: 'Sarah', age: 31, gender: 'Female', race: 'White', bio: 'Triathlon coach and athlete. Loves data and discipline.' },
    goals: [
        { id: 'g1', title: 'Ironman Qual', description: 'Qualify for Kona.', achievements: [] }
    ],
    fixedEvents: [
        { id: 'f1', title: 'Swim 🏊‍♀️', startTime: '05:30', endTime: '07:00', type: TaskType.FIXED },
        { id: 'f2', title: 'Client Calls 📞', startTime: '10:00', endTime: '12:00', type: TaskType.FIXED }
    ],
    schedule: [
        { id: 't1', title: 'Meal Prep', startTime: '12:30', endTime: '13:30', type: TaskType.FLEXIBLE, isCompleted: true, generatedAppKey: 't1_Macros' },
        { id: 't2', title: 'Bike Ride 🚴‍♀️', startTime: '15:00', endTime: '17:00', type: TaskType.FLEXIBLE, isCompleted: true }
    ],
    stats: {
        strengths: ['Discipline'],
        weaknesses: ['Flexibility'],
        suggestions: ['Stretch more', 'Rest day'],
        summary: "Training volume is high. Nutrition is on point."
    },
    mind: {
        date: new Date().toISOString().split('T')[0],
        overallMood: 'Strong',
        categories: {
            stress: { score: 50, label: 'Physical' },
            energy: { score: 80, label: 'Endurance' },
            focus: { score: 85, label: 'Locked In' },
            satisfaction: { score: 70, label: 'Progressing' }
        },
        advice: 'Remember to foam roll.'
    },
    essay: {
        title: "Fueling the Machine",
        date: new Date().toISOString(),
        sections: [
            { type: 'text', content: "The pool was cold this morning. 3k set done. Then straight to fueling." },
            { type: 'app_link', relatedTaskId: 't1', appTitle: 'Macro Calc', content: 'Tracked macros' }
        ]
    },
    generatedApps: {
        't1_Macros': APP_MACRO_CALC
    },
    bookmarkedApps: []
  },
  DEVELOPER: {
    profile: { name: 'Alex', age: 22, gender: 'Non-binary', race: 'White', bio: 'Indie game developer working on a pixel art RPG.' },
    goals: [
        { id: 'g1', title: 'Release Game', description: 'Steam launch in Q4.', achievements: [] }
    ],
    fixedEvents: [
        { id: 'f1', title: 'Sleep in 🛌', startTime: '02:00', endTime: '10:00', type: TaskType.FIXED, doNotDisturb: true },
        { id: 'f2', title: 'Code Stream 🔴', startTime: '14:00', endTime: '18:00', type: TaskType.FIXED }
    ],
    schedule: [
        { id: 't1', title: 'Design Character Sprite', startTime: '20:00', endTime: '22:00', type: TaskType.FLEXIBLE, isCompleted: false, generatedAppKey: 't1_Sprite' }
    ],
    stats: {
        strengths: ['Creativity'],
        weaknesses: ['Schedule'],
        suggestions: ['Fix sleep', 'Walk outside'],
        summary: "Night owl schedule is working for code, but health needs attention."
    },
    mind: {
        date: new Date().toISOString().split('T')[0],
        overallMood: 'In the Zone',
        categories: {
            stress: { score: 30, label: 'Low' },
            energy: { score: 60, label: 'Steady' },
            focus: { score: 95, label: 'Laser' },
            satisfaction: { score: 80, label: 'Creating' }
        },
        advice: 'See some sunlight tomorrow.'
    },
    essay: {
        title: "Pixels and Coffee",
        date: new Date().toISOString(),
        sections: [
            { type: 'text', content: "Got stuck on a collision bug for 3 hours. Then switched to art to relax." },
            { type: 'app_link', relatedTaskId: 't1', appTitle: 'Pixel Grid', content: 'Designed the hero' }
        ]
    },
    generatedApps: {
        't1_Sprite': APP_SPRITE_GRID
    },
    bookmarkedApps: []
  }
};