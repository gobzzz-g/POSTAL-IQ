import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, Database, Cpu, CheckCircle } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-100 dark:bg-[#1B1C1D] text-slate-600 dark:text-[#D9D9D9] text-sm border-t border-slate-200 dark:border-white/10 mt-auto font-['Urbanist'] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Purpose */}
          <div className="md:col-span-1 space-y-3.5">
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                POSTAL<span className="text-[#A01D26]">IQ</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#D9D9D9]/80 leading-relaxed">
              Intelligent Indian PIN Code & Post Office Identification Platform. Interpreting ambiguous, abbreviated, and noisy addresses with transparent, explainable machine learning.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-white font-medium pt-1">
              <CheckCircle className="w-4 h-4 text-[#A01D26]" />
              <span>Production-Grade Intelligence</span>
            </div>
          </div>

          {/* Data Provenance & Authoritative Sources */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-[#A01D26]" />
              Dataset Provenance
            </h4>
            <p className="text-xs text-slate-500 dark:text-[#D9D9D9]/80 leading-relaxed">
              Sourced from Open Government Data (OGD) Platform India (<code className="text-slate-800 dark:text-white/90 bg-slate-200/60 dark:bg-white/5 px-1 py-0.5 rounded">data.gov.in</code>) and Department of Posts, Ministry of Communications.
            </p>
            <p className="text-[11px] text-slate-400 dark:text-[#D9D9D9]/60 leading-relaxed">
              License: National Data Sharing & Accessibility Policy (NDSAP). Coordinates verified strictly via official centroids.
            </p>
          </div>

          {/* Machine Learning Pipeline */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-[#A01D26]" />
              Architecture & ML
            </h4>
            <ul className="text-xs space-y-1.5 text-slate-500 dark:text-[#D9D9D9]/80">
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#A01D26]" />Unicode NFKD & Abbreviation Normalization</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#A01D26]" />Gazetteer Entity Extraction & Bounds</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#A01D26]" />Char N-Gram TF-IDF Vector Retrieval</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#A01D26]" />Calibrated Logistic Regression Ranker</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#A01D26]" />Explainable Evidence & Contradiction Safeguard</li>
            </ul>
          </div>

          {/* Quick Links & Compliance */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#A01D26]" />
              Privacy & Controls
            </h4>
            <p className="text-xs text-slate-500 dark:text-[#D9D9D9]/80 leading-relaxed">
              Zero storage of unredacted personal telephone numbers or emails in server logs. Anonymous browser sessions isolate individual search history.
            </p>
            <div className="pt-2 flex flex-wrap gap-3 text-xs">
              <Link to="/admin" className="text-slate-800 dark:text-white hover:text-[#A01D26] dark:hover:text-[#A01D26] transition-colors font-semibold">
                Admin Console →
              </Link>
              <Link to="/bulk" className="text-slate-600 dark:text-[#D9D9D9] hover:text-slate-900 dark:hover:text-white transition-colors">
                CSV Validation
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-[#D9D9D9]/60">
          <p>© {new Date().getFullYear()} POSTALIQ. Built for high-reliability postal intelligence across all Indian circles.</p>
          <p className="mt-2 sm:mt-0">Version 1.0.0 • Python 3.12 FastAPI • Scikit-learn • React Vite</p>
        </div>
      </div>
    </footer>
  )
}
