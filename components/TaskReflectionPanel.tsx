import React, { useState, useEffect, useRef } from 'react';
import { ScheduledBlock, UserProfile } from '../types';
import { Sparkles, Save, Image as ImageIcon, RotateCcw, Loader2, Upload, Check } from 'lucide-react';
import { generateReflectionText, generateReflectionImage } from '../services/geminiService';

interface TaskReflectionPanelProps {
  task: ScheduledBlock;
  user: UserProfile;
  onSave: (taskId: string, data: Partial<ScheduledBlock>) => void;
}

export const TaskReflectionPanel: React.FC<TaskReflectionPanelProps> = ({ task, user, onSave }) => {
  const [facts, setFacts] = useState<string[]>(['', '', '']);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  const [isTextLoading, setIsTextLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when selected task changes
  useEffect(() => {
    setFacts(task.facts || ['', '', '']);
    setDescription(task.description || '');
    setImageUrl(task.imageUrl || null);
    setIsSaved(false); // Reset saved state on task switch
  }, [task.id]); // Use ID dependency to reset only when switching tasks

  const handleFactChange = (index: number, value: string) => {
    const newFacts = [...facts];
    newFacts[index] = value;
    setFacts(newFacts);
    setIsSaved(false);
  };

  const handleGenerateText = async () => {
    setIsTextLoading(true);
    try {
      const result = await generateReflectionText(user, task.title, facts, description);
      setDescription(result);
      setIsSaved(false);
    } finally {
      setIsTextLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    setIsImageLoading(true);
    try {
      // Use description if available, otherwise fallback to title + facts
      const promptDesc = description || `${task.title} - ${facts.join(', ')}`;
      const result = await generateReflectionImage(user, task.title, promptDesc);
      if (result) {
        setImageUrl(result);
        setIsSaved(false);
      }
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        setIsSaved(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(task.id, {
      facts: facts.filter(f => f.trim() !== ''),
      description,
      imageUrl: imageUrl || undefined
    });
    
    // Trigger feedback effect
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900 h-full flex flex-col w-full transition-colors">
      
      {/* Banner Image */}
      {task.bannerUrl && (
          <div className="h-24 w-full relative overflow-hidden shrink-0">
              <img src={task.bannerUrl} alt="Task Banner" className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/80 dark:to-slate-900"></div>
          </div>
      )}

      {/* Header */}
      <div className={`mb-4 pb-4 border-b border-slate-200 dark:border-slate-800 p-6 shrink-0 ${task.bannerUrl ? 'pt-2' : 'pt-6'}`}>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 relative z-10">{task.title}</h2>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-mono relative z-10">
           <span>{task.startTime} - {task.endTime}</span>
           <span>•</span>
           <span className={task.isCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500"}>
             {task.isCompleted ? "Completed" : "Planned"}
           </span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-0 space-y-6">
        
        {/* Facts Input */}
        <div>
           <label className="block text-xs font-bold uppercase text-slate-500 mb-3 tracking-wider">Quick Facts (3 Key Points)</label>
           <div className="space-y-2">
             {facts.map((fact, idx) => (
               <input 
                 key={idx}
                 type="text"
                 placeholder={`Fact ${idx + 1}`}
                 value={fact}
                 onChange={(e) => handleFactChange(idx, e.target.value)}
                 className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition-colors text-slate-900 dark:text-white"
               />
             ))}
           </div>
        </div>

        {/* Description Input */}
        <div className="relative group">
           <div className="flex justify-between items-center mb-3">
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider">Journal & Reflection</label>
              <button 
                onClick={handleGenerateText}
                disabled={isTextLoading}
                className="text-xs bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-600 dark:text-indigo-300 px-2 py-1 rounded-md flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                {isTextLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3"/>}
                {description ? 'Rewrite with AI' : 'Auto-Write with AI'}
              </button>
           </div>
           <textarea 
             value={description}
             onChange={(e) => { setDescription(e.target.value); setIsSaved(false); }}
             placeholder="What happened? How did you feel? Leave empty and click AI button to auto-generate from facts."
             className="w-full h-40 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm leading-relaxed focus:ring-1 focus:ring-indigo-500 outline-none resize-none text-slate-900 dark:text-white"
           />
        </div>

        {/* Image Section */}
        <div>
           <div className="flex justify-between items-center mb-3">
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider">Visual Memory</label>
              <div className="flex gap-2">
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept="image/*" 
                    className="hidden" 
                 />
                 <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-md flex items-center gap-1 transition-colors"
                 >
                    <Upload className="w-3 h-3"/> Upload
                 </button>
                 <button 
                  onClick={handleGenerateImage}
                  disabled={isImageLoading}
                  className="text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-600 dark:text-purple-300 px-2 py-1 rounded-md flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  {isImageLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : <ImageIcon className="w-3 h-3"/>}
                  {imageUrl ? 'Regenerate' : 'Generate'}
                </button>
              </div>
           </div>
           
           <div className="w-full aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden relative group">
              {imageUrl ? (
                <>
                  <img src={imageUrl} alt="Generated visual memory" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                       onClick={() => { setImageUrl(null); setIsSaved(false); }}
                       className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600 transition-colors"
                       title="Remove Image"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600 gap-2">
                   <ImageIcon className="w-8 h-8 opacity-50" />
                   <span className="text-xs">No image yet</span>
                </div>
              )}
              {isImageLoading && (
                <div className="absolute inset-0 bg-white/70 dark:bg-black/70 flex flex-col items-center justify-center text-purple-500 dark:text-purple-400 gap-2 backdrop-blur-sm">
                   <Loader2 className="w-8 h-8 animate-spin" />
                   <span className="text-xs font-mono animate-pulse">Dreaming...</span>
                </div>
              )}
           </div>
        </div>

      </div>

      {/* Footer Actions */}
      <div className="p-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
         <button 
           onClick={handleSave}
           disabled={isSaved}
           className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all duration-300 ${
             isSaved 
               ? 'bg-emerald-500 text-white shadow-emerald-500/20 scale-105' 
               : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
           }`}
         >
           {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
           {isSaved ? 'Saved!' : 'Save Log'}
         </button>
      </div>

    </div>
  );
};