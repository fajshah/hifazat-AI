import React from 'react';
import { BenchmarkCase } from '../types/clinical';
import { AlertCircle, User, HeartPulse, Clock, Sparkles, PlusCircle } from 'lucide-react';

interface CaseSelectorProps {
  cases: BenchmarkCase[];
  selectedCaseId: string;
  onSelectCase: (c: BenchmarkCase) => void;
  onNewCustomCase: () => void;
  isLoadingDataset: boolean;
}

export const CaseSelector: React.FC<CaseSelectorProps> = ({
  cases,
  selectedCaseId,
  onSelectCase,
  onNewCustomCase,
  isLoadingDataset,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Challenge Benchmark Dataset</span>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              {cases.length} Clinical Cases
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a verified benchmark case or craft a custom patient record for real-time AI triage.
          </p>
        </div>

        <button
          onClick={onNewCustomCase}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Custom Case</span>
        </button>
      </div>

      {isLoadingDataset ? (
        <div className="py-8 text-center text-slate-400 text-xs animate-pulse">
          Loading benchmark dataset...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {cases.map((c) => {
            const isSelected = selectedCaseId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => onSelectCase(c)}
                className={`text-left p-3.5 rounded-xl border transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-teal-500 bg-teal-50/40 ring-2 ring-teal-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70'
                }`}
              >
                <div>
                  {/* Clean unboxed metadata with separators */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1.5 font-medium">
                    <span className="text-slate-800 font-semibold">{c.id}</span>
                    <span aria-hidden="true">·</span>
                    <span>{c.category}</span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 line-clamp-2 mb-2 leading-snug">
                    {c.title}
                  </h3>

                  <div className="text-[11px] text-slate-600 line-clamp-2 mb-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    "{c.patient.chiefComplaint}"
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">
                    {c.patient.age}y {c.patient.gender}
                  </span>
                  <span
                    className={`font-semibold ${
                      c.goldStandard.expectedEsi === 'ESI-1'
                        ? 'text-rose-600'
                        : c.goldStandard.expectedEsi === 'ESI-2'
                        ? 'text-amber-600'
                        : 'text-slate-600'
                    }`}
                  >
                    Expected {c.goldStandard.expectedEsi}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
