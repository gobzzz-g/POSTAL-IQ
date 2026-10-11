import React, { useState } from 'react'
import { HelpCircle, CornerDownLeft } from 'lucide-react'
import { ClarificationQuestion, ClarificationOption } from '@/types'

interface ClarificationPromptProps {
  clarification: ClarificationQuestion
  onSubmitAnswer: (answer: string) => void
  isLoading?: boolean
}

export const ClarificationPrompt: React.FC<ClarificationPromptProps> = ({
  clarification,
  onSubmitAnswer,
  isLoading = false,
}) => {
  const [customAnswer, setCustomAnswer] = useState('')

  const handleSelectOption = (opt: ClarificationOption) => {
    onSubmitAnswer(opt.label)
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (customAnswer.trim()) {
      onSubmitAnswer(customAnswer.trim())
    }
  }

  return (
    <div className="bg-white dark:bg-[#1B1C1D] rounded-[30px] border border-slate-200 dark:border-white/20 p-6 sm:p-8 shadow-xl space-y-4 font-['Urbanist'] transition-colors">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-full bg-[#A01D26]/10 dark:bg-[#A01D26]/20 text-[#A01D26] border border-[#A01D26]/30 dark:border-[#A01D26]/40 flex items-center justify-center shrink-0 mt-0.5">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#A01D26]">
            Interactive Clarification Assistant
          </span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            {clarification.question}
          </h3>
          <p className="text-xs text-slate-600 dark:text-[#D9D9D9] mt-1">
            {clarification.reason}
          </p>
        </div>
      </div>

      {/* Clickable Quick Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
        {clarification.options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => handleSelectOption(opt)}
            disabled={isLoading}
            className="text-left p-4 rounded-2xl bg-slate-50 dark:bg-[#141415] border border-slate-200 dark:border-white/15 hover:border-slate-300 dark:hover:border-white/40 hover:bg-slate-100 dark:hover:bg-white/5 transition-all group cursor-pointer disabled:opacity-50"
          >
            <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-[#A01D26] dark:group-hover:text-white">
              {opt.label}
            </div>
            {opt.description && (
              <div className="text-[11px] text-slate-500 dark:text-[#D9D9D9]/70 mt-1">
                {opt.description}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Or free-text input */}
      <form onSubmit={handleCustomSubmit} className="pt-2 flex gap-2">
        <input
          type="text"
          value={customAnswer}
          onChange={(e) => setCustomAnswer(e.target.value)}
          placeholder="Or type specific district, village, or landmark..."
          className="flex-1 px-4 py-2.5 rounded-full text-xs bg-slate-50 dark:bg-[#141415] border border-slate-200 dark:border-white/20 focus:outline-none focus:border-[#A01D26] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#D9D9D9]/40"
        />
        <button
          type="submit"
          disabled={!customAnswer.trim() || isLoading}
          className="btn-hitit-primary h-10 px-5 text-xs"
        >
          <span>Submit</span>
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  )
}
