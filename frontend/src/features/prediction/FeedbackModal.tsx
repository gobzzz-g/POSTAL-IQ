import React, { useState } from 'react'
import { X, Send, AlertCircle, CheckCircle2 } from 'lucide-react'
import { api } from '@/services/api'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  queryText: string
  predictedPin?: string | null
  predictedPostOffice?: string | null
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  queryText,
  predictedPin,
  predictedPostOffice,
}) => {
  const [suggestedPin, setSuggestedPin] = useState('')
  const [suggestedPo, setSuggestedPo] = useState('')
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await api.submitFeedback({
        query_text: queryText,
        predicted_pin: predictedPin || undefined,
        predicted_post_office: predictedPostOffice || undefined,
        suggested_pin: suggestedPin.trim() || undefined,
        suggested_post_office: suggestedPo.trim() || undefined,
        user_comment: comment.trim() || undefined,
      })
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        onClose()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 font-['Urbanist']">
      <div className="bg-white dark:bg-[#1B1C1D] rounded-[28px] border border-slate-200 dark:border-white/20 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 relative text-slate-900 dark:text-white transition-colors">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 dark:text-[#D9D9D9]/70 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Report Postal Prediction Inaccuracy
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#D9D9D9] mt-1.5 leading-relaxed">
            Help improve POSTALIQ's gazetteer and ranking weights. Submissions are queued for administrative audit.
          </p>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-base text-slate-900 dark:text-white">Report Logged Successfully</h4>
            <p className="text-xs text-slate-500 dark:text-[#D9D9D9]">Thank you for helping maintain postal data integrity.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#D9D9D9]/80 mb-1.5">
                Original Address Text
              </label>
              <div className="text-xs p-3 rounded-xl bg-slate-100 dark:bg-[#141415] text-slate-700 dark:text-[#D9D9D9] font-mono border border-slate-200 dark:border-white/10">
                {queryText}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#D9D9D9]/80 mb-1">
                  Expected PIN (Optional)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={suggestedPin}
                  onChange={(e) => setSuggestedPin(e.target.value)}
                  placeholder="e.g. 560034"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#141415] text-slate-900 dark:text-white font-mono placeholder:text-slate-400 dark:placeholder:text-[#D9D9D9]/40 focus:outline-none focus:border-[#A01D26]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#D9D9D9]/80 mb-1">
                  Correct Post Office
                </label>
                <input
                  type="text"
                  value={suggestedPo}
                  onChange={(e) => setSuggestedPo(e.target.value)}
                  placeholder="e.g. Koramangala SO"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#141415] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#D9D9D9]/40 focus:outline-none focus:border-[#A01D26]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#D9D9D9]/80 mb-1">
                Correction Details / Reason
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Explain why this prediction was inaccurate or specify missing landmark/locality..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#141415] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#D9D9D9]/40 focus:outline-none focus:border-[#A01D26] resize-none"
              />
            </div>

            {error && (
              <div className="text-xs text-[#A01D26] flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </div>
            )}

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-hitit-secondary h-10 px-5 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-hitit-primary h-10 px-6 text-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Report'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
