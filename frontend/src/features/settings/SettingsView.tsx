import React, { useState, useEffect } from 'react'
import {
  Settings,
  Cpu,
  Database,
  Shield,
  Activity,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react'
import { api } from '@/services/api'

export const SettingsView: React.FC = () => {
  const [readiness, setReadiness] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkStatus = async () => {
    setLoading(true)
    try {
      const data = await api.getReadiness()
      setReadiness(data)
    } catch {
      setReadiness({ status: 'unreachable', database: 'failed' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-['Urbanist']">
      <div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          System Settings & Platform Architecture
        </h1>
        <p className="text-base text-slate-600 dark:text-[#D9D9D9] mt-2 max-w-2xl leading-relaxed">
          Diagnostics, model version tracking, and postal database configuration with transparent runtime telemetry.
        </p>
      </div>

      {/* Diagnostics Card */}
      <div className="bg-white dark:bg-[#1B1C1D] rounded-[30px] border border-slate-200 dark:border-white/20 p-6 sm:p-8 shadow-xl dark:shadow-2xl space-y-5 transition-colors">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#A01D26]" />
            Backend Intelligence Engine Health
          </h3>
          <button
            onClick={checkStatus}
            disabled={loading}
            className="p-2 rounded-full text-slate-500 dark:text-[#D9D9D9] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Refresh engine health"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#A01D26]' : ''}`} />
          </button>
        </div>

        {readiness && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#141415] border border-slate-200 dark:border-white/10">
              <span className="text-slate-500 dark:text-[#D9D9D9]/70 block text-[11px] font-bold uppercase tracking-wider">System Status</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 capitalize mt-1.5 block text-base">
                {readiness.status}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#141415] border border-slate-200 dark:border-white/10">
              <span className="text-slate-500 dark:text-[#D9D9D9]/70 block text-[11px] font-bold uppercase tracking-wider">Postal Database</span>
              <span className="font-extrabold text-slate-900 dark:text-white capitalize mt-1.5 block text-base">
                {readiness.database}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#141415] border border-slate-200 dark:border-white/10">
              <span className="text-slate-500 dark:text-[#D9D9D9]/70 block text-[11px] font-bold uppercase tracking-wider">TF-IDF Indexer</span>
              <span className="font-extrabold text-[#A01D26] mt-1.5 block text-base">
                {readiness.tfidf_indexer_fitted ? 'Fitted & Active' : 'Idle'}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#141415] border border-slate-200 dark:border-white/10">
              <span className="text-slate-500 dark:text-[#D9D9D9]/70 block text-[11px] font-bold uppercase tracking-wider">Indexed Documents</span>
              <span className="font-extrabold text-slate-900 dark:text-white mt-1.5 block text-base">
                {readiness.indexed_documents || 54} nodes
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Model & Dataset Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-[#1B1C1D] rounded-[30px] border border-slate-200 dark:border-white/20 p-6 sm:p-8 shadow-xl space-y-4 transition-colors">
          <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#A01D26]" />
            ML Ranker Configuration
          </h4>
          <ul className="text-xs space-y-2 text-slate-600 dark:text-[#D9D9D9] leading-relaxed">
            <li>• Model Architecture: <strong className="text-slate-900 dark:text-white">Hybrid Logistic Regression & Rule Guard</strong></li>
            <li>• Version Artifact: <code className="text-slate-800 dark:text-white font-mono bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded">ml-logistic-regression-v1.2</code></li>
            <li>• High Confidence Threshold: <strong className="text-slate-900 dark:text-white">85.0%</strong></li>
            <li>• Medium Confidence Threshold: <strong className="text-slate-900 dark:text-white">70.0%</strong></li>
            <li>• Hallucination Refusal Cutoff: <strong className="text-[#A01D26]">30.0%</strong> (prevents speculative PIN matches)</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-[#1B1C1D] rounded-[30px] border border-slate-200 dark:border-white/20 p-6 sm:p-8 shadow-xl space-y-4 transition-colors">
          <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-[#A01D26]" />
            Postal Gazette Provenance
          </h4>
          <ul className="text-xs space-y-2 text-slate-600 dark:text-[#D9D9D9] leading-relaxed">
            <li>• Dataset: <strong className="text-slate-900 dark:text-white">India Post All India PIN Directory</strong></li>
            <li>• Source Authority: <code className="text-slate-800 dark:text-white font-mono bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded">data.gov.in / OGD Platform</code></li>
            <li>• Governance License: <strong className="text-slate-900 dark:text-white">NDSAP Open Government Data License</strong></li>
            <li>• GPS Centroids: <strong className="text-slate-900 dark:text-white">Strict Verified Survey Centroids Only</strong></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
