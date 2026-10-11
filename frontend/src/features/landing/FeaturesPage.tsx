import React from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { Compass, Search, MapPin, UploadCloud, ArrowRight } from 'lucide-react'
import { staggerContainer, fadeInScaleUp } from '@/components/animation/motionVariants'

export const FeaturesPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion()

  const containerVariants = shouldReduceMotion ? undefined : staggerContainer(0.08, 0.05)
  const cardVariants = shouldReduceMotion ? undefined : fadeInScaleUp

  return (
    <div className="w-full bg-slate-50 dark:bg-[#18191B] text-slate-900 dark:text-white font-['Urbanist'] py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-5xl mx-auto space-y-14">
        <motion.div
          className="space-y-4 text-center max-w-2xl mx-auto"
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 16 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="text-xs uppercase font-bold tracking-widest text-[#A01D26]">Capabilities Overview</div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight transition-colors">
            Comprehensive tools for postal intelligence.
          </h1>
          <p className="text-base text-slate-600 dark:text-[#D9D9D9]/80 transition-colors">
            From single-address lookup to bulk CSV validation, explore how POSTALIQ automates postal identification.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={containerVariants}
          initial={shouldReduceMotion ? undefined : "hidden"}
          animate={shouldReduceMotion ? undefined : "visible"}
        >
          <motion.div variants={cardVariants} className="p-8 rounded-3xl bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/15 space-y-4 hover:border-[#A01D26]/40 hover:-translate-y-1 shadow-sm dark:shadow-none transition-all">
            <Compass className="w-8 h-8 text-[#A01D26]" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">Address Resolution & PIN Prediction</h2>
            <p className="text-xs text-slate-600 dark:text-[#D9D9D9]/70 leading-relaxed transition-colors">
              Handles abbreviations (B/H, Opp, St, Rd), phonetic typos, and colloquial locality names.
              Ranks postal candidates with calibrated probability confidence.
            </p>
            <Link to="/app/predict" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A01D26] hover:underline pt-2">
              <span>Open Tool</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          <motion.div variants={cardVariants} className="p-8 rounded-3xl bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/15 space-y-4 hover:border-[#A01D26]/40 hover:-translate-y-1 shadow-sm dark:shadow-none transition-all">
            <Search className="w-8 h-8 text-[#A01D26]" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">Postal Gazetteer Directory</h2>
            <p className="text-xs text-slate-600 dark:text-[#D9D9D9]/70 leading-relaxed transition-colors">
              Search and filter across official India Post records with Circle, Division, District,
              and Delivery Office classifications.
            </p>
            <Link to="/app/directory" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A01D26] hover:underline pt-2">
              <span>Browse Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          <motion.div variants={cardVariants} className="p-8 rounded-3xl bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/15 space-y-4 hover:border-[#A01D26]/40 hover:-translate-y-1 shadow-sm dark:shadow-none transition-all">
            <MapPin className="w-8 h-8 text-[#A01D26]" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">Interactive Spatial Map</h2>
            <p className="text-xs text-slate-600 dark:text-[#D9D9D9]/70 leading-relaxed transition-colors">
              Interactive Leaflet mapping displaying post office centroids with delivery office markers
              and direct list-to-marker interaction.
            </p>
            <Link to="/app/map" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A01D26] hover:underline pt-2">
              <span>View Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          <motion.div variants={cardVariants} className="p-8 rounded-3xl bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/15 space-y-4 hover:border-[#A01D26]/40 hover:-translate-y-1 shadow-sm dark:shadow-none transition-all">
            <UploadCloud className="w-8 h-8 text-[#A01D26]" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">Bulk CSV Validation</h2>
            <p className="text-xs text-slate-600 dark:text-[#D9D9D9]/70 leading-relaxed transition-colors">
              Batch processing for thousands of logistics addresses. Generates review flags,
              alternative suggestions, and exportable CSVs with stable headers.
            </p>
            <Link to="/app/bulk-validation" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A01D26] hover:underline pt-2">
              <span>Upload CSV</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </motion.div>

        <div className="text-center pt-8 border-t border-slate-200 dark:border-white/10 transition-colors">
          <Link
            to="/app/predict"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-bold text-white bg-[#A01D26] hover:bg-[#85161E] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          >
            <span>Launch Postal Intelligence Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default FeaturesPage
