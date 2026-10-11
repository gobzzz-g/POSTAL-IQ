import React from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import {
  Compass,
  Search,
  MapPin,
  UploadCloud,
  History,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Scale
} from 'lucide-react'
import { getUserSession } from '@/services/api'
import {
  heroItem,
  staggerContainer,
  fadeInScaleUp,
  sectionReveal,
  premiumEase
} from '@/components/animation/motionVariants'

export const LandingPage: React.FC = () => {
  const user = getUserSession()
  const appPath = (path: string) => user ? path : '/login'
  const shouldReduceMotion = useReducedMotion()

  const scrollToFeatures = () => {
    const el = document.getElementById('capabilities')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Animation configuration based on user accessibility preferences
  const containerVariants = shouldReduceMotion ? undefined : staggerContainer(0.09, 0.04)
  const itemVariants = shouldReduceMotion ? undefined : heroItem
  const cardVariants = shouldReduceMotion ? undefined : fadeInScaleUp
  const sectionVariants = shouldReduceMotion ? undefined : sectionReveal

  return (
    <div className="w-full bg-slate-50 dark:bg-[#18191B] text-slate-900 dark:text-white font-['Urbanist'] selection:bg-[#A01D26] selection:text-white transition-colors duration-200">
      {/* ======================================================== */}
      {/* 1. CINEMATIC HERO VIEWPORT (Hitit Reference Composition) */}
      {/* ======================================================== */}
      <section className="relative min-h-[calc(100vh-5rem)] flex flex-col justify-between items-center text-center px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-12 overflow-hidden">
        {/* Hitit-Style Atmospheric Gradient Aurora (Warm Amber, Burgundy, Olive Grey) */}
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[460px] pointer-events-none -z-10 opacity-30 dark:opacity-70 transition-opacity"
          initial={shouldReduceMotion ? { opacity: 0.7 } : { opacity: 0, scale: 0.96 }}
          animate={shouldReduceMotion ? { opacity: 0.7 } : { opacity: 0.7, scale: 1 }}
          transition={{ duration: 1.2, ease: premiumEase }}
        >
          <div className="absolute top-[-80px] left-[15%] w-[420px] h-[360px] rounded-full bg-amber-600/20 dark:bg-amber-700/20 blur-[120px]" />
          <div className="absolute top-[-100px] left-[45%] -translate-x-1/2 w-[520px] h-[400px] rounded-full bg-[#A01D26]/20 dark:bg-[#A01D26]/30 blur-[130px]" />
          <div className="absolute top-[-70px] right-[15%] w-[440px] h-[360px] rounded-full bg-emerald-700/15 dark:bg-emerald-900/25 blur-[120px]" />
        </motion.div>

        {/* Hero Content Container with Staggered Entrance */}
        <motion.div
          className="max-w-5xl mx-auto flex flex-col items-center space-y-8 my-auto"
          variants={containerVariants}
          initial={shouldReduceMotion ? undefined : "hidden"}
          animate={shouldReduceMotion ? undefined : "visible"}
        >
          {/* Subtle Top Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-200/80 dark:bg-white/5 border border-slate-300 dark:border-white/15 text-slate-700 dark:text-[#D9D9D9] text-xs font-semibold backdrop-blur-md transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-[#A01D26] animate-pulse" />
            <span>India Post ML Benchmark 2024 • Gazette Intelligence Engine</span>
          </motion.div>

          {/* Large Confident Editorial Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-7xl lg:text-[88px] font-extrabold tracking-tight leading-[1.05] text-slate-900 dark:text-white transition-colors"
          >
            Every address.<br />
            <span className="text-[#A01D26]">One intelligent match.</span>
          </motion.h1>

          {/* Demonstrable statistics / capabilities row */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 pt-2 pb-1 text-sm"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white transition-colors">6</span>
              <span className="text-xs text-slate-600 dark:text-[#D9D9D9]/80 font-semibold text-left leading-tight transition-colors">
                Digit PIN<br />Resolution
              </span>
            </div>
            <div className="hidden sm:block h-8 w-px bg-slate-300 dark:bg-white/20 transition-colors" />
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white transition-colors">100%</span>
              <span className="text-xs text-slate-600 dark:text-[#D9D9D9]/80 font-semibold text-left leading-tight transition-colors">
                Explainable<br />Evidence
              </span>
            </div>
            <div className="hidden sm:block h-8 w-px bg-slate-300 dark:bg-white/20 transition-colors" />
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white transition-colors">0</span>
              <span className="text-xs text-slate-600 dark:text-[#D9D9D9]/80 font-semibold text-left leading-tight transition-colors">
                Hallucinated<br />Records
              </span>
            </div>
          </motion.div>

          {/* Concise Product Description */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-xl text-slate-600 dark:text-[#D9D9D9]/90 max-w-2xl font-normal leading-relaxed pt-1 transition-colors"
          >
            Identify Indian PIN codes and delivery post offices from incomplete, abbreviated,
            or misspelled addresses—with transparent matching evidence.
          </motion.p>

          {/* Primary Action Button (Hitit Red Pill) & Secondary Link */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pt-4"
          >
            <Link
              to={appPath('/app/predict')}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-bold tracking-[0.5px] text-white bg-[#A01D26] hover:bg-[#85161E] shadow-xl shadow-[#A01D26]/30 hover:shadow-2xl hover:shadow-[#A01D26]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              <span>Identify PIN Code</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={scrollToFeatures}
              className="text-sm font-semibold text-slate-600 dark:text-[#D9D9D9] hover:text-slate-900 dark:hover:text-white px-4 py-3 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Explore the platform</span>
              <span className="text-[#A01D26]">↓</span>
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll to Discover Indicator (Bottom of Hero) */}
        <motion.div
          className="pt-10 flex flex-col items-center"
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <button
            onClick={scrollToFeatures}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-[#D9D9D9]/60 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer group"
          >
            <span>Scroll to Discover</span>
            <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </motion.div>
      </section>

      {/* ======================================================== */}
      {/* 2. SECTION 1: PRODUCT INTRODUCTION (Two-Column Layout)    */}
      {/* ======================================================== */}
      <motion.section
        id="introduction"
        className="py-24 sm:py-32 border-t border-slate-200 dark:border-white/10 relative transition-colors"
        initial={shouldReduceMotion ? undefined : "hidden"}
        whileInView={shouldReduceMotion ? undefined : "visible"}
        viewport={{ once: true, amount: 0.15 }}
        variants={sectionVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left: Editorial Narrative */}
            <div className="lg:col-span-6 space-y-6">
              <div className="text-xs uppercase font-bold tracking-widest text-[#A01D26]">
                Real-World Postal Intelligence
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight transition-colors">
                Postal intelligence, built for real-world addresses.
              </h2>
              <p className="text-base text-slate-600 dark:text-[#D9D9D9]/80 leading-relaxed transition-colors">
                Indian addresses rarely follow rigid Western conventions. Deliveries rely on colloquial
                landmarks, localized abbreviations like <em>B/H</em> (behind) and <em>Opp</em> (opposite),
                phonetic Hindi or regional spellings, and multi-tier municipal wards.
              </p>

              {/* Capability Checklist */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#A01D26] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white transition-colors">Incomplete & Abbreviated Addresses</h4>
                    <p className="text-xs text-slate-600 dark:text-[#D9D9D9]/70 mt-0.5 transition-colors">Expands acronyms (CP → Connaught Place, BKC → Bandra Kurla Complex, OMR → Old Mahabalipuram Road).</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#A01D26] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white transition-colors">Spelling Variations & Typos</h4>
                    <p className="text-xs text-slate-600 dark:text-[#D9D9D9]/70 mt-0.5 transition-colors">Phonetic token matching corrects typos (Kormangla → Koramangala, Gandhipurm → Gandhipuram).</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#A01D26] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white transition-colors">Strict Geographic Consistency</h4>
                    <p className="text-xs text-slate-600 dark:text-[#D9D9D9]/70 mt-0.5 transition-colors">Prevents cross-district or wrong-state hallucinations (Coimbatore addresses never return Chennai nodes).</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Interactive Pipeline Diagram Card */}
            <motion.div
              className="lg:col-span-6 bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/15 rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-2xl relative transition-colors"
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 16 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, ease: premiumEase, delay: 0.15 }}
            >
              <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-[#A01D26]" />
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-600 dark:text-[#D9D9D9]">Pipeline Trace • Live Example</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60 font-semibold">
                  99.0% Confidence
                </span>
              </div>

              <div className="space-y-4 pt-6 text-xs">
                {/* Step 1: Raw Query */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1 transition-colors">
                  <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-[#D9D9D9]/50 tracking-wider">Raw Input Address</div>
                  <div className="text-sm text-slate-900 dark:text-white font-mono">"Gandhipurm, Coimbatore, Tamil Nadu"</div>
                </div>

                {/* Step 2: Entity Extraction */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1.5 transition-colors">
                  <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-[#D9D9D9]/50 tracking-wider">Entity Resolution & Gazette Matching</div>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-slate-200/80 dark:bg-white/10 text-slate-800 dark:text-white font-mono">Locality: Gandhipuram</span>
                    <span className="px-2 py-0.5 rounded bg-slate-200/80 dark:bg-white/10 text-slate-800 dark:text-white font-mono">District: Coimbatore</span>
                    <span className="px-2 py-0.5 rounded bg-slate-200/80 dark:bg-white/10 text-slate-800 dark:text-white font-mono">State: Tamil Nadu</span>
                  </div>
                </div>

                {/* Step 3: Verified Match */}
                <div className="p-4 rounded-xl bg-[#A01D26]/5 dark:bg-[#A01D26]/10 border border-[#A01D26]/20 dark:border-[#A01D26]/30 space-y-2 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Recommended Primary Match</span>
                    <span className="text-sm font-extrabold text-[#A01D26] font-mono">PIN: 641012</span>
                  </div>
                  <div className="text-sm text-slate-900 dark:text-white font-semibold">Gandhipuram Sub Post Office</div>
                  <div className="text-[11px] text-slate-600 dark:text-[#D9D9D9]/70 flex items-center gap-3">
                    <span>Delivery Office</span>
                    <span>•</span>
                    <span>Coimbatore, Tamil Nadu</span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Verified Centroid GPS</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ======================================================== */}
      {/* 3. SECTION 2: HOW IT WORKS (3-Stage Editorial Process)   */}
      {/* ======================================================== */}
      <section id="how-it-works" className="py-24 sm:py-32 border-t border-slate-200 dark:border-white/10 bg-slate-100/70 dark:bg-[#161719] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-16 space-y-3"
            initial={shouldReduceMotion ? undefined : "hidden"}
            whileInView={shouldReduceMotion ? undefined : "visible"}
            viewport={{ once: true, amount: 0.15 }}
            variants={sectionVariants}
          >
            <div className="text-xs uppercase font-bold tracking-widest text-[#A01D26]">Resolution Architecture</div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white transition-colors">
              Three stages from text to verified PIN.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-[#D9D9D9]/80 transition-colors">
              Deterministic gazetteer filtering combined with machine-learning candidate scoring.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
            variants={containerVariants}
            initial={shouldReduceMotion ? undefined : "hidden"}
            whileInView={shouldReduceMotion ? undefined : "visible"}
            viewport={{ once: true, amount: 0.15 }}
          >
            {/* Stage 1 */}
            <motion.div
              variants={cardVariants}
              className="bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/15 rounded-3xl p-8 space-y-4 hover:border-[#A01D26]/40 transition-colors shadow-sm dark:shadow-none"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white flex items-center justify-center font-extrabold text-lg font-mono">
                01
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">Enter an Address</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#D9D9D9]/70 leading-relaxed transition-colors">
                Paste any unstructured Indian delivery string. The pipeline strips noise (phones, emails, redundant punctuation) and standardizes abbreviations.
              </p>
              <div className="text-[11px] font-mono text-slate-400 dark:text-[#D9D9D9]/50 pt-2 border-t border-slate-200 dark:border-white/10">
                Unicode NFKD • Abbreviation Normalizer
              </div>
            </motion.div>

            {/* Stage 2 */}
            <motion.div
              variants={cardVariants}
              className="bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/15 rounded-3xl p-8 space-y-4 hover:border-[#A01D26]/40 transition-colors shadow-sm dark:shadow-none"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#A01D26]/10 dark:bg-[#A01D26]/20 border border-[#A01D26]/30 dark:border-[#A01D26]/40 text-[#A01D26] flex items-center justify-center font-extrabold text-lg font-mono">
                02
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">Retrieve & Rank Candidates</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#D9D9D9]/70 leading-relaxed transition-colors">
                Extracts entities via gazetteer patterns, queries TF-IDF indexes, and ranks candidates with hard state & district consistency constraints.
              </p>
              <div className="text-[11px] font-mono text-slate-400 dark:text-[#D9D9D9]/50 pt-2 border-t border-slate-200 dark:border-white/10">
                TF-IDF Retrieval • Strict District Guard
              </div>
            </motion.div>

            {/* Stage 3 */}
            <motion.div
              variants={cardVariants}
              className="bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/15 rounded-3xl p-8 space-y-4 hover:border-[#A01D26]/40 transition-colors shadow-sm dark:shadow-none"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white flex items-center justify-center font-extrabold text-lg font-mono">
                03
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">Review Evidence & Coordinates</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#D9D9D9]/70 leading-relaxed transition-colors">
                Examine calibrated probability scores, office types, delivery statuses, GPS coordinates, and clear explanations for why the match was selected.
              </p>
              <div className="text-[11px] font-mono text-slate-400 dark:text-[#D9D9D9]/50 pt-2 border-t border-slate-200 dark:border-white/10">
                Calibrated Confidence • Verified Centroids
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. SECTION 3: CORE CAPABILITIES (Live Feature Grid)      */}
      {/* ======================================================== */}
      <section id="capabilities" className="py-24 sm:py-32 border-t border-slate-200 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-16 space-y-3"
            initial={shouldReduceMotion ? undefined : "hidden"}
            whileInView={shouldReduceMotion ? undefined : "visible"}
            viewport={{ once: true, amount: 0.15 }}
            variants={sectionVariants}
          >
            <div className="text-xs uppercase font-bold tracking-widest text-[#A01D26]">Enterprise Capabilities</div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white transition-colors">
              Every tool designed for postal accuracy.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-[#D9D9D9]/80 transition-colors">
              Seamlessly explore India Post records individually or at industrial volume.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
            variants={containerVariants}
            initial={shouldReduceMotion ? undefined : "hidden"}
            whileInView={shouldReduceMotion ? undefined : "visible"}
            viewport={{ once: true, amount: 0.12 }}
          >
            {/* Capability 1: Intelligent Prediction */}
            <motion.div variants={cardVariants}>
              <Link
                to={appPath('/app/predict')}
                className="group h-full bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/15 rounded-3xl p-7 flex flex-col justify-between hover:border-[#A01D26] hover:-translate-y-1.5 transition-all shadow-sm dark:shadow-lg hover:shadow-xl hover:shadow-[#A01D26]/10"
              >
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-2xl bg-[#A01D26]/10 dark:bg-[#A01D26]/20 border border-[#A01D26]/30 dark:border-[#A01D26]/40 text-[#A01D26] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white transition-colors">Intelligent PIN Prediction</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-[#D9D9D9]/70 leading-relaxed transition-colors">
                    Natural language address resolution powered by multi-tier gazetteer candidate retrieval and calibrated ML ranking.
                  </p>
                </div>
                <div className="pt-6 flex items-center gap-2 text-xs font-bold text-[#A01D26]">
                  <span>Launch Tool</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>

            {/* Capability 2: Postal Directory */}
            <motion.div variants={cardVariants}>
              <Link
                to={appPath('/app/directory')}
                className="group h-full bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/15 rounded-3xl p-7 flex flex-col justify-between hover:border-[#A01D26] hover:-translate-y-1.5 transition-all shadow-sm dark:shadow-lg hover:shadow-xl hover:shadow-[#A01D26]/10"
              >
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/15 text-slate-700 dark:text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Search className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white transition-colors">Postal Directory Search</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-[#D9D9D9]/70 leading-relaxed transition-colors">
                    Search across verified post offices with filters by state, district, delivery status, and office tier (Head, Sub, Branch).
                  </p>
                </div>
                <div className="pt-6 flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#A01D26] transition-colors">
                  <span>Browse Directory</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>

            {/* Capability 3: Interactive Map */}
            <motion.div variants={cardVariants}>
              <Link
                to={appPath('/app/map')}
                className="group h-full bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/15 rounded-3xl p-7 flex flex-col justify-between hover:border-[#A01D26] hover:-translate-y-1.5 transition-all shadow-sm dark:shadow-lg hover:shadow-xl hover:shadow-[#A01D26]/10"
              >
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/15 text-slate-700 dark:text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white transition-colors">Interactive Postal Map</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-[#D9D9D9]/70 leading-relaxed transition-colors">
                    Visual geographic exploration with synchronized list-to-marker spatial navigation across India Post coordinates.
                  </p>
                </div>
                <div className="pt-6 flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#A01D26] transition-colors">
                  <span>View Map</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>

            {/* Capability 4: Bulk Validation */}
            <motion.div variants={cardVariants}>
              <Link
                to={appPath('/app/bulk-validation')}
                className="group h-full bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/15 rounded-3xl p-7 flex flex-col justify-between hover:border-[#A01D26] hover:-translate-y-1.5 transition-all shadow-sm dark:shadow-lg hover:shadow-xl hover:shadow-[#A01D26]/10"
              >
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/15 text-slate-700 dark:text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white transition-colors">Bulk CSV Address Validation</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-[#D9D9D9]/70 leading-relaxed transition-colors">
                    Validate large logistics datasets. Automatically flag geographic conflicts, ambiguous rows, and download enriched CSVs.
                  </p>
                </div>
                <div className="pt-6 flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#A01D26] transition-colors">
                  <span>Validate CSV</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>

            {/* Capability 5: Search History */}
            <motion.div variants={cardVariants}>
              <Link
                to={appPath('/app/history')}
                className="group h-full bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/15 rounded-3xl p-7 flex flex-col justify-between hover:border-[#A01D26] hover:-translate-y-1.5 transition-all shadow-sm dark:shadow-lg hover:shadow-xl hover:shadow-[#A01D26]/10"
              >
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/15 text-slate-700 dark:text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                    <History className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white transition-colors">Private Query History</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-[#D9D9D9]/70 leading-relaxed transition-colors">
                    Audit logs with session-isolated confidentiality. Review previous predictions, confidence rates, and match diagnostics.
                  </p>
                </div>
                <div className="pt-6 flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#A01D26] transition-colors">
                  <span>Review History</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>

            {/* Capability 6: Explainable Matching */}
            <motion.div variants={cardVariants}>
              <div className="h-full bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/15 rounded-3xl p-7 flex flex-col justify-between shadow-sm dark:shadow-none transition-colors">
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/15 text-slate-700 dark:text-white flex items-center justify-center">
                    <Scale className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white transition-colors">Explainable Evidence Trace</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-[#D9D9D9]/70 leading-relaxed transition-colors">
                    Every match exposes its decision path: locality scores, district agreements, state checks, and typo corrections.
                  </p>
                </div>
                <div className="pt-6 flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-[#D9D9D9]/60">
                  <span>Transparent Scoring</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. SECTION 4: CONFIDENCE & TRUST (Handling Uncertainty)   */}
      {/* ======================================================== */}
      <section id="trust" className="py-24 sm:py-32 border-t border-slate-200 dark:border-white/10 bg-slate-100/70 dark:bg-[#161719] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <motion.div
              className="lg:col-span-5 space-y-5"
              initial={shouldReduceMotion ? undefined : "hidden"}
              whileInView={shouldReduceMotion ? undefined : "visible"}
              viewport={{ once: true, amount: 0.15 }}
              variants={sectionVariants}
            >
              <div className="text-xs uppercase font-bold tracking-widest text-[#A01D26]">Zero Hallucination Policy</div>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight transition-colors">
                Designed to communicate uncertainty.
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-[#D9D9D9]/80 leading-relaxed transition-colors">
                In logistics and governance, a falsely confident wrong PIN code is far more destructive than asking for clarification.
                POSTALIQ explicitly refuses to invent records when evidence is insufficient.
              </p>
            </motion.div>

            <motion.div
              className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4"
              variants={containerVariants}
              initial={shouldReduceMotion ? undefined : "hidden"}
              whileInView={shouldReduceMotion ? undefined : "visible"}
              viewport={{ once: true, amount: 0.15 }}
            >
              <motion.div
                variants={cardVariants}
                className="p-6 rounded-2xl bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/15 space-y-2 hover:border-emerald-400/40 transition-colors shadow-sm dark:shadow-none"
              >
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">Matched (≥85%)</span>
                <p className="text-xs text-slate-600 dark:text-[#D9D9D9]/70 transition-colors">Exact locality match and unambiguous district agreement. Clean, automated acceptance.</p>
              </motion.div>
              <motion.div
                variants={cardVariants}
                className="p-6 rounded-2xl bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/15 space-y-2 hover:border-amber-400/40 transition-colors shadow-sm dark:shadow-none"
              >
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">Ambiguous (30–84%)</span>
                <p className="text-xs text-slate-600 dark:text-[#D9D9D9]/70 transition-colors">Multiple close delivery offices in the same district. Flags human review and suggests structured clarification.</p>
              </motion.div>
              <motion.div
                variants={cardVariants}
                className="p-6 rounded-2xl bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/15 space-y-2 hover:border-[#A01D26]/40 transition-colors shadow-sm dark:shadow-none"
              >
                <span className="text-xs font-bold text-[#A01D26] font-mono">Geographic Conflict</span>
                <p className="text-xs text-slate-600 dark:text-[#D9D9D9]/70 transition-colors">Identifies contradictory inputs (e.g. Darya Ganj with Patna, Bihar). Rejects hallucinated matches.</p>
              </motion.div>
              <motion.div
                variants={cardVariants}
                className="p-6 rounded-2xl bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/15 space-y-2 hover:border-slate-400/40 transition-colors shadow-sm dark:shadow-none"
              >
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 font-mono">Safe Unmatched Refusal</span>
                <p className="text-xs text-slate-600 dark:text-[#D9D9D9]/70 transition-colors">When an address is fictional or unknown, scores drop safely to 0.0% without matching random cities.</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. SECTION 5: CLOSING CALL TO ACTION                     */}
      {/* ======================================================== */}
      <motion.section
        className="py-24 sm:py-32 border-t border-slate-200 dark:border-white/10 text-center relative overflow-hidden transition-colors"
        initial={shouldReduceMotion ? undefined : "hidden"}
        whileInView={shouldReduceMotion ? undefined : "visible"}
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight transition-colors">
            Find the right postal match.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-[#D9D9D9]/80 max-w-xl mx-auto transition-colors">
            Start with an address. Discover the most relevant postal records.
          </p>
          <div className="pt-4">
            <Link
              to={appPath('/app/predict')}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold tracking-[0.5px] text-white bg-[#A01D26] hover:bg-[#85161E] shadow-xl shadow-[#A01D26]/30 hover:shadow-2xl hover:shadow-[#A01D26]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              <span>Start Identifying</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  )
}

export default LandingPage
