import React from 'react';
import { X, Play, Trash2, Smartphone, Globe } from 'lucide-react';
import { BookmarkedApp } from '../types';

interface AppLibraryModalProps {
  apps: BookmarkedApp[];
  currentApp?: { title: string; code: string }; 
  currentWebPage?: { title: string; code: string };
  onClose: () => void;
  onSelect: (app: { title: string, code: string, description: string, type: 'APP' | 'PAGE' }) => void;
  onDelete: (id: string) => void;
}

export const AppLibraryModal: React.FC<AppLibraryModalProps> = ({ apps, currentApp, currentWebPage, onClose, onSelect, onDelete }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[80vh] transition-colors">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors z-10">
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 pb-4 shrink-0 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/20 p-2 rounded-xl">
              <Smartphone className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
               <h3 className="text-xl font-bold text-slate-900 dark:text-white">Resource Library</h3>
               <p className="text-slate-500 dark:text-slate-400 text-sm">Reusable AI tools and guides for your daily tasks</p>
            </div>
          </div>
        </div>

        <div className="p-8 pt-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          
          {/* Linked App Section */}
          {currentApp && (
             <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-500/30 rounded-xl p-5 mb-2 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-30 transition-opacity">
                    <Smartphone className="w-16 h-16 text-indigo-500"/>
                </div>
                <div className="relative z-10">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wide mb-2">
                        Active Tool
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{currentApp.title}</h4>
                    <button 
                        onClick={() => onSelect({ title: currentApp.title, description: 'Linked App', code: currentApp.code, type: 'APP' })}
                        className="w-full mt-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        <Play className="w-4 h-4" /> Open Attached App
                    </button>
                </div>
             </div>
          )}

          {/* Linked Web Page Section */}
          {currentWebPage && (
             <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-5 mb-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-30 transition-opacity">
                    <Globe className="w-16 h-16 text-emerald-500"/>
                </div>
                <div className="relative z-10">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wide mb-2">
                        Active Guide
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{currentWebPage.title}</h4>
                    <button 
                        onClick={() => onSelect({ title: currentWebPage.title, description: 'Linked Guide', code: currentWebPage.code, type: 'PAGE' })}
                        className="w-full mt-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
                    >
                        <Play className="w-4 h-4" /> Open Attached Guide
                    </button>
                </div>
             </div>
          )}
          
          {/* Divider if current artifact exists */}
          {(currentApp || currentWebPage) && apps.length > 0 && (
            <div className="flex items-center gap-4 py-2">
                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-600 uppercase">Saved Library</span>
                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
            </div>
          )}

          {apps.length === 0 && !currentApp && !currentWebPage ? (
             <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
               <p>No bookmarked resources yet.</p>
               <p className="text-xs mt-2">Generate a tool or guide from task ideas and click "Bookmark" to save it here.</p>
             </div>
          ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {apps.map((app) => (
                 <div key={app.id} className="bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl p-5 group hover:border-indigo-500/50 transition-all flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-2 right-2 text-slate-300 dark:text-slate-700 group-hover:text-slate-400 dark:group-hover:text-slate-600">
                        {app.type === 'PAGE' ? <Globe className="w-8 h-8 opacity-20"/> : <Smartphone className="w-8 h-8 opacity-20"/>}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${app.type === 'PAGE' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'}`}>
                                {app.type === 'PAGE' ? 'Guide' : 'App'}
                            </span>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-1 truncate">{app.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 h-8">{app.description}</p>
                    </div>
                    
                    <div className="flex gap-2">
                        <button 
                            onClick={() => onSelect({ ...app, type: app.type || 'APP' })}
                            className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                            <Play className="w-3 h-3" /> Load
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(app.id); }}
                            className="p-2 bg-slate-200 dark:bg-slate-700 hover:bg-red-500/20 hover:text-red-500 dark:hover:text-red-400 text-slate-500 dark:text-slate-400 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                 </div>
               ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};