import React, { useEffect, useState, useRef } from 'react';
import { X, RefreshCw, Smartphone, Code, Loader2, Bookmark, Check, Globe } from 'lucide-react';
import { generateMiniAppStream, generateStaticPageStream } from '../services/geminiService';
import { UserProfile } from '../types';

interface AppGeneratorModalProps {
  user: UserProfile;
  taskTitle: string;
  methodTitle: string;
  methodDescription: string;
  mode: 'APP' | 'PAGE';
  existingCode?: string;
  onClose: () => void;
  onCodeUpdate: (code: string) => void;
  onBookmark: (code: string) => void;
}

export const AppGeneratorModal: React.FC<AppGeneratorModalProps> = ({
  user,
  taskTitle,
  methodTitle,
  methodDescription,
  mode,
  existingCode,
  onClose,
  onCodeUpdate,
  onBookmark
}) => {
  const [streamedCode, setStreamedCode] = useState(existingCode || '');
  const [displayCode, setDisplayCode] = useState(existingCode || '');
  // Initialize as generating if no code exists to prevent button flash
  const [isGenerating, setIsGenerating] = useState(!existingCode);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const streamRef = useRef<string>('');
  
  // Start generation if no existing code
  useEffect(() => {
    if (!existingCode) {
      handleGenerate();
    }
  }, []);

  // Update preview every 5 seconds while generating to show progress
  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      interval = setInterval(() => {
        setDisplayCode(streamRef.current);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // When generation finishes, ensure final code is displayed
  useEffect(() => {
    if (!isGenerating && streamedCode) {
      setDisplayCode(streamedCode);
    }
  }, [isGenerating, streamedCode]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setIsBookmarked(false);
    setStreamedCode('');
    streamRef.current = '';
    
    try {
      // Choose stream function based on mode
      const stream = mode === 'PAGE' 
        ? generateStaticPageStream(user, taskTitle, methodTitle, methodDescription)
        : generateMiniAppStream(user, taskTitle, methodTitle, methodDescription);
      
      for await (const chunk of stream) {
        // Simple clean up if markdown fences are included despite instructions
        const cleanChunk = chunk;
        streamRef.current += cleanChunk;
        setStreamedCode(prev => prev + cleanChunk);
      }
      
      // Final cleanup of markdown block if present at start/end
      let finalCode = streamRef.current;
      if (finalCode.startsWith('```html')) finalCode = finalCode.replace('```html', '');
      if (finalCode.startsWith('```')) finalCode = finalCode.replace('```', '');
      if (finalCode.endsWith('```')) finalCode = finalCode.slice(0, -3);
      
      setStreamedCode(finalCode);
      onCodeUpdate(finalCode); // Save to parent state
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBookmark = () => {
    if (streamedCode) {
      onBookmark(streamedCode);
      setIsBookmarked(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl h-[85vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shadow-2xl relative transition-colors">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isGenerating ? 'bg-indigo-500/20 text-indigo-500 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
              {mode === 'PAGE' ? <Globe className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {methodTitle} <span className="text-slate-500 font-normal">{mode === 'PAGE' ? 'Guide' : 'Mini-App'}</span>
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <button
               onClick={handleBookmark}
               disabled={isGenerating || isBookmarked || !streamedCode}
               className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${isBookmarked ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed'}`}
             >
                {isBookmarked ? <Check className="w-3 h-3"/> : <Bookmark className="w-3 h-3"/>}
                {isBookmarked ? 'Saved' : 'Bookmark'}
             </button>
             <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
             <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors"
            >
              {isGenerating ? <Loader2 className="w-3 h-3 animate-spin"/> : <RefreshCw className="w-3 h-3"/>}
              {isGenerating ? 'Generating...' : 'Regenerate'}
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-950 relative">
          {!displayCode && isGenerating && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-4">
               <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
               <p className="text-sm font-mono animate-pulse">Initializing Development Environment...</p>
             </div>
          )}
          
          <iframe 
            srcDoc={displayCode}
            title="Generated App Preview"
            className="w-full h-full border-none bg-white"
            sandbox="allow-scripts allow-modals"
          />
          
          {/* Stream Overlay Indicator */}
          {isGenerating && (
             <div className="absolute bottom-4 right-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200 dark:border-slate-700 text-xs text-indigo-500 dark:text-indigo-400 px-3 py-2 rounded-full font-mono flex items-center gap-2 shadow-lg">
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Streaming Code...
             </div>
          )}
        </div>
      </div>
    </div>
  );
};