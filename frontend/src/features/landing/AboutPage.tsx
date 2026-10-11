import React from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { staggerContainer, fadeInScaleUp } from '@/components/animation/motionVariants'

export const AboutPage: React.FC = () => {
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
          <div className="text-xs uppercase font-bold tracking-widest text-[#A01D26]">About POSTALIQ</div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight transition-colors">
            Built for the complexity of Indian postal geography.
          </h1>
          <p className="text-lg text-slate-600 dark:text-[#D9D9D9]/80 leading-relaxed transition-colors">
            POSTALIQ is a high-precision postal identification platform engineered to bridge the gap
            between how people write colloquial Indian addresses and how India Post routes delivery.
          </p>
        </motion.div>

        <motion.div
          variants={shouldReduceMotion ? undefined : fadeInScaleUp}
          className="space-y-8 text-sm text-slate-600 dark:text-[#D9D9D9]/80 leading-relaxed border-t border-slate-200 dark:border-white/10 pt-10 transition-colors"
        >
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">The India Post ML Mission</h2>
            <p>
              Unlike traditional geocoders that attempt global coordinate interpolation and frequently hallucinate wrong postal codes,
              POSTALIQ anchors every prediction strictly against verified India Post records. It combines deterministic gazetteer
              matching with machine learning ranking to achieve transparent, calibrated resolution.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/15 space-y-2 hover:border-[#A01D26]/40 shadow-sm dark:shadow-none transition-all">
              <h3 className="text-base font-bold text-slate-900 dark:text-white transition-colors">Zero-Fabrication Guarantee</h3>
              <p className="text-xs text-slate-600 dark:text-[#D9D9D9]/70 transition-colors">
                POSTALIQ will never invent an unverified PIN code or match an address across contradictory districts.
                If evidence is insufficient, it reports a safe unmatched status.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/15 space-y-2 hover:border-[#A01D26]/40 shadow-sm dark:shadow-none transition-all">
              <h3 className="text-base font-bold text-slate-900 dark:text-white transition-colors">Full Transparency</h3>
              <p className="text-xs text-slate-600 dark:text-[#D9D9D9]/70 transition-colors">
                Every prediction presents an evidence chain: token-level locality scores, district agreements,
                GPS centroids, and delivery statuses.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={shouldReduceMotion ? undefined : fadeInScaleUp}
          className="pt-6 border-t border-slate-200 dark:border-white/10 flex items-center justify-between transition-colors"
        >
          <Link
            to="/app/predict"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold tracking-wider text-white bg-[#A01D26] hover:bg-[#85161E] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          >
            <span>Launch Prediction Workspace</span>
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

export default AboutPage
