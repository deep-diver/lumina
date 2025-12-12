import React, { useEffect, useState } from 'react';
import { X, Lightbulb, Sparkles, ArrowRight, AppWindow, Globe } from 'lucide-react';
import { ScheduledBlock, UserProfile } from '../types';
import { suggestTaskMethods } from '../services/geminiService';

interface ActionModalProps {
  task: ScheduledBlock;
  user: UserProfile;
  durationMinutes: number;
  onClose: () => void;
  onOpenAppGenerator: (methodTitle: string, methodDesc: string, mode: 'APP' | 'PAGE') => void;
}

interface ActionMethod {
  title: string;
  description: string;
}

export const ActionModal: React.FC<ActionModalProps> = ({ task, user, durationMinutes, onClose, onOpenAppGenerator }) => {
  const [methods, setMethods] = useState<ActionMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchMethods = async () => {
      try {
        const results = await suggestTaskMethods(user, task.title, durationMinutes);
        if (mounted) {
          setMethods(results);
          setLoading(false);
        }
      } catch (e) {
        if (mounted) setLoading(false);
      }
    };
    fetchMethods();
    return () => { mounted = false; };
  }, [task, user, durationMinutes]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl overflow-hidden shadow-2xl relative transition-colors">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors z-10">
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-yellow-500/20 p-2 rounded-xl">
              <Lightbulb className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
               <h3 className="text-xl font-bold text-slate-900 dark:text-white">How to: {task.title}</h3>
               <p className="text-slate-500 dark:text-slate-400 text-sm">3 AI-Suggested Approaches</p>
            </div>
          </div>
        </div>

        <div className="p-8 pt-0 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {loading ? (
             <div className="space-y-4">
               {[1, 2, 3].map(i => (
                 <div key={i} className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 animate-pulse">
                   <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/3 mb-3"></div>
                   <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-3/4"></div>
                   <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-1/2 mt-2"></div>
                 </div>
               ))}
             </div>
          ) : (
             methods.map((method, idx) => (
               <div key={idx} className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors rounded-2xl p-6 border border-slate-200 dark:border-slate-700 group hover:border-indigo-500/50 relative overflow-hidden pr-20">
                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Sparkles className="w-16 h-16 text-indigo-500" />
                 </div>
                 
                 <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                    <button 
                      onClick={() => onOpenAppGenerator(method.title, method.description, 'APP')}
                      className="p-2 bg-white dark:bg-slate-700 hover:bg-indigo-600 text-slate-400 dark:text-slate-300 hover:text-white rounded-lg transition-all shadow-lg hover:shadow-indigo-500/50"
                      title="Generate Interactive Tool"
                    >
                      <AppWindow className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => onOpenAppGenerator(method.title, method.description, 'PAGE')}
                      className="p-2 bg-white dark:bg-slate-700 hover:bg-emerald-600 text-slate-400 dark:text-slate-300 hover:text-white rounded-lg transition-all shadow-lg hover:shadow-emerald-500/50"
                      title="Generate Info Guide"
                    >
                      <Globe className="w-5 h-5" />
                    </button>
                 </div>

                 <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors flex items-center gap-2">
                   <span className="bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs py-0.5 px-2 rounded border border-slate-200 dark:border-slate-700">Option {idx + 1}</span>
                   {method.title}
                 </h4>
                 <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{method.description}</p>
               </div>
             ))
          )}
          
          {!loading && methods.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No suggestions available.
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-center transition-colors">
           <p className="text-xs text-slate-500">Select an approach that fits your current energy level.</p>
        </div>
      </div>
    </div>
  );
};