import React, { useState } from 'react'
import {
  Copy,
  Check,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Info,
  Flag,
  Share2,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { CandidateMatch, ExtractedEntities } from '@/types'
import { PostalMap } from '@/components/common/PostalMap'

interface PredictionCardProps {
  match: CandidateMatch
  extractedEntities?: ExtractedEntities
  rankingMode?: string
  warnings?: string[]
  onReportFeedback?: () => void
  onSelectAlternative?: (candidate: CandidateMatch) => void
}

export const PredictionCard: React.FC<PredictionCardProps> = ({
  match,
  extractedEntities,
  rankingMode = 'ml_ranker',
  warnings = [],
  onReportFeedback,
}) => {
  const [copiedPin, setCopiedPin] = useState(false)
  const [copiedAll, setCopiedAll] = useState(false)
  const [showMap, setShowMap] = useState(false)

  const handleCopyPin = () => {
    navigator.clipboard.writeText(match.pin_code)
    setCopiedPin(true)
    setTimeout(() => setCopiedPin(false), 2000)
  }

  const handleCopyAll = () => {
    const text = `${match.post_office_name}, Locality: ${match.locality}, District: ${match.district}, State: ${match.state} - PIN: ${match.pin_code}`
    navigator.clipboard.writeText(text)
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  const getConfidenceBadge = (level: string, score: number) => {
    if (level === 'high') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          High Confidence ({score.toFixed(1)}%)
        </span>
      )
    }
    if (level === 'medium') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          Medium Confidence ({score.toFixed(1)}%)
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#A01D26]/10 dark:bg-[#A01D26]/20 text-[#A01D26] dark:text-white border border-[#A01D26]/30 dark:border-[#A01D26]/60">
        <ShieldAlert className="w-3.5 h-3.5 text-[#A01D26]" />
        Low Confidence ({score.toFixed(1)}%)
      </span>
    )
  }

  return (
    <div className="bg-white dark:bg-[#1B1C1D] rounded-[30px] border border-slate-200 dark:border-white/20 shadow-xl dark:shadow-2xl overflow-hidden transition-colors font-['Urbanist']">
      {/* Top Header Banner */}
      <div className="bg-slate-50 dark:bg-[#141415] border-b border-slate-200 dark:border-white/10 px-6 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xs uppercase tracking-wider font-extrabold text-slate-900 dark:text-white">
            Primary Postal Match
          </span>
          <span className="text-xs text-slate-300 dark:text-white/30">•</span>
          <span className="text-xs font-medium text-slate-500 dark:text-[#D9D9D9]">
            {rankingMode === 'ml_ranker' ? 'Ranked by ML Hybrid Model' : 'Deterministic Rule Engine'}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {getConfidenceBadge(match.confidence_level, match.calibrated_confidence)}
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white font-mono border border-slate-200 dark:border-white/15">
            Raw: {match.raw_match_score.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Main Result Content */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Prominent PIN & Name */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100 dark:border-white/10">
          <div>
            <div className="flex items-center gap-3.5">
              <span className="text-5xl sm:text-6xl font-black tracking-tight text-[#A01D26] font-mono">
                {match.pin_code}
              </span>
              <button
                onClick={handleCopyPin}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white border border-slate-200 dark:border-white/20 hover:bg-slate-200 dark:hover:bg-white/20 transition-all cursor-pointer"
                title="Copy 6-digit PIN code"
              >
                {copiedPin ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedPin ? 'Copied' : 'Copy PIN'}
              </button>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              {match.post_office_name}
            </h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-[#D9D9D9] mt-1">
              {match.locality}, {match.district}, {match.state}
            </p>
          </div>

          {/* Post Office Attributes */}
          <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 text-xs">
            <span className="px-3 py-1 rounded-full font-semibold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white border border-slate-200 dark:border-white/15">
              {match.office_type}
            </span>
            <span
              className={`px-3 py-1 rounded-full font-semibold border ${
                match.delivery_status.toLowerCase().includes('delivery') &&
                !match.delivery_status.toLowerCase().includes('non')
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-[#D9D9D9] border-slate-200 dark:border-white/15'
              }`}
            >
              {match.delivery_status} Office
            </span>
            {match.circle && (
              <span className="text-[11px] text-slate-400 dark:text-[#D9D9D9]/60">
                {match.circle}
              </span>
            )}
          </div>
        </div>

        {/* Warning alerts if contradiction detected */}
        {warnings.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-[#A01D26]/15 border border-amber-200 dark:border-[#A01D26]/40 text-amber-900 dark:text-white text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-[#A01D26]">
              <ShieldAlert className="w-4 h-4" />
              Contradiction Alert
            </div>
            {warnings.map((w, idx) => (
              <p key={idx} className="pl-6 text-slate-600 dark:text-[#D9D9D9]">{w}</p>
            ))}
          </div>
        )}

        {/* Evidence Section */}
        <div>
          <h4 className="text-xs uppercase tracking-wider font-extrabold text-slate-500 dark:text-[#D9D9D9]/80 mb-3 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#A01D26]" />
            Matching Evidence & Rationales
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {match.evidence.map((item, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                  item.is_positive
                    ? 'bg-slate-50 dark:bg-[#141415] border-slate-200 dark:border-white/15 text-slate-700 dark:text-[#D9D9D9]'
                    : 'bg-[#A01D26]/10 border-[#A01D26]/30 text-[#A01D26] dark:text-white'
                }`}
              >
                {item.is_positive ? (
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-[#A01D26] shrink-0 mt-0.5" />
                )}
                <div className="leading-relaxed">
                  <span className="font-bold capitalize text-slate-900 dark:text-white mr-1.5">
                    {item.category}:
                  </span>
                  {item.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Extracted Entities Tag Cluster */}
        {extractedEntities && (
          <div className="pt-2">
            <h4 className="text-xs uppercase tracking-wider font-extrabold text-slate-500 dark:text-[#D9D9D9]/80 mb-2.5">
              Extracted Address Components
            </h4>
            <div className="flex flex-wrap gap-2 text-xs">
              {extractedEntities.locality && (
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white border border-slate-200 dark:border-white/20">
                  Locality: <strong>{extractedEntities.locality}</strong>
                </span>
              )}
              {extractedEntities.district && (
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white border border-slate-200 dark:border-white/20">
                  District: <strong>{extractedEntities.district}</strong>
                </span>
              )}
              {extractedEntities.state && (
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white border border-slate-200 dark:border-white/20">
                  State: <strong>{extractedEntities.state}</strong>
                </span>
              )}
              {extractedEntities.landmarks.map((lm, idx) => (
                <span key={idx} className="px-3 py-1 rounded-full bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-[#D9D9D9] border border-slate-200 dark:border-white/10">
                  Landmark: {lm}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-white/10">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCopyAll}
              className="btn-hitit-secondary h-10 px-5 text-xs"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              {copiedAll ? 'Result Copied' : 'Copy Full Details'}
            </button>

            {match.has_verified_coords && (
              <button
                onClick={() => setShowMap(!showMap)}
                className={`h-10 px-5 rounded-full text-xs font-semibold border transition-all inline-flex items-center gap-2 cursor-pointer ${
                  showMap
                    ? 'bg-[#A01D26] text-white border-[#A01D26] dark:bg-white dark:text-[#A01D26] dark:border-white font-bold'
                    : 'bg-transparent text-slate-700 dark:text-white border-slate-300 dark:border-white/20 hover:border-slate-400 dark:hover:border-white/40 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                {showMap ? 'Hide Postal Map' : 'View on Map'}
              </button>
            )}
          </div>

          {onReportFeedback && (
            <button
              onClick={onReportFeedback}
              className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#D9D9D9]/70 hover:text-[#A01D26] transition-colors cursor-pointer font-medium"
            >
              <Flag className="w-3.5 h-3.5" />
              Report Inaccuracy
            </button>
          )}
        </div>

        {/* Embedded Map toggle */}
        {showMap && match.has_verified_coords && (
          <div className="pt-4 border-t border-slate-100 dark:border-white/10">
            <div className="mb-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-[#D9D9D9]/80">
              <span>Verified Survey Coordinate: <strong className="text-slate-800 dark:text-white font-mono">{match.latitude?.toFixed(4)}, {match.longitude?.toFixed(4)}</strong></span>
              <span className="font-mono text-[10px] text-slate-400 dark:text-[#D9D9D9]/50">OpenStreetMap & Leaflet</span>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/20">
              <PostalMap
                postOffices={[match as any]}
                selectedOffice={match as any}
                height="280px"
                interactive={true}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
