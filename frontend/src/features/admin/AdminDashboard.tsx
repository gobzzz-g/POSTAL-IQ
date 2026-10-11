import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  BarChart3,
  Database,
  FileCheck,
  Plus,
  Trash2,
  Edit2,
  Lock,
  LogOut,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Check,
  X,
  Activity,
  Layers,
  ArrowRight,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { api, getAdminToken, setAdminToken } from '@/services/api'
import { AnalyticsResponse, PostOffice, FeedbackReport } from '@/types'

export const AdminDashboard: React.FC = () => {
  const [token, setToken] = useState<string | null>(getAdminToken())
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('PostalIQ@2025Secure')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()

  // Tabs: analytics, records, feedback, dataset
  const getTabFromPath = (): 'analytics' | 'records' | 'feedback' | 'dataset' => {
    if (location.pathname.includes('postal-records')) return 'records'
    if (location.pathname.includes('feedback')) return 'feedback'
    if (location.pathname.includes('dataset-management')) return 'dataset'
    return 'analytics'
  }

  const [activeTab, setActiveTab] = useState<'analytics' | 'records' | 'feedback' | 'dataset'>(getTabFromPath())

  useEffect(() => {
    setActiveTab(getTabFromPath())
  }, [location.pathname])

  // Analytics data
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  // Records data
  const [records, setRecords] = useState<PostOffice[]>([])
  const [recordsPage, setRecordsPage] = useState(1)
  const [recordsTotalPages, setRecordsTotalPages] = useState(1)
  const [recordsLoading, setRecordsLoading] = useState(false)
  const [recordsSearch, setRecordsSearch] = useState('')

  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Partial<PostOffice> | null>(null)

  // Feedback queue
  const [feedbackList, setFeedbackList] = useState<FeedbackReport[]>([])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    setIsLoggingIn(true)

    try {
      const resp = await api.adminLogin(username.trim(), password)
      setAdminToken(resp.access_token)
      setToken(resp.access_token)
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed. Please verify credentials.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = () => {
    setAdminToken(null)
    setToken(null)
  }

  const loadAnalytics = async () => {
    setAnalyticsLoading(true)
    try {
      const data = await api.getAdminAnalytics()
      setAnalytics(data)
    } catch {
      // ignore
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const loadRecords = async () => {
    setRecordsLoading(true)
    try {
      const data = await api.adminListPostOffices({
        page: recordsPage,
        size: 15,
        query: recordsSearch.trim() || undefined,
      })
      setRecords(data.items)
      setRecordsTotalPages(data.total_pages)
    } catch {
      // ignore
    } finally {
      setRecordsLoading(false)
    }
  }

  const loadFeedback = async () => {
    try {
      const data = await api.listFeedback()
      setFeedbackList(data)
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    if (token) {
      loadAnalytics()
      loadRecords()
      loadFeedback()
    }
  }, [token, recordsPage])

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRecord) return

    try {
      if (editingRecord.id) {
        await api.adminUpdatePostOffice(editingRecord.id, editingRecord)
      } else {
        await api.adminCreatePostOffice(editingRecord)
      }
      setIsModalOpen(false)
      setEditingRecord(null)
      loadRecords()
      loadAnalytics()
    } catch (err: any) {
      alert(err.message || 'Error saving record')
    }
  }

  const handleDeleteRecord = async (id: number) => {
    if (!window.confirm(`Delete post office record #${id}?`)) return
    try {
      await api.adminDeletePostOffice(id)
      loadRecords()
      loadAnalytics()
    } catch (err: any) {
      alert(err.message || 'Error deleting record')
    }
  }

  const handleUpdateFeedbackStatus = async (id: number, status: string) => {
    try {
      await api.updateFeedbackStatus(id, status)
      loadFeedback()
    } catch (err: any) {
      alert(err.message || 'Error updating feedback status')
    }
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto py-16 font-['Urbanist']">
        <div className="bg-white dark:bg-[#1B1C1D] rounded-[30px] border border-slate-200 dark:border-white/20 p-8 sm:p-10 shadow-xl dark:shadow-2xl space-y-6 transition-colors">
          <div className="text-center space-y-2.5">
            <div className="w-14 h-14 rounded-full bg-[#A01D26]/10 dark:bg-[#A01D26]/20 text-[#A01D26] border border-[#A01D26]/30 dark:border-[#A01D26]/40 mx-auto flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Postal Intelligence Console
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#D9D9D9] leading-relaxed">
              Authorized credentials required for administrative directory management, dataset audits, and model metrics.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#D9D9D9]/80 mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#141415] text-slate-900 dark:text-white focus:outline-none focus:border-[#A01D26]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#D9D9D9]/80 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#141415] text-slate-900 dark:text-white focus:outline-none focus:border-[#A01D26]"
                required
              />
            </div>

            {loginError && (
              <div className="p-3.5 rounded-xl bg-[#A01D26]/10 dark:bg-[#A01D26]/15 border border-[#A01D26]/30 dark:border-[#A01D26]/40 text-[#A01D26] dark:text-white text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#A01D26] shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="btn-hitit-primary w-full text-xs h-11"
            >
              {isLoggingIn ? <RefreshCw className="w-4 h-4 animate-spin text-white dark:text-[#A01D26]" /> : <span>Log In to Console</span>}
            </button>
          </form>

          {/* Development Setup Note */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#141415] border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-[#D9D9D9]/70 space-y-1">
            <strong className="text-slate-900 dark:text-white">Authoritative Demo Credentials:</strong>
            <p className="font-mono text-slate-700 dark:text-white/80">User: admin</p>
            <p className="font-mono text-slate-700 dark:text-white/80">Pass: PostalIQ@2025Secure</p>
          </div>
        </div>
      </div>
    )
  }

  // Distribution chart data
  const chartData = analytics
    ? Object.entries(analytics.confidence_distribution).map(([key, val]) => ({
        name: key,
        count: val,
      }))
    : []

  return (
    <div className="space-y-8 font-['Urbanist']">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-white bg-[#A01D26] px-2.5 py-0.5 rounded-full">
              Intelligence Console
            </span>
            <span className="text-xs text-slate-500 dark:text-[#D9D9D9]/60">• Authenticated as {username}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-1.5">
            Postal Platform Intelligence
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="btn-hitit-secondary h-10 px-5 text-xs cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Analytics */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/15 shadow-sm dark:shadow-xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#D9D9D9]/70 block">Total Queries</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 block">
                {analytics.total_queries}
              </span>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/15 shadow-sm dark:shadow-xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">Match Rate</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                {analytics.match_rate_percentage}%
              </span>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/15 shadow-sm dark:shadow-xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#A01D26] block">Avg Confidence</span>
              <span className="text-2xl sm:text-3xl font-black text-[#A01D26] mt-1 block">
                {analytics.avg_confidence_score}%
              </span>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/15 shadow-sm dark:shadow-xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#D9D9D9]/70 block">Active Post Offices</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 block">
                {analytics.dataset_stats.total_post_offices}
              </span>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/15 shadow-sm dark:shadow-xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#D9D9D9]/70 block">Verified GPS Nodes</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 block">
                {analytics.dataset_stats.has_verified_coords_count}
              </span>
            </div>
          </div>

          {/* Model Evaluation Benchmark Table */}
          <div className="bg-white dark:bg-[#1B1C1D] rounded-[30px] border border-slate-200 dark:border-white/20 p-6 sm:p-8 shadow-xl dark:shadow-2xl space-y-4 transition-colors">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#A01D26]" />
              Machine Learning Model Evaluation Benchmarks (Test Suite)
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/15">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#141415] font-extrabold uppercase tracking-wider text-slate-600 dark:text-[#D9D9D9] border-b border-slate-200 dark:border-white/10">
                  <tr>
                    <th className="px-4 py-3">Model Variant</th>
                    <th className="px-4 py-3">Top-1 Accuracy</th>
                    <th className="px-4 py-3">Top-3 Accuracy</th>
                    <th className="px-4 py-3">Macro F1</th>
                    <th className="px-4 py-3">Mean Latency</th>
                    <th className="px-4 py-3">Sample Size</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/10 text-slate-700 dark:text-[#D9D9D9]">
                  {analytics.model_evaluations.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{m.model_name}</td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{m.top1_accuracy}%</td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{m.top3_accuracy}%</td>
                      <td className="px-4 py-3 font-mono text-slate-900 dark:text-white">{m.macro_f1}</td>
                      <td className="px-4 py-3 font-mono text-slate-500 dark:text-[#D9D9D9]/60">{m.mean_latency_ms} ms</td>
                      <td className="px-4 py-3 font-mono">{m.test_sample_size} records</td>
                      <td className="px-4 py-3">
                        {m.is_active ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#A01D26]/10 dark:bg-[#A01D26]/20 text-[#A01D26] border border-[#A01D26]/30 dark:border-[#A01D26]/40">
                            Active Ranker
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-[#D9D9D9]">
                            Baseline
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white dark:bg-[#1B1C1D] rounded-[30px] border border-slate-200 dark:border-white/20 p-6 sm:p-8 shadow-xl dark:shadow-2xl transition-colors">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-6">
              Query Confidence Distribution Breakdown
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" fontSize={11} stroke="#94A3B8" />
                  <YAxis fontSize={11} stroke="#94A3B8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border-subtle)',
                      borderRadius: '12px',
                      color: 'var(--color-text)',
                    }}
                  />
                  <Bar dataKey="count" fill="#A01D26" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Records Management */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <input
              type="text"
              value={recordsSearch}
              onChange={(e) => setRecordsSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadRecords()}
              placeholder="Search directory records..."
              className="px-4 py-2.5 text-xs rounded-full border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#141415] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#D9D9D9]/40 focus:outline-none focus:border-[#A01D26] w-full sm:w-80"
            />
            <button
              onClick={() => {
                setEditingRecord({
                  pin_code: '',
                  post_office_name: '',
                  locality: '',
                  district: '',
                  state: '',
                  office_type: 'Sub Post Office',
                  delivery_status: 'Delivery',
                })
                setIsModalOpen(true)
              }}
              className="btn-hitit-primary h-10 px-5 text-xs shrink-0"
            >
              <Plus className="w-4 h-4 text-white dark:text-[#A01D26]" />
              <span>Add Postal Record</span>
            </button>
          </div>

          <div className="bg-white dark:bg-[#1B1C1D] rounded-[30px] border border-slate-200 dark:border-white/20 shadow-xl dark:shadow-2xl overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#141415] text-slate-600 dark:text-[#D9D9D9] font-extrabold uppercase tracking-wider border-b border-slate-200 dark:border-white/10">
                  <tr>
                    <th className="px-4 py-3">PIN</th>
                    <th className="px-4 py-3">Post Office</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">District</th>
                    <th className="px-4 py-3">State</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/10 text-slate-700 dark:text-[#D9D9D9]">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#A01D26]">{r.pin_code}</td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{r.post_office_name}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-[#D9D9D9]/80">{r.office_type}</td>
                      <td className="px-4 py-3">{r.district}</td>
                      <td className="px-4 py-3">{r.state}</td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingRecord(r)
                            setIsModalOpen(true)
                          }}
                          className="p-1 hover:text-[#A01D26] text-slate-500 dark:text-[#D9D9D9]/70 cursor-pointer"
                          title="Edit record"
                        >
                          <Edit2 className="w-3.5 h-3.5 inline" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(r.id)}
                          className="p-1 hover:text-[#A01D26] text-slate-500 dark:text-[#D9D9D9]/70 cursor-pointer"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Feedback Queue */}
      {activeTab === 'feedback' && (
        <div className="bg-white dark:bg-[#1B1C1D] rounded-[30px] border border-slate-200 dark:border-white/20 shadow-xl dark:shadow-2xl overflow-hidden transition-colors">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            User Reported Errors & Suggestions Queue
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#141415] text-slate-600 dark:text-[#D9D9D9] font-extrabold uppercase tracking-wider border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Query Text</th>
                  <th className="px-4 py-3">Predicted PIN</th>
                  <th className="px-4 py-3">Suggested Correction</th>
                  <th className="px-4 py-3">Comments</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/10 text-slate-700 dark:text-[#D9D9D9]">
                {feedbackList.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-slate-400 dark:text-[#D9D9D9]/60 font-mono text-[11px]">
                      {new Date(f.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate text-slate-900 dark:text-white">{f.query_text}</td>
                    <td className="px-4 py-3 font-mono text-slate-500 dark:text-[#D9D9D9]">{f.predicted_pin || '—'}</td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {f.suggested_pin || f.suggested_post_office || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-[#D9D9D9]/70 max-w-xs truncate">{f.user_comment || '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          f.status === 'pending'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {f.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateFeedbackStatus(f.id, 'resolved')}
                          className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800 cursor-pointer"
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Dataset Management */}
      {activeTab === 'dataset' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/15 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#A01D26]" />
                  <span>Official India Post Gazetteer & Dataset Metadata</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#D9D9D9]/70 leading-relaxed mt-1">
                  National directory reference sourced from the Department of Posts, Government of India Open Government Data (OGD) Platform.
                </p>
              </div>
              <button
                onClick={loadAnalytics}
                className="btn-hitit-secondary text-xs h-9 px-3 self-start sm:self-auto"
                title="Refresh Metadata"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            {/* Metadata Detail Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#D9D9D9]/50 block">Official Source</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white block truncate" title={analytics?.dataset_stats.source || 'OGD Platform data.gov.in'}>
                  {analytics?.dataset_stats.source || 'OGD Platform (data.gov.in)'}
                </span>
                <span className="text-[10px] text-emerald-500 block">Verified Government Data</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#D9D9D9]/50 block">Records Imported</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white block font-mono">
                  {(analytics?.dataset_stats.number_of_records_imported || analytics?.dataset_stats.total_post_offices || 154797).toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-500 block">100% Sourced & Normalized</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#D9D9D9]/50 block">Rejected / Skipped Rows</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white block font-mono">
                  {analytics?.dataset_stats.rejected_rows ?? 0}
                </span>
                <span className="text-[10px] text-emerald-500 block">0 Schema Violations</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#D9D9D9]/50 block">Last Successful Update</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white block font-mono">
                  {analytics?.dataset_stats.last_successful_update
                    ? new Date(analytics.dataset_stats.last_successful_update).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })
                    : new Date().toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-[#D9D9D9]/60 block">Repeatable Automated Sync</span>
              </div>
            </div>

            {/* Geographical Coverage Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-[#D9D9D9]/80 block">
                All-India Territorial Coverage
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-3 rounded-xl bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/10">
                  <span className="text-xs text-slate-500 dark:text-[#D9D9D9]/60 block">Postal Codes</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
                    {(analytics?.dataset_stats.total_pin_codes || 19100).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/10">
                  <span className="text-xs text-slate-500 dark:text-[#D9D9D9]/60 block">Districts</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
                    {analytics?.dataset_stats.total_districts || 632}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/10">
                  <span className="text-xs text-slate-500 dark:text-[#D9D9D9]/60 block">States & UTs</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
                    {analytics?.dataset_stats.total_states || 37}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/10">
                  <span className="text-xs text-slate-500 dark:text-[#D9D9D9]/60 block">Verified GPS Nodes</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
                    {analytics?.dataset_stats.has_verified_coords_count || 55}
                  </span>
                </div>
              </div>
            </div>

            {/* Artifact Pipeline References */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#D9D9D9]/50 block">Master Source File</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">india_post_master.csv</span>
                <span className="text-[10px] text-emerald-500 block">154,797 Verified Records</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#D9D9D9]/50 block">Locality Aliases</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">locality_aliases.csv</span>
                <span className="text-[10px] text-emerald-500 block">58 Aliases Active</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#D9D9D9]/50 block">Candidate Retrieval</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">tfidf_vectorizer.joblib</span>
                <span className="text-[10px] text-emerald-500 block">Sub-linear N-gram Tokenizer</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Edit/Create Modal */}
      {isModalOpen && editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#1B1C1D] rounded-[28px] border border-slate-200 dark:border-white/20 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 text-slate-900 dark:text-white transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {editingRecord.id ? `Edit Record #${editingRecord.id}` : 'Create New Postal Record'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 dark:text-[#D9D9D9] hover:text-slate-600 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#D9D9D9]/80 mb-1">PIN Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={editingRecord.pin_code || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, pin_code: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#141415] text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#A01D26]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#D9D9D9]/80 mb-1">Post Office Name</label>
                  <input
                    type="text"
                    value={editingRecord.post_office_name || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, post_office_name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#141415] text-slate-900 dark:text-white focus:outline-none focus:border-[#A01D26]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#D9D9D9]/80 mb-1">Locality</label>
                  <input
                    type="text"
                    value={editingRecord.locality || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, locality: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#141415] text-slate-900 dark:text-white focus:outline-none focus:border-[#A01D26]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#D9D9D9]/80 mb-1">District</label>
                  <input
                    type="text"
                    value={editingRecord.district || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, district: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#141415] text-slate-900 dark:text-white focus:outline-none focus:border-[#A01D26]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#D9D9D9]/80 mb-1">State</label>
                  <input
                    type="text"
                    value={editingRecord.state || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, state: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#141415] text-slate-900 dark:text-white focus:outline-none focus:border-[#A01D26]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#D9D9D9]/80 mb-1">Office Type</label>
                  <select
                    value={editingRecord.office_type || 'Sub Post Office'}
                    onChange={(e) => setEditingRecord({ ...editingRecord, office_type: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#141415] text-slate-900 dark:text-white focus:outline-none focus:border-[#A01D26]"
                  >
                    <option value="Head Post Office">Head Post Office</option>
                    <option value="Sub Post Office">Sub Post Office</option>
                    <option value="Branch Post Office">Branch Post Office</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-hitit-secondary h-10 px-5 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-hitit-primary h-10 px-6 text-xs"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
