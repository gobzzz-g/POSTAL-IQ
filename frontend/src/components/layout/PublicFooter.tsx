import React from 'react'
import { Link } from 'react-router-dom'
import { Layers, ShieldCheck } from 'lucide-react'

export const PublicFooter: React.FC = () => {
  return (
    <footer className="w-full bg-slate-100 dark:bg-[#141517] border-t border-slate-200 dark:border-white/10 text-slate-600 dark:text-[#D9D9D9] font-['Urbanist'] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand Info (Span 2) */}
          <div className="md:col-span-2 space-y-5">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#A01D26] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white transition-colors">
                POSTAL<span className="text-[#A01D26]">IQ</span>
              </span>
            </Link>
            <p className="text-sm text-slate-600 dark:text-[#D9D9D9]/70 leading-relaxed max-w-sm transition-colors">
              Intelligent Indian PIN Code & Post Office Identification Platform.
              Resolving noisy, misspelled, and incomplete delivery addresses using machine learning
              and official gazetteer benchmarks.
            </p>
            <div className="text-xs text-slate-400 dark:text-[#D9D9D9]/50 font-mono">
              Tagline: Every address understood. Every postal match explained.
            </div>
          </div>

          {/* Platform Columns */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white transition-colors">Postal Intelligence</h4>
            <ul className="space-y-2.5 text-xs font-medium text-slate-600 dark:text-[#D9D9D9]/70">
              <li>
                <Link to="/app/predict" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Predict & Match
                </Link>
              </li>
              <li>
                <Link to="/app/directory" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Postal Directory
                </Link>
              </li>
              <li>
                <Link to="/app/map" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Interactive Postal Map
                </Link>
              </li>
              <li>
                <Link to="/app/bulk-validation" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Bulk CSV Validation
                </Link>
              </li>
              <li>
                <Link to="/app/history" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Query Audit History
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Methodology */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white transition-colors">Architecture</h4>
            <ul className="space-y-2.5 text-xs font-medium text-slate-600 dark:text-[#D9D9D9]/70">
              <li>
                <Link to="/features" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Platform Capabilities
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  About India Post ML
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Privacy & Data Governance
                </Link>
              </li>
            </ul>
          </div>

          {/* Authentication & Portal Access */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white transition-colors">Access Portals</h4>
            <ul className="space-y-2.5 text-xs font-medium text-slate-600 dark:text-[#D9D9D9]/70">
              <li>
                <Link to="/login" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  User Sign In
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/login"
                  className="flex items-center gap-1.5 text-slate-500 dark:text-[#D9D9D9]/60 hover:text-slate-900 dark:hover:text-white transition-colors pt-2"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#A01D26]" />
                  <span>Admin Workspace Login</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-[#D9D9D9]/50 transition-colors">
          <div>
            © 2026 POSTALIQ. Postal Intelligence Engine. India Post Gazette 2024.
          </div>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <span className="font-mono text-[11px]">Strict Geographic Verification</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default PublicFooter
