import React from 'react';
import { Activity, ShieldAlert, Sparkles, Database, Sliders, FileText, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'triage' | 'benchmark' | 'whatif' | 'showcase';
  setActiveTab: (tab: 'triage' | 'benchmark' | 'whatif' | 'showcase') => void;
  isAnalyzing: boolean;
  selectedCaseTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isAnalyzing,
  selectedCaseTitle,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-700 flex items-center justify-center text-white shadow-sm">
              <Activity className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900">
                  PulseTriage <span className="text-teal-600 font-extrabold">AI</span>
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  Build with AI
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Clinical Decision Support Engine</span>
                <span aria-hidden="true">·</span>
                <span>Gemini 3.8 Flash</span>
                {selectedCaseTitle && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-700 font-medium truncate max-w-[200px]">
                      {selectedCaseTitle}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Segmented Controls */}
          <nav className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('triage')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'triage'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-teal-600" />
              <span>Clinical Triage</span>
            </button>

            <button
              onClick={() => setActiveTab('whatif')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'whatif'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Sliders className="w-4 h-4 text-amber-600" />
              <span>What-If Sandbox</span>
            </button>

            <button
              onClick={() => setActiveTab('benchmark')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'benchmark'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Database className="w-4 h-4 text-blue-600" />
              <span>Dataset & Eval</span>
            </button>

            <button
              onClick={() => setActiveTab('showcase')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'showcase'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <FileText className="w-4 h-4 text-purple-600" />
              <span>Showcase & README</span>
            </button>
          </nav>

          {/* Engine Status & Latency Badge */}
          <div className="hidden lg:flex items-center gap-3">
            {isAnalyzing ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs font-medium text-amber-800">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>Deep Reasoning Active...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Decision Engine Ready</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
