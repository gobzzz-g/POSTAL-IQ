import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  History,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Clock,
  RefreshCw,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import { api, getSessionId } from '@/services/api'
import { SearchHistoryItem } from '@/types'

export const HistoryView: React.FC = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<SearchHistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState('')

  const fetchHistory = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getSearchHistory()
      setItems(data)
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve search history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setSession(getSessionId())
    fetchHistory()
  }, [])

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear your local search history?')) return
    try {
      await api.clearSearchHistory()
      setItems([])
    } catch (err: any) {
      alert(err.message || 'Failed to clear history')
    }
  }

  const handleDeleteItem = async (id: number) => {
    try {
      await api.deleteHistoryItem(id)
      setItems((prev) => prev.filter((i) => i.id !== id))
    } catch (err: any) {
      alert(err.message || 'Failed to remove item')
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-['Urbanist']">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Search History
          </h1>
          <p className="text-base text-slate-600 dark:text-[#D9D9D9] mt-2 max-w-2xl leading-relaxed">
            Privacy-isolated record of queries executed in your current browser session ({session.substring(0, 14)}...).
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={handleClearAll}
            className="btn-hitit-secondary h-10 px-5 text-xs self-start sm:self-auto cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-[#A01D26]" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Privacy Notice Card */}
      <div className="p-5 rounded-[24px] bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/20 text-xs text-slate-600 dark:text-[#D9D9D9] flex items-start gap-3 shadow-sm dark:shadow-xl transition-colors">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-900 dark:text-white">Privacy-Isolated Architecture:</strong> POSTALIQ queries are tied exclusively to your anonymous local browser session key. Zero cross-user query exposure or global tracking identifiers are created.
        </div>
      </div>

      {loading && (
        <div className="py-16 text-center text-slate-400 dark:text-[#D9D9D9]/70">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#A01D26]" />
          <span className="text-xs">Loading search history...</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-[#A01D26]/10 dark:bg-[#A01D26]/15 border border-[#A01D26]/30 dark:border-[#A01D26]/40 text-[#A01D26] dark:text-white text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#A01D26]" />
          <span>{error}</span>
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="bg-white dark:bg-[#1B1C1D] rounded-[30px] border border-slate-200 dark:border-white/20 p-14 text-center space-y-3 shadow-sm dark:shadow-xl transition-colors">
          <Clock className="w-10 h-10 text-slate-400 dark:text-[#D9D9D9]/40 mx-auto" />
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">No Searches Logged Yet</h3>
          <p className="text-xs text-slate-500 dark:text-[#D9D9D9]/70 max-w-sm mx-auto">
            Address queries analyzed in the Predict & Match workspace will appear here for reference and audit.
          </p>
        </div>
      )}

      {/* History Items List */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/15 hover:border-[#A01D26]/40 hover:-translate-y-0.5 shadow-sm dark:shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-slate-400 dark:text-[#D9D9D9]/60 font-mono">
                  {item.created_at ? new Date(item.created_at).toLocaleString() : 'Recent'}
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    item.status === 'matched'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : item.status === 'ambiguous'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      : 'bg-[#A01D26]/10 dark:bg-[#A01D26]/20 text-[#A01D26] dark:text-white border-[#A01D26]/30 dark:border-[#A01D26]/50'
                  }`}
                >
                  {item.status}
                </span>
                {item.confidence > 0 && (
                  <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-[#D9D9D9]/80">
                    {item.confidence.toFixed(1)}% conf
                  </span>
                )}
              </div>

              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {item.query_text}
              </div>

              {item.predicted_pin && (
                <div className="text-xs text-slate-600 dark:text-[#D9D9D9] font-medium flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#A01D26]" />
                  <span className="font-mono font-bold text-[#A01D26]">PIN {item.predicted_pin}</span>
                  <span>({item.predicted_post_office})</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => handleDeleteItem(item.id)}
                className="p-2 rounded-full text-slate-400 dark:text-[#D9D9D9]/60 hover:text-[#A01D26] hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                title="Delete history entry"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
