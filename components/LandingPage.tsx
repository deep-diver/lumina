import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, Wind, Layers, PlayCircle, Beaker, Briefcase, Coffee, Camera, Dumbbell, Gamepad2 } from 'lucide-react';
import { DemoScenarioKey } from '../data/demoData';

interface LandingPageProps {
  onEnter: () => void;
  onShowcase: (key: DemoScenarioKey) => void;
  isExiting: boolean;
}

export const LandingPage = ({ onEnter, onShowcase, isExiting }: LandingPageProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-slate-950 text-white transition-transform duration-1000 ease-[cubic-bezier(0.7,0,0.3,1)] ${isExiting ? '-translate-y-full' : 'translate-y-0'}`}
    >
      
      {/* Aurora Background */}
      <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-violet-600/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-teal-600/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
          <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[50vw] h-[50vw] bg-indigo-500/5 rounded-full blur-[100px] animate-blob"></div>
      </div>
      
      <div className={`relative z-10 w-full max-w-6xl px-6 flex flex-col items-center text-center space-y-12 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        {/* Hero */}
        <div className="space-y-4 flex flex-col items-center mt-6 md:mt-0">
          <div className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl mb-2 group cursor-pointer hover:bg-white/10 transition-colors">
             <Sparkles className="w-8 h-8 text-teal-300 group-hover:rotate-12 transition-transform duration-500" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500 drop-shadow-sm">
            Flow State.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-lg mx-auto font-medium leading-relaxed">
            Connect your daily habits to your <span className="text-teal-300">wildest dreams</span>.
          </p>
        </div>

        {/* Main CTA */}
        <div>
            <button 
              onClick={onEnter}
              className="group relative inline-flex items-center gap-3 px-10 py-4 bg-white text-slate-950 rounded-full text-lg font-bold tracking-wide hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all duration-500 hover:scale-105 active:scale-95"
            >
              <span className="relative z-10">Start Your Journey</span>
              <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>

        {/* Showcase Section */}
        <div className="w-full pt-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Or explore a life...</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
                {/* Row 1 */}
                <button onClick={() => onShowcase('RESEARCHER')} className="group relative bg-slate-900/40 border border-white/10 hover:border-indigo-500/50 p-6 rounded-3xl flex flex-col items-center gap-4 transition-all hover:bg-slate-800/60 hover:-translate-y-1">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Beaker className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-200">The AI Researcher</h3>
                        <p className="text-xs text-slate-500 mt-1">Publishing papers & Coding Viz</p>
                    </div>
                </button>

                <button onClick={() => onShowcase('SWITCHER')} className="group relative bg-slate-900/40 border border-white/10 hover:border-emerald-500/50 p-6 rounded-3xl flex flex-col items-center gap-4 transition-all hover:bg-slate-800/60 hover:-translate-y-1">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Briefcase className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-200">The Career Pivot</h3>
                        <p className="text-xs text-slate-500 mt-1">Marketing to ML Engineer</p>
                    </div>
                </button>

                <button onClick={() => onShowcase('BAKER')} className="group relative bg-slate-900/40 border border-white/10 hover:border-orange-500/50 p-6 rounded-3xl flex flex-col items-center gap-4 transition-all hover:bg-slate-800/60 hover:-translate-y-1">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Coffee className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-200">The Eco Baker</h3>
                        <p className="text-xs text-slate-500 mt-1">Zero-waste Startup Journey</p>
                    </div>
                </button>

                {/* Row 2 */}
                <button onClick={() => onShowcase('NOMAD')} className="group relative bg-slate-900/40 border border-white/10 hover:border-sky-500/50 p-6 rounded-3xl flex flex-col items-center gap-4 transition-all hover:bg-slate-800/60 hover:-translate-y-1">
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Camera className="w-6 h-6 text-sky-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-200">The Digital Nomad</h3>
                        <p className="text-xs text-slate-500 mt-1">Vlogging & World Travel</p>
                    </div>
                </button>

                <button onClick={() => onShowcase('COACH')} className="group relative bg-slate-900/40 border border-white/10 hover:border-rose-500/50 p-6 rounded-3xl flex flex-col items-center gap-4 transition-all hover:bg-slate-800/60 hover:-translate-y-1">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Dumbbell className="w-6 h-6 text-rose-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-200">The Fitness Coach</h3>
                        <p className="text-xs text-slate-500 mt-1">Triathlon Training & Coaching</p>
                    </div>
                </button>

                <button onClick={() => onShowcase('DEVELOPER')} className="group relative bg-slate-900/40 border border-white/10 hover:border-purple-500/50 p-6 rounded-3xl flex flex-col items-center gap-4 transition-all hover:bg-slate-800/60 hover:-translate-y-1">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Gamepad2 className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-200">The Indie Dev</h3>
                        <p className="text-xs text-slate-500 mt-1">Pixel Art & Game Code</p>
                    </div>
                </button>
            </div>
        </div>

      </div>
      
      {/* Footer minimal */}
      <div className="absolute bottom-6 text-slate-700 text-[10px] font-mono tracking-widest uppercase opacity-50">
        Design Your Legacy
      </div>
    </div>
  );
}