import React, { useMemo } from 'react';
import { FixedEvent, ScheduledBlock, TaskType } from '../types';
import { Plus, Clock, CheckCircle2, Circle, Timer, Lightbulb, Briefcase, AppWindow, Trash2, BellOff, Globe } from 'lucide-react';

interface TimelineProps {
  fixedEvents: FixedEvent[];
  flexibleBlocks: ScheduledBlock[]; // All scheduled blocks (both free and nested)
  onAddBlock: (startTime: string, endTime: string, parentId?: string) => void;
  onToggleComplete: (blockId: string) => void;
  onOpenTimer: (block: ScheduledBlock) => void;
  onOpenIdeas: (block: ScheduledBlock) => void;
  onOpenAppLibrary: (block: ScheduledBlock) => void;
  
  // New props for selection
  selectedBlockId: string | null;
  onSelectBlock: (blockId: string) => void;

  // New props for Fixed Event Completion
  completedFixedEventIds?: string[];
  onToggleFixedComplete?: (id: string) => void;

  // New prop for deleting a block
  onDeleteBlock: (blockId: string) => void;
}

// Helper: Convert "HH:mm" to minutes from midnight
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

export const Timeline: React.FC<TimelineProps> = ({ 
  fixedEvents, 
  flexibleBlocks, 
  onAddBlock, 
  onToggleComplete, 
  onOpenTimer, 
  onOpenIdeas, 
  onOpenAppLibrary,
  selectedBlockId,
  onSelectBlock,
  completedFixedEventIds = [],
  onToggleFixedComplete,
  onDeleteBlock
}) => {
  
  const timelineItems = useMemo(() => {
    // 1. Prepare Fixed Events
    const normalizedFixed: Array<{data: FixedEvent, start: number, end: number}> = [];
    fixedEvents.forEach(e => {
      const s = timeToMin(e.startTime);
      const end = timeToMin(e.endTime);
      if (s > end) {
        normalizedFixed.push({ data: e, start: s, end: 1440 });
        normalizedFixed.push({ data: e, start: 0, end: end });
      } else {
        normalizedFixed.push({ data: e, start: s, end: end });
      }
    });
    normalizedFixed.sort((a, b) => a.start - b.start);

    // 2. Prepare Flexible Blocks
    const normalizedBlocks: Array<{data: ScheduledBlock, start: number, end: number}> = [];
    flexibleBlocks.forEach(b => {
      const s = timeToMin(b.startTime);
      const end = timeToMin(b.endTime);
      if (s > end) {
        normalizedBlocks.push({ data: b, start: s, end: 1440 });
        normalizedBlocks.push({ data: b, start: 0, end: end });
      } else {
        normalizedBlocks.push({ data: b, start: s, end: end });
      }
    });

    // 3. Build Top-Level Layout (Free Time vs Fixed Blocks)
    const items: Array<{ type: 'FIXED_CONTAINER' | 'FREE_TASK' | 'GAP'; data: any; start: number; end: number; nested?: any[] }> = [];
    let pointer = 0;

    // Helper to find blocks inside a range
    const findBlocksInRange = (start: number, end: number) => {
      return normalizedBlocks.filter(b => b.start >= start && b.end <= end && b.end > b.start).sort((a,b) => a.start - b.start);
    };

    // Helper to find blocks NOT inside any fixed event (Free Tasks)
    // We'll handle this by iterating fixed events and filling gaps

    for (const fEvent of normalizedFixed) {
      // GAP before fixed event
      if (fEvent.start > pointer) {
        // Find free tasks in this gap
        const freeTasks = findBlocksInRange(pointer, fEvent.start);
        let gapPointer = pointer;
        
        freeTasks.forEach(ft => {
          // Gap before task
          if (ft.start > gapPointer) {
            items.push({ type: 'GAP', data: null, start: gapPointer, end: ft.start });
          }
          // The Task
          items.push({ type: 'FREE_TASK', data: ft.data, start: ft.start, end: ft.end });
          gapPointer = ft.end;
        });

        // Gap after last task
        if (gapPointer < fEvent.start) {
          items.push({ type: 'GAP', data: null, start: gapPointer, end: fEvent.start });
        }
      }

      // FIXED EVENT CONTAINER
      // Find nested tasks
      const nestedTasks = findBlocksInRange(fEvent.start, fEvent.end);
      
      // Build nested timeline items (Subtasks + Inner Gaps)
      const nestedItems: any[] = [];
      let innerPointer = fEvent.start;

      nestedTasks.forEach(nt => {
         if (nt.start > innerPointer) {
            nestedItems.push({ type: 'INNER_GAP', start: innerPointer, end: nt.start });
         }
         nestedItems.push({ type: 'SUB_TASK', data: nt.data, start: nt.start, end: nt.end });
         innerPointer = nt.end;
      });
      
      if (innerPointer < fEvent.end) {
        nestedItems.push({ type: 'INNER_GAP', start: innerPointer, end: fEvent.end });
      }

      items.push({ 
        type: 'FIXED_CONTAINER', 
        data: fEvent.data, 
        start: fEvent.start, 
        end: fEvent.end,
        nested: nestedItems 
      });

      pointer = Math.max(pointer, fEvent.end);
    }

    // Final Gap after last fixed event
    if (pointer < 1440) {
       const freeTasks = findBlocksInRange(pointer, 1440);
       let gapPointer = pointer;
        
       freeTasks.forEach(ft => {
          if (ft.start > gapPointer) {
            items.push({ type: 'GAP', data: null, start: gapPointer, end: ft.start });
          }
          items.push({ type: 'FREE_TASK', data: ft.data, start: ft.start, end: ft.end });
          gapPointer = ft.end;
       });

       if (gapPointer < 1440) {
          items.push({ type: 'GAP', data: null, start: gapPointer, end: 1440 });
       }
    }

    return items;
  }, [fixedEvents, flexibleBlocks]);

  return (
    <div className="relative pl-8 border-l-2 border-slate-300 dark:border-slate-700 space-y-2 pb-12 transition-colors">
      <div className="absolute -left-[45px] top-0 text-[10px] text-slate-500 dark:text-slate-600 font-mono">00:00</div>

      {timelineItems.map((item, idx) => {
        const startStr = minToTime(item.start);
        const endStr = minToTime(item.end);
        const duration = item.end - item.start;

        if (item.type === 'GAP') {
          return (
             <div key={`gap-${idx}`} className="group relative flex items-center justify-center h-4 my-1 z-0 hover:z-10">
                {/* Timeline Dot (Visible on Hover) */}
                <div className="absolute -left-[39px] w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-800 border border-slate-400 dark:border-slate-600 opacity-0 group-hover:opacity-100 transition-all"></div>
                
                {/* Hover Area / Divider Line */}
                <div className="absolute inset-x-0 h-px bg-transparent group-hover:bg-indigo-500/30 transition-colors"></div>

                {/* Add Button */}
                <button 
                  onClick={() => onAddBlock(startStr, endStr)}
                  className="relative z-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 group-hover:border-indigo-500 text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 px-3 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-2 opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all shadow-md"
                >
                  <Plus className="w-3 h-3" />
                  <span>{duration}m</span>
                </button>
             </div>
          );
        }

        if (item.type === 'FREE_TASK') {
          return (
             <TaskBlock 
                key={`free-${idx}`} 
                data={item.data} 
                start={item.start} 
                end={item.end} 
                onToggleComplete={onToggleComplete}
                onOpenTimer={onOpenTimer}
                onOpenIdeas={onOpenIdeas}
                onOpenAppLibrary={onOpenAppLibrary}
                isFixed={false}
                isSelected={selectedBlockId === item.data.id}
                onSelect={onSelectBlock}
                onDelete={() => onDeleteBlock(item.data.id)}
              />
          );
        }

        if (item.type === 'FIXED_CONTAINER') {
          const isCompleted = completedFixedEventIds.includes(item.data.id);
          const isDND = item.data.doNotDisturb;
          
          return (
            <div key={`fixed-${idx}`} className="relative mb-2 mt-2">
               {/* Main Fixed Event Box */}
               <div className={`absolute -left-[39px] top-4 w-5 h-5 rounded-full border-4 border-slate-100 dark:border-slate-900 ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'} z-10 transition-colors`}></div>
               
               <div className={`bg-slate-100 dark:bg-slate-800 border ${isCompleted ? 'border-emerald-500/50' : 'border-slate-300 dark:border-slate-700'} rounded-xl p-5 shadow-sm transition-all`}>
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <span className={`text-xs font-bold uppercase tracking-wider ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>{startStr} - {endStr}</span>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {item.data.title}
                          {isDND && (
                              <div title="Do Not Disturb" className="bg-pink-500/20 p-1 rounded-full">
                                  <BellOff className="w-3 h-3 text-pink-500 dark:text-pink-400" />
                              </div>
                          )}
                        </h3>
                     </div>
                     <button 
                       onClick={() => onToggleFixedComplete && onToggleFixedComplete(item.data.id)}
                       className={`p-2 rounded-full transition-colors ${isCompleted ? 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700' : 'text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                       title="Mark Fixed Event as Complete"
                     >
                       {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                     </button>
                  </div>

                  {/* Nested Timeline */}
                  <div className="space-y-1 pl-4 border-l-2 border-slate-300/50 dark:border-slate-700/50">
                    {item.nested?.map((sub: any, sIdx: number) => {
                       const subStart = minToTime(sub.start);
                       const subEnd = minToTime(sub.end);
                       const subDur = sub.end - sub.start;

                       if (sub.type === 'INNER_GAP') {
                          if (isDND) return null; // Hide fill button if DND
                          return (
                            <div key={`inner-gap-${sIdx}`} className="group/inner relative h-4 flex items-center justify-center my-0.5">
                               <div className="absolute inset-x-0 h-px bg-transparent group-hover/inner:bg-slate-400 dark:group-hover/inner:bg-slate-600 transition-colors"></div>
                               <button 
                                 onClick={() => onAddBlock(subStart, subEnd, item.data.id)}
                                 className="relative z-10 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 group-hover/inner:border-indigo-500 text-slate-500 group-hover/inner:text-indigo-600 dark:group-hover/inner:text-white px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 opacity-0 group-hover/inner:opacity-100 transform scale-90 group-hover/inner:scale-100 transition-all shadow-sm"
                               >
                                 <Plus className="w-3 h-3" />
                                 <span>{subDur}m</span>
                               </button>
                            </div>
                          );
                       }
                       if (sub.type === 'SUB_TASK') {
                          const isSelected = selectedBlockId === sub.data.id;
                          return (
                             <div 
                               key={`sub-${sIdx}`} 
                               onClick={() => onSelectBlock(sub.data.id)}
                               className={`relative overflow-hidden bg-white/50 dark:bg-slate-900/80 border ${isSelected ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-300/50 dark:border-slate-600/50 hover:border-slate-500'} p-3 rounded-lg flex justify-between items-center cursor-pointer transition-all group my-1 shadow-sm`}
                             >
                                {/* Banner BG for SubTask */}
                                {sub.data.bannerUrl && (
                                   <>
                                     <div 
                                       className="absolute inset-0 bg-cover bg-center opacity-10 dark:opacity-20 transition-opacity group-hover:opacity-20 dark:group-hover:opacity-30"
                                       style={{ backgroundImage: `url(${sub.data.bannerUrl})` }}
                                     />
                                     <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent dark:from-slate-900/95 dark:via-slate-900/80 pointer-events-none" />
                                   </>
                                )}

                                <div className="relative z-10 flex-1">
                                   <div className="flex items-center gap-2">
                                     <span className="text-xs font-mono text-indigo-600 dark:text-indigo-300">{subStart}-{subEnd}</span>
                                     <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{sub.data.title}</span>
                                   </div>
                                </div>
                                <div className="relative z-10 flex items-center gap-1">
                                    {( (!sub.data.isCompleted) || sub.data.generatedAppKey || sub.data.generatedWebPageKey ) && (
                                        <button onClick={(e) => { e.stopPropagation(); onOpenAppLibrary(sub.data); }} className={`p-1.5 rounded transition-colors ${sub.data.generatedAppKey || sub.data.generatedWebPageKey ? 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-500' : 'text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400'}`} title="Load App/Page"><AppWindow className="w-4 h-4"/></button>
                                    )}
                                   {!sub.data.isCompleted && (
                                     <>
                                        <button onClick={(e) => { e.stopPropagation(); onOpenIdeas(sub.data); }} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-yellow-600 dark:hover:text-yellow-400 rounded transition-colors" title="Ideas"><Lightbulb className="w-4 h-4"/></button>
                                        <button onClick={(e) => { e.stopPropagation(); onOpenTimer(sub.data); }} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded transition-colors" title="Timer"><Timer className="w-4 h-4"/></button>
                                     </>
                                   )}
                                   <button onClick={(e) => { e.stopPropagation(); onDeleteBlock(sub.data.id); }} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors" title="Delete"><Trash2 className="w-4 h-4"/></button>
                                   <button onClick={(e) => { e.stopPropagation(); onToggleComplete(sub.data.id); }} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400">
                                      {sub.data.isCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-500"/> : <Circle className="w-4 h-4"/>}
                                   </button>
                                </div>
                             </div>
                          );
                       }
                       return null;
                    })}
                  </div>
               </div>
            </div>
          );
        }

        return null;
      })}

      <div className="absolute -left-[45px] bottom-0 text-[10px] text-slate-500 dark:text-slate-600 font-mono">24:00</div>
    </div>
  );
};

// Reusable Sub-Component for Tasks
const TaskBlock = ({ data, start, end, onToggleComplete, onOpenTimer, onOpenIdeas, onOpenAppLibrary, isFixed, isSelected, onSelect, onDelete }: any) => {
    const startStr = minToTime(start);
    const endStr = minToTime(end);
    const duration = end - start;
    const isDone = data.isCompleted;
    const hasBanner = !!data.bannerUrl;
    const hasApp = !!data.generatedAppKey;
    const hasPage = !!data.generatedWebPageKey;
    const hasAnyArtifact = hasApp || hasPage;

    return (
        <div className="mb-2 relative">
            <div className={`absolute -left-[39px] top-4 w-5 h-5 rounded-full border-4 border-slate-100 dark:border-slate-900 ${isFixed ? 'bg-primary' : 'bg-secondary'} z-10 transition-colors`}></div>
            <div 
              onClick={() => onSelect && onSelect(data.id)}
              className={`relative overflow-hidden p-4 rounded-xl border transition-all cursor-pointer group shadow-sm ${
                isSelected 
                  ? 'bg-white dark:bg-slate-800 border-indigo-500 ring-1 ring-indigo-500 shadow-md' 
                  : isFixed 
                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:border-slate-400' 
                    : 'bg-white/80 dark:bg-slate-800/50 border-teal-200/50 dark:border-secondary/30 hover:border-secondary/50'
              }`}
            >
            {/* Banner Background */}
            {hasBanner && (
              <>
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-10 dark:opacity-30 transition-opacity group-hover:opacity-20 dark:group-hover:opacity-40"
                  style={{ backgroundImage: `url(${data.bannerUrl})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-white/30 dark:from-slate-900/90 dark:via-slate-900/70 dark:to-slate-900/30 pointer-events-none" />
              </>
            )}

            <div className="relative z-10 flex-1 flex justify-between items-start">
                <div>
                <span className={`text-xs font-bold uppercase tracking-wider ${isFixed ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {startStr} - {endStr}
                </span>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 drop-shadow-sm">{data.title}</h3>
                {!isFixed && (
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Flexible Task ({duration}m)</p>
                )}
                </div>
                {!isFixed && (
                <div className="flex items-center gap-2">
                    {/* App/Page Button: Show if Not Done OR Has Artifact */}
                    {(!isDone || hasAnyArtifact) && (
                        <div className="flex gap-1">
                            {/* If specific App exists, prioritize showing that unless library open */}
                            {hasApp && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onOpenAppLibrary(data); }}
                                    className="p-2 rounded-full transition-colors text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-500 dark:hover:text-indigo-300"
                                    title="Open Attached Tool"
                                >
                                    <AppWindow className="w-5 h-5" />
                                </button>
                            )}
                            {hasPage && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onOpenAppLibrary(data); }}
                                    className="p-2 rounded-full transition-colors text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-500 dark:hover:text-emerald-300"
                                    title="Open Attached Guide"
                                >
                                    <Globe className="w-5 h-5" />
                                </button>
                            )}
                            {/* Fallback button if nothing attached yet */}
                            {!hasAnyArtifact && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onOpenAppLibrary(data); }}
                                    className="p-2 rounded-full transition-colors text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/10"
                                    title="Resources Library"
                                >
                                    <AppWindow className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    )}

                    {!isDone && (
                        <>
                        <button
                            onClick={(e) => { e.stopPropagation(); onOpenIdeas(data); }}
                            className="p-2 text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-500/10 rounded-full transition-colors"
                            title="Get Ideas"
                        >
                            <Lightbulb className="w-5 h-5" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onOpenTimer(data); }}
                            className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full transition-colors"
                            title="Start Timer"
                        >
                            <Timer className="w-5 h-5" />
                        </button>
                        </>
                    )}
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                        title="Delete Task"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onToggleComplete(data.id); }}
                        className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors p-2"
                    >
                        {isDone ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <Circle className="w-6 h-6" />}
                    </button>
                </div>
                )}
            </div>
            </div>
        </div>
    );
};