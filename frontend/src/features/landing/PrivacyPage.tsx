import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export const PrivacyPage: React.FC = () => {
  return (
    <div className="w-full bg-slate-50 dark:bg-[#18191B] text-slate-900 dark:text-white font-['Urbanist'] py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="space-y-4">
          <div className="text-xs uppercase font-bold tracking-widest text-[#A01D26]">Data Governance</div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight transition-colors">
            Privacy & Session Confidentiality
          </h1>
          <p className="text-base text-slate-600 dark:text-[#D9D9D9]/80 leading-relaxed transition-colors">
            POSTALIQ is designed with privacy-first data handling principles for logistics operators and citizens.
          </p>
        </div>

        <div className="space-y-6 text-xs sm:text-sm text-slate-600 dark:text-[#D9D9D9]/80 leading-relaxed border-t border-slate-200 dark:border-white/10 pt-8 transition-colors">
          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white transition-colors">No PII Retention</h2>
            <p>
              When addresses are submitted for PIN code resolution, contact identifiers (phone numbers, email addresses, personal names)
              are actively stripped during stage 1 preprocessing before candidate retrieval is executed.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white transition-colors">Session Isolation</h2>
            <p>
              Query history records are scoped strictly to individual browser sessions using pseudorandom cryptographic tokens.
              Queries executed in one browser session are completely inaccessible to other users.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white transition-colors">Administrative Boundary</h2>
            <p>
              Administrative analytics aggregate high-level match distributions and latency benchmarks.
              Administrator credentials are encrypted and authenticated via server-enforced JWT bearer tokens.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex items-center justify-between transition-colors">
          <Link to="/" className="text-xs font-semibold text-slate-600 dark:text-[#D9D9D9] hover:text-slate-900 dark:hover:text-white transition-colors">
            ← Return to Homepage
          </Link>
          <Link
            to="/app/predict"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A01D26] hover:underline"
          >
            <span>Open Address Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPage
