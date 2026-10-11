import React from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { staggerContainer, fadeInScaleUp } from '@/components/animation/motionVariants'

export const HowItWorksPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="w-full bg-slate-50 dark:bg-[#18191B] text-slate-900 dark:text-white font-['Urbanist'] py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <motion.div
        className="max-w-4xl mx-auto space-y-12"
        variants={shouldReduceMotion ? undefined : staggerContainer(0.08, 0.04)}
        initial={shouldReduceMotion ? undefined : "hidden"}
        animate={shouldReduceMotion ? undefined : "visible"}
      >
        <motion.div
          variants={shouldReduceMotion ? undefined : fadeInScaleUp}
          className="space-y-4"
        >
          <div className="text-xs uppercase font-bold tracking-widest text-[#A01D26]">Pipeline Architecture</div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight transition-colors">
            How POSTALIQ resolves Indian postal addresses.
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-[#D9D9D9]/80 leading-relaxed transition-colors">
            A step-by-step trace of how raw address input is preprocessed, entity-extracted,
            matched against gazetteers, and calibrated for delivery routing.
          </p>
        </motion.div>

        <motion.div
          variants={shouldReduceMotion ? undefined : staggerContainer(0.09, 0.04)}
          className="space-y-10 border-t border-slate-200 dark:border-white/10 pt-10 transition-colors"
        >
          <motion.div variants={shouldReduceMotion ? undefined : fadeInScaleUp} className="flex gap-6 items-start">
            <div className="w-10 h-10 rounded-full bg-[#A01D26] text-white flex items-center justify-center font-bold text-sm shrink-0">
              1
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">Preprocessing & Unicode Normalization</h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#D9D9D9]/70 leading-relaxed transition-colors">
                Applies Unicode NFKD decomposition, strips extraneous contact metadata (phone numbers, emails),
                lowercases text, and expands Indian address abbreviations (e.g. "Main Rd" → "main road", "PO" → "post office").
              </p>
            </div>
          </motion.div>

          <motion.div variants={shouldReduceMotion ? undefined : fadeInScaleUp} className="flex gap-6 items-start">
            <div className="w-10 h-10 rounded-full bg-[#A01D26] text-white flex items-center justify-center font-bold text-sm shrink-0">
              2
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">Multi-Tier Entity Extraction</h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#D9D9D9]/70 leading-relaxed transition-colors">
                Extracts 6-digit PIN codes, matches standard Indian states and multi-word districts
                (e.g. "Central Delhi", "East Delhi", "Bengaluru Urban"), resolves cities, and extracts landmark indicators.
              </p>
            </div>
          </motion.div>

          <motion.div variants={shouldReduceMotion ? undefined : fadeInScaleUp} className="flex gap-6 items-start">
            <div className="w-10 h-10 rounded-full bg-[#A01D26] text-white flex items-center justify-center font-bold text-sm shrink-0">
              3
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">Candidate Retrieval & Strict Geographic Filtering</h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#D9D9D9]/70 leading-relaxed transition-colors">
                Retrieves candidates across exact PIN matches, locality aliases, and TF-IDF vectors.
                Enforces strict state and district consistency so contradictory locations are eliminated.
              </p>
            </div>
          </motion.div>

          <motion.div variants={shouldReduceMotion ? undefined : fadeInScaleUp} className="flex gap-6 items-start">
            <div className="w-10 h-10 rounded-full bg-[#A01D26] text-white flex items-center justify-center font-bold text-sm shrink-0">
              4
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">Calibrated Scoring & Refusal Guardrails</h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#D9D9D9]/70 leading-relaxed transition-colors">
                Calculates calibrated probability scores based on locality overlap, administrative agreement, and spelling distance.
                If confidence falls below the acceptance threshold, the match is safely refused.
              </p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          variants={shouldReduceMotion ? undefined : fadeInScaleUp}
          className="pt-6 border-t border-slate-200 dark:border-white/10 flex items-center justify-between transition-colors"
        >
          <Link
            to="/app/predict"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold tracking-wider text-white bg-[#A01D26] hover:bg-[#85161E] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          >
            <span>Try an Address</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link to="/" className="text-xs font-semibold text-slate-600 dark:text-[#D9D9D9] hover:text-slate-900 dark:hover:text-white transition-colors">
            ← Return to Homepage
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default HowItWorksPage
