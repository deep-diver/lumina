import React, { useState, useEffect, useMemo } from 'react';
import { X, Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';
import { ScheduledBlock } from '../types';

interface PomodoroModalProps {
  task: ScheduledBlock;
  durationMinutes: number; // Total scheduled duration
  onClose: () => void;
  onComplete: () => void;
}

export const PomodoroModal: React.FC<PomodoroModalProps> = ({ task, durationMinutes, onClose, onComplete }) => {
  // Config State
  const [focusTime, setFocusTime] = useState(Math.min(25, durationMinutes));
  const [breakTime, setBreakTime] = useState(Math.min(5, Math.max(0, durationMinutes - 25)));
  
  // Timer State
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const totalSeconds = durationMinutes * 60;

  useEffect(() => {
    let interval: any;
    if (isRunning && elapsedSeconds < totalSeconds) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => {
          const next = prev + 1;
          if (next >= totalSeconds) {
            setIsRunning(false);
            onComplete(); // Auto check when done
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, elapsedSeconds, totalSeconds, onComplete]);

  // Helper to generate segments for the circle
  const segments = useMemo(() => {
    const segs = [];
    const cycleTime = focusTime + breakTime;
    if (cycleTime <= 0) return [{ type: 'focus', start: 0, length: 1 }]; // Fallback

    let currentMin = 0;
    while (currentMin < durationMinutes) {
      // Focus Segment
      const remainingForFocus = durationMinutes - currentMin;
      const actualFocus = Math.min(focusTime, remainingForFocus);
      if (actualFocus > 0) {
        segs.push({ type: 'focus', start: currentMin / durationMinutes, length: actualFocus / durationMinutes });
        currentMin += actualFocus;
      }

      // Break Segment
      const remainingForBreak = durationMinutes - currentMin;
      const actualBreak = Math.min(breakTime, remainingForBreak);
      if (actualBreak > 0) {
        segs.push({ type: 'break', start: currentMin / durationMinutes, length: actualBreak / durationMinutes });
        currentMin += actualBreak;
      }
    }
    return segs;
  }, [durationMinutes, focusTime, breakTime]);

  // Determine current status text
  const currentStatus = useMemo(() => {
    if (elapsedSeconds >= totalSeconds) return "Finished!";
    
    const currentMin = elapsedSeconds / 60;
    const cycleTime = focusTime + breakTime;
    const timeInCycle = currentMin % cycleTime;
    
    return timeInCycle < focusTime ? "Focus Time" : "Break Time";
  }, [elapsedSeconds, totalSeconds, focusTime, breakTime]);

  // SVG Config
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const center = 140;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 w-full max-w-md overflow-hidden shadow-2xl flex flex-col items-center relative transition-colors">
        
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 text-center w-full border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{task.title}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Total Duration: {durationMinutes} min</p>
        </div>

        {/* CONTROLS (Only editable when not running) */}
        <div className={`flex gap-4 p-4 w-full justify-center transition-opacity ${isRunning || elapsedSeconds > 0 ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
           <div className="flex flex-col items-center">
             <label className="text-xs font-bold text-red-500 dark:text-red-400 uppercase mb-1">Focus (min)</label>
             <input 
               type="number" 
               min="1" 
               max={durationMinutes}
               value={focusTime} 
               onChange={(e) => setFocusTime(Number(e.target.value))}
               className="w-16 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-center font-mono focus:border-red-500 outline-none text-slate-900 dark:text-white"
             />
           </div>
           <div className="flex flex-col items-center">
             <label className="text-xs font-bold text-emerald-500 dark:text-emerald-400 uppercase mb-1">Break (min)</label>
             <input 
               type="number" 
               min="0" 
               max={durationMinutes}
               value={breakTime} 
               onChange={(e) => setBreakTime(Number(e.target.value))}
               className="w-16 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-center font-mono focus:border-emerald-500 outline-none text-slate-900 dark:text-white"
             />
           </div>
        </div>

        {/* CIRCULAR TIMER */}
        <div className="relative w-[280px] h-[280px] my-4">
          <svg width="280" height="280" className="-rotate-90">
            {/* 1. Track Background */}
            <circle cx={center} cy={center} r={radius} stroke="currentColor" strokeWidth="20" fill="none" className="text-slate-200 dark:text-slate-800" />
            
            {/* 2. Segments (Red/Green) */}
            {segments.map((seg, idx) => {
               const dashLen = seg.length * circumference;
               const dashOffset = -(seg.start * circumference);
               return (
                 <circle 
                   key={idx}
                   cx={center} 
                   cy={center} 
                   r={radius} 
                   stroke={seg.type === 'focus' ? '#ef4444' : '#10b981'} 
                   strokeWidth="20" 
                   fill="none"
                   strokeDasharray={`${dashLen} ${circumference}`}
                   strokeDashoffset={dashOffset}
                   className="transition-all duration-500"
                 />
               );
            })}

            {/* 3. Progress Overlay (Shading) */}
            <circle 
              cx={center} 
              cy={center} 
              r={radius} 
              stroke="currentColor" 
              strokeWidth="20" 
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (elapsedSeconds / totalSeconds) * circumference}
              strokeLinecap="round"
              className="text-white/30 dark:text-black/30 transition-all duration-1000 linear"
            />
          </svg>
          
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-sm font-bold uppercase tracking-widest mb-1 ${currentStatus === 'Focus Time' ? 'text-red-500 dark:text-red-400' : 'text-emerald-500 dark:text-emerald-400'}`}>
              {currentStatus}
            </span>
            <span className="text-4xl font-mono font-bold text-slate-900 dark:text-white tracking-tighter">
              {formatTime(totalSeconds - elapsedSeconds)}
            </span>
            {elapsedSeconds >= totalSeconds && (
               <div className="mt-2 flex items-center gap-1 text-emerald-500 dark:text-emerald-400">
                 <CheckCircle2 className="w-5 h-5" />
                 <span className="text-sm font-bold">Done</span>
               </div>
            )}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="w-full p-6 pt-0 flex gap-3">
          {elapsedSeconds < totalSeconds ? (
            <>
              <button 
                onClick={() => setIsRunning(!isRunning)}
                className={`flex-1 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                  isRunning 
                    ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/25'
                }`}
              >
                {isRunning ? <><Pause className="w-5 h-5"/> Pause</> : <><Play className="w-5 h-5"/> Start</>}
              </button>
              <button 
                onClick={() => { setIsRunning(false); setElapsedSeconds(0); }}
                className="p-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button 
               onClick={onComplete}
               className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-500 shadow-lg shadow-emerald-500/25"
            >
              Close & Complete
            </button>
          )}
        </div>

      </div>
    </div>
  );
};