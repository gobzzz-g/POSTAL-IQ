import React, { useState } from 'react'
import {
  Compass,
  Search,
  Hash,
  X,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react'
import { api } from '@/services/api'
import { motion } from 'motion/react'
import { PredictionResponse, CandidateMatch, PostOffice } from '@/types'
import { PredictionCard } from '@/features/prediction/PredictionCard'
import { CandidateComparison } from '@/features/prediction/CandidateComparison'
import { ClarificationPrompt } from '@/features/prediction/ClarificationPrompt'
import { FeedbackModal } from '@/features/prediction/FeedbackModal'

const EXAMPLE_QUERIES = [
  {
    label: 'Standard Complete: Koramangala, Bengaluru',
    text: 'Koramangala 4th Block, Bengaluru Urban, Karnataka',
    type: 'complete',
  },
  {
    label: 'Misspelled Locality: Kormangla (Typo)',
    text: '4th Cross, Kormangla, Bangalore, KA',
    type: 'typo',
  },
  {
    label: 'Abbreviated & Landmarks: BKC, Mumbai',
    text: 'FLT 402, B/H Metro Stn, BKC, Bandra West, MH',
    type: 'abbrev',
  },
  {
    label: 'Ambiguous Delivery: Salt Lake Sector 1',
    text: 'Bidhannagar Sector 1, Salt Lake, Kolkata, West Bengal',
    type: 'ambiguous',
  },
  {
    label: 'IT Hub Alias: Cyber City, Gurugram',
    text: 'Building 10, DLF Cyber City, Gurgaon, Haryana',
    type: 'alias',
  },
  {
    label: 'Contradictory Conflict: Connaught Place in Pune',
    text: 'Connaught Place, Pune, Maharashtra',
    type: 'contradictory',
  },
  {
    label: 'Unsupported Query: Non-existent location',
    text: 'Fictional alleyway 999999 imaginary place',
    type: 'unsupported',
  },
]

export const AddressWorkspace: React.FC = () => {
  const [addressInput, setAddressInput] = useState('')
  const [explicitPin, setExplicitPin] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<PredictionResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  // Direct PIN lookup state
  const [searchMode, setSearchMode] = useState<'address' | 'pin'>('address')
  const [pinInput, setPinInput] = useState('')
  const [pinResults, setPinResults] = useState<PostOffice[] | null>(null)
  const [pinLoading, setPinLoading] = useState(false)
  const [pinError, setPinError] = useState<string | null>(null)

  const handlePredict = async (
    textToAnalyze: string = addressInput,
    clarificationAnswer?: string
  ) => {
    if (!textToAnalyze.trim()) return

    setError(null)
    setIsLoading(true)

    try {
      const resp = await api.predictAddress(
        textToAnalyze.trim(),
        explicitPin.trim() || undefined,
        clarificationAnswer
      )
      setResult(resp)
    } catch (err: any) {
      setError(err.message || 'Failed to process address prediction')
      setResult(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDirectPinLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pinInput.trim()) return

    setPinError(null)
    setPinLoading(true)
    setPinResults(null)

    try {
      const pos = await api.getPostOfficesByPin(pinInput.trim())
      setPinResults(pos)
    } catch (err: any) {
      setPinError(err.message || 'Failed to lookup PIN code')
    } finally {
      setPinLoading(false)
    }
  }

  const handleSelectExample = (text: string) => {
    setAddressInput(text)
    setResult(null)
    setError(null)
    handlePredict(text)
  }

  const handleClear = () => {
    setAddressInput('')
    setExplicitPin('')
    setResult(null)
    setError(null)
  }

  const handleSelectCandidate = (candidate: CandidateMatch) => {
    if (!result) return
    const remainingAlts = [
      result.primary_match,
      ...result.alternatives.filter((c) => c.id !== candidate.id),
    ].filter(Boolean) as CandidateMatch[]

    setResult({
      ...result,
      primary_match: candidate,
      alternatives: remainingAlts,
      overall_confidence: candidate.calibrated_confidence / 100.0,
      confidence_level: candidate.confidence_level,
      status: 'matched',
    })
  }

  const handleClarificationAnswer = (answer: string) => {
    handlePredict(addressInput, answer)
  }

  return (
    <div className="space-y-10 font-['Urbanist']">
      {/* Editorial Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#A01D26]/10 dark:bg-[#A01D26]/15 text-[#A01D26] dark:text-white border border-[#A01D26]/30 dark:border-[#A01D26]/40">
          <Sparkles className="w-3.5 h-3.5 text-[#A01D26]" />
          <span>Postal Intelligence Engine • India Post Gazette 2024</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
          Every address. <br className="hidden sm:inline" />
          <span className="text-[#A01D26]">One intelligent match.</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-[#D9D9D9] max-w-2xl mx-auto leading-relaxed">
          Identify Indian PIN codes and delivery post offices from incomplete, abbreviated, or misspelled addresses—with transparent matching evidence.
        </p>

        {/* Mode Selector Tabs */}
        <div className="flex justify-center pt-2">
          <div className="inline-flex p-1.5 rounded-full bg-slate-200/70 dark:bg-[#1B1C1D] border border-slate-300 dark:border-white/20">
            <button
              onClick={() => setSearchMode('address')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-[0.5px] transition-all cursor-pointer ${
                searchMode === 'address'
                  ? 'bg-[#A01D26] text-white shadow-sm'
                  : 'text-slate-600 dark:text-[#D9D9D9] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4" />
              Address Intelligence & Prediction
            </button>
            <button
              onClick={() => setSearchMode('pin')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-[0.5px] transition-all cursor-pointer ${
                searchMode === 'pin'
                  ? 'bg-[#A01D26] text-white shadow-sm'
                  : 'text-slate-600 dark:text-[#D9D9D9] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Hash className="w-4 h-4" />
              Direct 6-Digit PIN Lookup
            </button>
          </div>
        </div>
      </div>

      {searchMode === 'address' ? (
        /* Address Prediction Workspace */
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main Search Surface */}
          <div className="bg-white dark:bg-[#1B1C1D] rounded-[30px] border border-slate-200 dark:border-white/20 p-6 sm:p-8 space-y-5 shadow-xl dark:shadow-2xl transition-colors">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#D9D9D9]/80">
                Enter Indian Postal Address
              </label>

              {/* Character Counter & Clear */}
              <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-[#D9D9D9]/60">
                <span className="font-mono">{addressInput.length} / 1000</span>
                {addressInput && (
                  <button
                    onClick={handleClear}
                    className="text-slate-500 dark:text-[#D9D9D9]/60 hover:text-[#A01D26] flex items-center gap-1 transition-colors font-medium cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Address Textarea */}
            <div className="relative">
              <textarea
                rows={3}
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handlePredict()
                  }
                }}
                placeholder="Enter a street, building, locality, landmark, city, district, or complete postal address..."
                className="w-full px-5 py-4 text-sm sm:text-base rounded-2xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#141415] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#D9D9D9]/40 focus:outline-none focus:border-[#A01D26] focus:ring-1 focus:ring-[#A01D26] transition-all resize-y"
              />
            </div>

            {/* Examples & Analyze Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              {/* Preset Examples Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-[#D9D9D9]/80 shrink-0">Try Example:</span>
                <select
                  onChange={(e) => {
                    const sel = EXAMPLE_QUERIES.find((q) => q.text === e.target.value)
                    if (sel) handleSelectExample(sel.text)
                  }}
                  value=""
                  className="text-xs px-3.5 py-2 rounded-full border border-slate-200 dark:border-white/20 bg-white dark:bg-[#141415] text-slate-800 dark:text-white focus:outline-none focus:border-[#A01D26] cursor-pointer"
                >
                  <option value="" disabled className="bg-white dark:bg-[#1B1C1D] text-slate-400 dark:text-[#D9D9D9]">Select verified benchmark query...</option>
                  {EXAMPLE_QUERIES.map((ex, idx) => (
                    <option key={idx} value={ex.text} className="bg-white dark:bg-[#1B1C1D] text-slate-800 dark:text-white">
                      {ex.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Primary Analyze Action Button */}
              <button
                onClick={() => handlePredict()}
                disabled={!addressInput.trim() || isLoading}
                className="btn-hitit-primary self-end sm:self-auto w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white dark:text-[#A01D26]" />
                    <span>Analyzing Postal Graph...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze Address</span>
                    <ArrowRight className="w-4 h-4 text-white dark:text-[#A01D26]" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-5 rounded-2xl bg-[#A01D26]/10 dark:bg-[#A01D26]/15 border border-[#A01D26]/30 dark:border-[#A01D26]/40 text-[#A01D26] dark:text-white text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[#A01D26] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Loading Indicator State */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-8 rounded-[30px] bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/15 text-center space-y-4 shadow-lg"
            >
              <div className="w-12 h-12 rounded-full bg-[#A01D26]/10 text-[#A01D26] mx-auto flex items-center justify-center">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Scanning Postal Knowledge Graph...
                </h4>
                <p className="text-xs text-slate-500 dark:text-[#D9D9D9]/70">
                  Executing token normalization, TF-IDF candidate retrieval, and geographic consistency validation.
                </p>
              </div>
            </motion.div>
          )}

          {/* Results Display */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              {/* Unmatched State */}
              {result.status === 'unmatched' || !result.primary_match ? (
                <div className="bg-white dark:bg-[#1B1C1D] rounded-[30px] border border-slate-200 dark:border-white/20 p-10 text-center space-y-4 shadow-xl">
                  <div className="w-14 h-14 rounded-full bg-[#A01D26]/15 dark:bg-[#A01D26]/20 text-[#A01D26] mx-auto flex items-center justify-center border border-[#A01D26]/30 dark:border-[#A01D26]/40">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    No Reliable Postal Match Found
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-[#D9D9D9] max-w-md mx-auto leading-relaxed">
                    The evidence was insufficient to identify a verified 6-digit Indian PIN code. In accordance with POSTALIQ integrity rules, the engine refused to fabricate a speculative result.
                  </p>
                  <p className="text-xs text-[#A01D26] font-semibold">
                    Try adding the administrative district, city, or a prominent landmark.
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        setResult(null)
                        setError(null)
                        setAddressInput('')
                      }}
                      className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-700 dark:text-white bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 transition-colors cursor-pointer"
                    >
                      Clear & Try Another Address
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Primary Match Card */}
                  <PredictionCard
                    match={result.primary_match}
                    extractedEntities={result.extracted_entities}
                    rankingMode={result.ranking_mode}
                    warnings={result.warnings}
                    onReportFeedback={() => setFeedbackOpen(true)}
                  />

                  {/* Clarification Assistant */}
                  {result.clarification && (
                    <ClarificationPrompt
                      clarification={result.clarification}
                      onSubmitAnswer={handleClarificationAnswer}
                      isLoading={isLoading}
                    />
                  )}

                  {/* Candidate Alternatives */}
                  {result.alternatives.length > 0 && (
                    <CandidateComparison
                      candidates={result.alternatives}
                      onSelectCandidate={handleSelectCandidate}
                    />
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* Empty State before search */}
          {!result && !error && !isLoading && (
            <div className="text-center py-6">
              <p className="text-xs text-slate-400 dark:text-[#D9D9D9]/50">
                Pro tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white font-mono text-[11px]">Ctrl + Enter</kbd> to analyze immediately.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Direct PIN Lookup Workspace */
        <div className="max-w-2xl mx-auto space-y-6">
          <form
            onSubmit={handleDirectPinLookup}
            className="bg-white dark:bg-[#1B1C1D] rounded-[30px] border border-slate-200 dark:border-white/20 p-6 sm:p-8 space-y-5 shadow-xl dark:shadow-2xl transition-colors"
          >
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#D9D9D9]/80">
              Lookup by 6-Digit Indian PIN Code
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 560034"
                className="flex-1 px-5 py-3 text-xl font-mono tracking-widest rounded-full border border-slate-200 dark:border-white/20 bg-slate-50 dark:bg-[#141415] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#D9D9D9]/40 focus:outline-none focus:border-[#A01D26] focus:ring-1 focus:ring-[#A01D26]"
              />
              <button
                type="submit"
                disabled={pinInput.length !== 6 || pinLoading}
                className="btn-hitit-primary shrink-0"
              >
                {pinLoading ? <RefreshCw className="w-4 h-4 animate-spin text-white dark:text-[#A01D26]" /> : <Search className="w-4 h-4 text-white dark:text-[#A01D26]" />}
                <span>Find Offices</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#D9D9D9]/60">
              Validates format against India Post national registry (first digit 1–9, 6 digits).
            </p>
          </form>

          {pinError && (
            <div className="p-5 rounded-2xl bg-[#A01D26]/10 dark:bg-[#A01D26]/15 border border-[#A01D26]/30 dark:border-[#A01D26]/40 text-[#A01D26] dark:text-white text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[#A01D26] shrink-0" />
              <span>{pinError}</span>
            </div>
          )}

          {pinResults && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-[#D9D9D9]/80 px-2">
                <span>Found {pinResults.length} post office(s) under PIN <strong className="text-slate-900 dark:text-white font-mono">{pinInput}</strong></span>
              </div>
              <div className="space-y-3">
                {pinResults.map((po) => (
                  <div
                    key={po.id}
                    className="p-5 rounded-2xl bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-[#A01D26]/40 hover:-translate-y-0.5 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-lg font-bold text-[#A01D26]">
                          {po.pin_code}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 font-semibold text-slate-700 dark:text-white">
                          {po.office_type}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white border border-slate-200 dark:border-white/20">
                          {po.delivery_status}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                        {po.post_office_name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-[#D9D9D9]">
                        {po.locality}, {po.district}, {po.state}
                      </p>
                    </div>

                    {po.has_verified_coords && po.latitude && po.longitude && (
                      <span className="text-[11px] text-slate-400 dark:text-[#D9D9D9]/60 font-mono">
                        GPS: {po.latitude.toFixed(4)}, {po.longitude.toFixed(4)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Feedback modal */}
      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        queryText={addressInput}
        predictedPin={result?.primary_match?.pin_code}
        predictedPostOffice={result?.primary_match?.post_office_name}
      />
    </div>
  )
}
