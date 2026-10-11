import React from 'react'
import { ChevronRight, Layers } from 'lucide-react'
import { CandidateMatch } from '@/types'

interface CandidateComparisonProps {
  candidates: CandidateMatch[]
  onSelectCandidate: (candidate: CandidateMatch) => void
}

export const CandidateComparison: React.FC<CandidateComparisonProps> = ({
  candidates,
  onSelectCandidate,
}) => {
  if (candidates.length === 0) return null

  return (
    <div className="space-y-4 font-['Urbanist']">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#A01D26]" />
            Competing Candidate Alternatives
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#D9D9D9]/80">
            Address text matched multiple postal delivery nodes with similar similarity scores. Select the intended destination.
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white border border-slate-200 dark:border-white/20">
          {candidates.length} Alternatives
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {candidates.map((cand, idx) => (
          <div
            key={cand.id || idx}
            className="bg-white dark:bg-[#1B1C1D] rounded-2xl border border-slate-200 dark:border-white/15 hover:border-slate-300 dark:hover:border-white/40 p-5 shadow-sm dark:shadow-lg transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xl font-black text-[#A01D26]">
                  {cand.pin_code}
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-[#D9D9D9] border border-slate-200 dark:border-white/15">
                  {cand.calibrated_confidence.toFixed(1)}% match
                </span>
              </div>

              <h4 className="font-bold text-base text-slate-900 dark:text-white mb-1 group-hover:text-[#A01D26] dark:group-hover:text-white transition-colors">
                {cand.post_office_name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-[#D9D9D9]/70 mb-3">
                {cand.locality}, {cand.district}, {cand.state}
              </p>

              {/* Reasons */}
              <div className="space-y-1.5 mb-4">
                {cand.evidence.slice(0, 2).map((ev, evIdx) => (
                  <div key={evIdx} className="text-[11px] text-slate-600 dark:text-[#D9D9D9]/90 flex items-start gap-1.5">
                    <span className="text-[#A01D26] font-bold">•</span>
                    <span>{ev.description}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onSelectCandidate(cand)}
              className="w-full py-2.5 px-4 rounded-full text-xs font-bold border border-slate-200 dark:border-white/20 text-slate-800 dark:text-white hover:bg-[#A01D26] hover:text-white hover:border-[#A01D26] dark:hover:bg-white dark:hover:text-[#A01D26] dark:hover:border-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Select This Post Office
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
