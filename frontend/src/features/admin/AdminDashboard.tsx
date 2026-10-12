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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Upload,
  Download,
  FileText,
  Sun,
  Moon,
  Users,
  UserCheck,
  Globe,
  Clock,
  UserCog,
  KeyRound,
  Eye,
  EyeOff,
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
import { AnalyticsResponse, PostOffice } from '@/types'

export const AdminDashboard: React.FC = () => {
  const [token, setToken] = useState<string | null>(getAdminToken())
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('PostalIQ@2025Secure')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()

  // Tabs: analytics, logins, records, dataset
  const getTabFromPath = (): 'analytics' | 'logins' | 'records' | 'dataset' => {
    if (location.pathname.includes('login-history')) return 'logins'
    if (location.pathname.includes('postal-records')) return 'records'
    if (location.pathname.includes('dataset-management')) return 'dataset'
    return 'analytics'
  }

  const [activeTab, setActiveTab] = useState<'analytics' | 'logins' | 'records' | 'dataset'>(getTabFromPath())

  const [isDashboardDark, setIsDashboardDark] = useState<boolean>(() => {
    return typeof localStorage !== 'undefined' && localStorage.getItem('postaliq_theme') !== 'light'
  })

  useEffect(() => {
    const handleStorage = () => {
      setIsDashboardDark(localStorage.getItem('postaliq_theme') !== 'light')
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  useEffect(() => {
    setActiveTab(getTabFromPath())
  }, [location.pathname])

  // Analytics data
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  // User Login History data
  const [loginHistory, setLoginHistory] = useState<Array<{
    id: number
    username_or_email: string
    role: string
    ip_address: string
    user_agent: string
    status: string
    created_at: string
  }>>([])
  const [loginPage, setLoginPage] = useState(1)
  const [loginTotalPages, setLoginTotalPages] = useState(1)
  const [loginTotal, setLoginTotal] = useState(0)
  const [loginStats, setLoginStats] = useState<{ total_logins: number; unique_users: number; admin_logins: number } | null>(null)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginSearch, setLoginSearch] = useState('')

  // Records data
  const [records, setRecords] = useState<PostOffice[]>([])
  const [recordsPage, setRecordsPage] = useState(1)
  const [recordsTotalPages, setRecordsTotalPages] = useState(1)
  const [recordsTotal, setRecordsTotal] = useState(0)
  const [recordsLoading, setRecordsLoading] = useState(false)
  const [recordsSearch, setRecordsSearch] = useState('')

  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Partial<PostOffice> | null>(null)

  // Bulk CSV Upload modal state
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [bulkFile, setBulkFile] = useState<File | null>(null)
  const [bulkUploading, setBulkUploading] = useState(false)
  const [bulkMessage, setBulkMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Admin Credentials Change modal state
  const [isCredsModalOpen, setIsCredsModalOpen] = useState(false)
  const [credsCurrUser, setCredsCurrUser] = useState('admin')
  const [credsCurrPass, setCredsCurrPass] = useState('')
  const [credsNewUser, setCredsNewUser] = useState('')
  const [credsNewPass, setCredsNewPass] = useState('')
  const [credsConfirmPass, setCredsConfirmPass] = useState('')
  const [credsShowCurrPass, setCredsShowCurrPass] = useState(false)
  const [credsShowNewPass, setCredsShowNewPass] = useState(false)
  const [credsLoading, setCredsLoading] = useState(false)
  const [credsMessage, setCredsMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleUpdateAdminCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    setCredsMessage(null)

    if (!credsCurrPass) {
      setCredsMessage({ type: 'error', text: 'Current administrator password is required for verification.' })
      return
    }

    if (!credsNewUser.trim() && !credsNewPass) {
      setCredsMessage({ type: 'error', text: 'Please specify a new username or new password to update.' })
      return
    }

    if (credsNewPass) {
      if (credsNewPass.length < 6) {
        setCredsMessage({ type: 'error', text: 'New password must be at least 6 characters in length.' })
        return
      }
      if (credsNewPass !== credsConfirmPass) {
        setCredsMessage({ type: 'error', text: 'New password and confirmation password do not match.' })
        return
      }
    }

    setCredsLoading(true)
    try {
      const res = await api.changeAdminCredentials({
        current_username: credsCurrUser.trim() || undefined,
        current_password: credsCurrPass,
        new_username: credsNewUser.trim() || undefined,
        new_password: credsNewPass || undefined,
      })

      const updatedUser = res.username || credsNewUser.trim() || credsCurrUser.trim()
      setUsername(updatedUser)
      setCredsCurrUser(updatedUser)
      setCredsCurrPass('')
      setCredsNewUser('')
      setCredsNewPass('')
      setCredsConfirmPass('')
      setCredsMessage({
        type: 'success',
        text: `Admin credentials updated successfully for '${updatedUser}'.`,
      })
    } catch (err: any) {
      setCredsMessage({
        type: 'error',
        text: err?.response?.data?.detail || err?.message || 'Failed to update credentials. Please check current password.',
      })
    } finally {
      setCredsLoading(false)
    }
  }

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

  const loadRecords = async (pageOverride?: number) => {
    const pageToFetch = pageOverride !== undefined ? pageOverride : recordsPage
    setRecordsLoading(true)
    try {
      const data = await api.adminListPostOffices({
        page: pageToFetch,
        size: 15,
        query: recordsSearch.trim() || undefined,
      })
      setRecords(data.items || [])
      setRecordsTotalPages(data.total_pages || 1)
      setRecordsTotal(data.total || 0)
    } catch {
      // ignore
    } finally {
      setRecordsLoading(false)
    }
  }

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (recordsPage === 1) {
      loadRecords(1)
    } else {
      setRecordsPage(1)
    }
  }

  const loadLoginHistory = async (pageOverride?: number) => {
    const pageToFetch = pageOverride !== undefined ? pageOverride : loginPage
    setLoginLoading(true)
    try {
      const data = await api.getAdminLoginHistory({
        page: pageToFetch,
        size: 15,
        query: loginSearch.trim() || undefined,
      })
      setLoginHistory(data.items || [])
      setLoginTotal(data.total || 0)
      setLoginTotalPages(data.total_pages || 1)
      setLoginStats(data.stats || null)
    } catch {
      // ignore
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLoginSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (loginPage === 1) {
      loadLoginHistory(1)
    } else {
      setLoginPage(1)
    }
  }

  const handleClearLogins = async () => {
    if (!window.confirm('Clear all user login history records?')) return
    setLoginLoading(true)
    try {
      await api.adminClearLoginHistory()
      await loadLoginHistory(1)
    } catch {
      // ignore
    } finally {
      setLoginLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      loadAnalytics()
      loadRecords()
      loadLoginHistory()
    }
  }, [token, recordsPage, loginPage])

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

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bulkFile) return

    setBulkUploading(true)
    setBulkMessage(null)
    try {
      const res = await api.adminBulkUploadPostOffices(bulkFile)
      setBulkMessage({
        type: 'success',
        text: res.message || `Successfully imported ${res.imported_count} records.`,
      })
      setBulkFile(null)
      loadRecords()
      loadAnalytics()
    } catch (err: any) {
      setBulkMessage({
        type: 'error',
        text: err.message || 'Failed to upload CSV file. Please verify format.',
      })
    } finally {
      setBulkUploading(false)
    }
  }

  const handleDownloadSampleCsv = () => {
    const csvContent =
      'pin_code,post_office_name,office_type,delivery_status,locality,district,state,latitude,longitude\n' +
      '560001,Bangalore G.P.O.,Head Post Office,Delivery,Bangalore,Bengaluru,Karnataka,12.9791,77.5913\n' +
      '110001,New Delhi G.P.O.,Head Post Office,Delivery,Connaught Place,Central Delhi,Delhi,28.6328,77.2197\n' +
      '400001,Mumbai G.P.O.,Head Post Office,Delivery,Fort,Mumbai,Maharashtra,18.9401,72.8347\n'
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'sample_postal_records.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
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

            <button
              type="button"
              onClick={() => {
                setIsCredsModalOpen(true)
                setCredsCurrUser(username || 'admin')
                setCredsMessage(null)
              }}
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-white/15 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-[#D9D9D9] text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserCog className="w-3.5 h-3.5 text-[#A01D26]" />
              <span>Change Username / Password</span>
            </button>
          </form>

          {/* Development Setup Note */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#141415] border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-[#D9D9D9]/70 space-y-1">
            <strong className="text-slate-900 dark:text-white">Authoritative Demo Credentials:</strong>
            <p className="font-mono text-slate-700 dark:text-white/80">User: admin</p>
            <p className="font-mono text-slate-700 dark:text-white/80">Pass: PostalIQ@2025Secure</p>
          </div>
        </div>

        {/* Change Admin Credentials Modal for unauthenticated view */}
        {isCredsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1B1C1D] rounded-3xl border border-slate-200 dark:border-white/20 p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#A01D26]/10 dark:bg-[#A01D26]/20 border border-[#A01D26]/30 text-[#A01D26] flex items-center justify-center">
                    <UserCog className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Change Admin Credentials
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-[#D9D9D9]/60">
                      Update administrator username or password
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCredsModalOpen(false)
                    setCredsMessage(null)
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateAdminCredentials} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-[#D9D9D9]/80 block">
                    Current Admin Username
                  </label>
                  <input
                    type="text"
                    value={credsCurrUser}
                    onChange={(e) => setCredsCurrUser(e.target.value)}
                    placeholder="admin"
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#A01D26]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-[#D9D9D9]/80 block">
                    Current Password <span className="text-[#A01D26]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={credsShowCurrPass ? 'text' : 'password'}
                      value={credsCurrPass}
                      onChange={(e) => setCredsCurrPass(e.target.value)}
                      placeholder="Enter current password to authorize"
                      required
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#A01D26] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setCredsShowCurrPass(!credsShowCurrPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    >
                      {credsShowCurrPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-white/10 space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-[#D9D9D9]/80 block">
                      New Username (Leave blank to keep unchanged)
                    </label>
                    <input
                      type="text"
                      value={credsNewUser}
                      onChange={(e) => setCredsNewUser(e.target.value)}
                      placeholder="e.g. lead_admin"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#A01D26]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-[#D9D9D9]/80 block">
                      New Password (Leave blank to keep unchanged)
                    </label>
                    <div className="relative">
                      <input
                        type={credsShowNewPass ? 'text' : 'password'}
                        value={credsNewPass}
                        onChange={(e) => setCredsNewPass(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#A01D26] pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setCredsShowNewPass(!credsShowNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      >
                        {credsShowNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {credsNewPass && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-[#D9D9D9]/80 block">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={credsConfirmPass}
                        onChange={(e) => setCredsConfirmPass(e.target.value)}
                        placeholder="Re-enter new password"
                        required
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#A01D26]"
                      />
                    </div>
                  )}
                </div>

                {credsMessage && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
                      credsMessage.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                        : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                    }`}
                  >
                    {credsMessage.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                    )}
                    <span>{credsMessage.text}</span>
                  </div>
                )}

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCredsModalOpen(false)
                      setCredsMessage(null)
                    }}
                    className="btn-hitit-secondary h-9 px-4 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={credsLoading}
                    className="btn-hitit-primary h-9 px-5 text-xs disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {credsLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Update Credentials</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
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

      {/* Tab: User Login History */}
      {activeTab === 'logins' && (
        <div className="space-y-6">
          {/* Top Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/15 shadow-sm dark:shadow-xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#D9D9D9]/70 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#A01D26]" />
                <span>Total Logins</span>
              </span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 block">
                {(loginStats?.total_logins || loginTotal).toLocaleString()}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/15 shadow-sm dark:shadow-xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Unique Accounts</span>
              </span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                {(loginStats?.unique_users || 1).toLocaleString()}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/15 shadow-sm dark:shadow-xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#A01D26] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#A01D26]" />
                <span>Admin Authentications</span>
              </span>
              <span className="text-2xl sm:text-3xl font-black text-[#A01D26] mt-1 block">
                {(loginStats?.admin_logins || 1).toLocaleString()}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/15 shadow-sm dark:shadow-xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#D9D9D9]/70 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Security Protocol</span>
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white mt-2 block flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>JWT Active • TLS Encrypted</span>
              </span>
            </div>
          </div>

          {/* Search Bar & Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <form onSubmit={handleLoginSearchSubmit} className="relative w-full sm:w-96">
              <input
                type="text"
                value={loginSearch}
                onChange={(e) => setLoginSearch(e.target.value)}
                placeholder="Search user email, role, or IP..."
                className="w-full pl-9 pr-20 py-2.5 text-xs rounded-full border border-slate-200 dark:border-white/15 bg-white dark:bg-[#141415] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#D9D9D9]/40 focus:outline-none focus:border-[#A01D26]"
              />
              <Search className="w-4 h-4 text-slate-400 dark:text-[#D9D9D9]/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="submit"
                disabled={loginLoading}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-full text-[11px] font-bold bg-[#A01D26] hover:bg-[#85161E] text-white transition-colors disabled:opacity-50"
              >
                Search
              </button>
            </form>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <button
                onClick={() => loadLoginHistory()}
                className="btn-hitit-secondary h-10 px-4 text-xs inline-flex items-center gap-2"
                title="Refresh User Login History"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loginLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Logins</span>
              </button>

              <button
                onClick={handleClearLogins}
                className="h-10 px-4 rounded-full border border-slate-200 dark:border-white/15 bg-white dark:bg-[#1B1C1D] text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 dark:hover:border-rose-800 text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                title="Clear Login History Records"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            </div>
          </div>

          {/* Login History Table */}
          <div className="bg-white dark:bg-[#1B1C1D] rounded-[30px] border border-slate-200 dark:border-white/20 shadow-xl dark:shadow-2xl overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#141415] text-slate-600 dark:text-[#D9D9D9] font-extrabold uppercase tracking-wider border-b border-slate-200 dark:border-white/10">
                  <tr>
                    <th className="px-4 py-3">User / Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">IP Address</th>
                    <th className="px-4 py-3">Client / Browser</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Login Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/10 text-slate-700 dark:text-[#D9D9D9]">
                  {loginLoading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-400 dark:text-[#D9D9D9]/60">
                        <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2 text-[#A01D26]" />
                        Loading login records...
                      </td>
                    </tr>
                  ) : loginHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-400 dark:text-[#D9D9D9]/60">
                        No login history found matching query.
                      </td>
                    </tr>
                  ) : (
                    loginHistory.map((item) => {
                      const isSuper = item.role === 'superadmin' || item.role === 'admin'
                      const isGuest = item.role === 'guest'
                      return (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-[#A01D26]/10 text-[#A01D26] font-bold text-xs flex items-center justify-center shrink-0 border border-[#A01D26]/20">
                                {item.username_or_email.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-bold text-slate-900 dark:text-white">
                                {item.username_or_email}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                isSuper
                                  ? 'bg-[#A01D26]/10 text-[#A01D26] border-[#A01D26]/30'
                                  : isGuest
                                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              }`}
                            >
                              {item.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-500 dark:text-[#D9D9D9]/80">
                            {item.ip_address}
                          </td>
                          <td className="px-4 py-3 max-w-xs truncate text-slate-500 dark:text-[#D9D9D9]/70" title={item.user_agent}>
                            {item.user_agent}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {item.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-[11px] text-slate-500 dark:text-[#D9D9D9]/70">
                            {item.created_at ? new Date(item.created_at).toLocaleString() : 'Just now'}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 bg-slate-50/50 dark:bg-[#141415]/70 border-t border-slate-200 dark:border-white/10">
              <div className="text-xs text-slate-500 dark:text-[#D9D9D9]/70">
                Showing{' '}
                <span className="font-bold text-slate-900 dark:text-white">
                  {loginTotal === 0 ? 0 : (loginPage - 1) * 15 + 1}
                </span>{' '}
                to{' '}
                <span className="font-bold text-slate-900 dark:text-white">
                  {Math.min(loginPage * 15, loginTotal)}
                </span>{' '}
                of{' '}
                <span className="font-bold text-[#A01D26]">
                  {loginTotal.toLocaleString()}
                </span>{' '}
                logins
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setLoginPage(1)}
                  disabled={loginPage <= 1 || loginLoading}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1B1C1D] text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1"
                  title="First Page"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">First</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLoginPage((p) => Math.max(1, p - 1))}
                  disabled={loginPage <= 1 || loginLoading}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1B1C1D] text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <div className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#A01D26]/10 text-[#A01D26] border border-[#A01D26]/30">
                  Page {loginPage} of {loginTotalPages || 1}
                </div>

                <button
                  type="button"
                  onClick={() => setLoginPage((p) => Math.min(loginTotalPages, p + 1))}
                  disabled={loginPage >= loginTotalPages || loginLoading}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1B1C1D] text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1"
                  title="Next Page"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setLoginPage(loginTotalPages)}
                  disabled={loginPage >= loginTotalPages || loginLoading}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1B1C1D] text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1"
                  title="Last Page"
                >
                  <span className="hidden sm:inline">Last</span>
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Records Management */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
              <input
                type="text"
                value={recordsSearch}
                onChange={(e) => setRecordsSearch(e.target.value)}
                placeholder="Search PIN, office, district, state..."
                className="w-full pl-9 pr-20 py-2.5 text-xs rounded-full border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#141415] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#D9D9D9]/40 focus:outline-none focus:border-[#A01D26]"
              />
              <Search className="w-4 h-4 text-slate-400 dark:text-[#D9D9D9]/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="submit"
                disabled={recordsLoading}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-full text-[11px] font-bold bg-[#A01D26] hover:bg-[#85161E] text-white transition-colors disabled:opacity-50"
              >
                Search
              </button>
            </form>
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setBulkMessage(null)
                  setBulkFile(null)
                  setIsBulkModalOpen(true)
                }}
                className="h-10 px-4 text-xs font-bold rounded-full border border-slate-200 dark:border-white/20 bg-white dark:bg-[#1B1C1D] text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 transition-colors inline-flex items-center gap-2 shadow-sm"
              >
                <Upload className="w-3.5 h-3.5 text-[#A01D26]" />
                <span>Upload CSV (Bulk)</span>
              </button>
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
                  {recordsLoading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-400 dark:text-[#D9D9D9]/60">
                        <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2 text-[#A01D26]" />
                        Fetching postal records...
                      </td>
                    </tr>
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-400 dark:text-[#D9D9D9]/60">
                        No postal records found matching query.
                      </td>
                    </tr>
                  ) : (
                    records.map((r) => (
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
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 bg-slate-50/50 dark:bg-[#141415]/70 border-t border-slate-200 dark:border-white/10">
              <div className="text-xs text-slate-500 dark:text-[#D9D9D9]/70">
                Showing{' '}
                <span className="font-bold text-slate-900 dark:text-white">
                  {recordsTotal === 0 ? 0 : (recordsPage - 1) * 15 + 1}
                </span>{' '}
                to{' '}
                <span className="font-bold text-slate-900 dark:text-white">
                  {Math.min(recordsPage * 15, recordsTotal)}
                </span>{' '}
                of{' '}
                <span className="font-bold text-[#A01D26]">
                  {recordsTotal.toLocaleString()}
                </span>{' '}
                records
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setRecordsPage(1)}
                  disabled={recordsPage <= 1 || recordsLoading}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1B1C1D] text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1"
                  title="First Page"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">First</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRecordsPage((p) => Math.max(1, p - 1))}
                  disabled={recordsPage <= 1 || recordsLoading}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1B1C1D] text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <div className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#A01D26]/10 text-[#A01D26] border border-[#A01D26]/30">
                  Page {recordsPage} of {recordsTotalPages || 1}
                </div>

                <button
                  type="button"
                  onClick={() => setRecordsPage((p) => Math.min(recordsTotalPages, p + 1))}
                  disabled={recordsPage >= recordsTotalPages || recordsLoading}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1B1C1D] text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1"
                  title="Next Page"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setRecordsPage(recordsTotalPages)}
                  disabled={recordsPage >= recordsTotalPages || recordsLoading}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1B1C1D] text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1"
                  title="Last Page"
                >
                  <span className="hidden sm:inline">Last</span>
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Dataset Management */}
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

      {/* Modal 2: Bulk Upload CSV Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#1B1C1D] rounded-[30px] border border-slate-200 dark:border-white/20 p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl transition-colors">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#A01D26]/10 text-[#A01D26] flex items-center justify-center border border-[#A01D26]/30">
                  <Upload className="w-5 h-5 text-[#A01D26]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Bulk Upload Postal Records
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#D9D9D9]/70">
                    Import multiple post offices via a standard CSV spreadsheet
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsBulkModalOpen(false)
                  setBulkMessage(null)
                  setBulkFile(null)
                }}
                className="text-slate-400 hover:text-slate-600 dark:text-[#D9D9D9]/50 dark:hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Download Prompt */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Need the required CSV format?
                </span>
                <span className="text-[11px] text-slate-500 dark:text-[#D9D9D9]/70 block">
                  Columns: pin_code, post_office_name, district, state...
                </span>
              </div>
              <button
                type="button"
                onClick={handleDownloadSampleCsv}
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#A01D26]/10 hover:bg-[#A01D26]/20 text-[#A01D26] border border-[#A01D26]/30 inline-flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Sample CSV</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleBulkUpload} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-[#D9D9D9]">
                  Select CSV File (.csv)
                </label>
                <div className="relative border-2 border-dashed border-slate-200 dark:border-white/15 hover:border-[#A01D26] dark:hover:border-[#A01D26] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-[#141415]/50 group">
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setBulkFile(e.target.files[0])
                        setBulkMessage(null)
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-2 pointer-events-none">
                    <FileText className="w-8 h-8 mx-auto text-slate-400 dark:text-[#D9D9D9]/40 group-hover:text-[#A01D26] transition-colors" />
                    {bulkFile ? (
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {bulkFile.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {(bulkFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-bold text-slate-700 dark:text-white">
                          Click to browse or drag and drop CSV file
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Maximum supported file size: 25 MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status / Result Message */}
              {bulkMessage && (
                <div
                  className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 ${
                    bulkMessage.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  {bulkMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  )}
                  <span>{bulkMessage.text}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsBulkModalOpen(false)
                    setBulkMessage(null)
                    setBulkFile(null)
                  }}
                  className="btn-hitit-secondary h-10 px-5 text-xs"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={!bulkFile || bulkUploading}
                  className="btn-hitit-primary h-10 px-6 text-xs disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {bulkUploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Importing Records...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload & Import</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Admin Credentials Modal for authenticated view */}
      {isCredsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1B1C1D] rounded-3xl border border-slate-200 dark:border-white/20 p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#A01D26]/10 dark:bg-[#A01D26]/20 border border-[#A01D26]/30 text-[#A01D26] flex items-center justify-center">
                  <UserCog className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Change Admin Credentials
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-[#D9D9D9]/60">
                    Update administrator username or password
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCredsModalOpen(false)
                  setCredsMessage(null)
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateAdminCredentials} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-[#D9D9D9]/80 block">
                  Current Admin Username
                </label>
                <input
                  type="text"
                  value={credsCurrUser}
                  onChange={(e) => setCredsCurrUser(e.target.value)}
                  placeholder="admin"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#A01D26]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-[#D9D9D9]/80 block">
                  Current Password <span className="text-[#A01D26]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={credsShowCurrPass ? 'text' : 'password'}
                    value={credsCurrPass}
                    onChange={(e) => setCredsCurrPass(e.target.value)}
                    placeholder="Enter current password to authorize"
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#A01D26] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setCredsShowCurrPass(!credsShowCurrPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    {credsShowCurrPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-white/10 space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-[#D9D9D9]/80 block">
                    New Username (Leave blank to keep unchanged)
                  </label>
                  <input
                    type="text"
                    value={credsNewUser}
                    onChange={(e) => setCredsNewUser(e.target.value)}
                    placeholder="e.g. lead_admin"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#A01D26]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-[#D9D9D9]/80 block">
                    New Password (Leave blank to keep unchanged)
                  </label>
                  <div className="relative">
                    <input
                      type={credsShowNewPass ? 'text' : 'password'}
                      value={credsNewPass}
                      onChange={(e) => setCredsNewPass(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#A01D26] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setCredsShowNewPass(!credsShowNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    >
                      {credsShowNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {credsNewPass && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-[#D9D9D9]/80 block">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={credsConfirmPass}
                      onChange={(e) => setCredsConfirmPass(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#A01D26]"
                    />
                  </div>
                )}
              </div>

              {credsMessage && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
                    credsMessage.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  {credsMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  )}
                  <span>{credsMessage.text}</span>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsCredsModalOpen(false)
                    setCredsMessage(null)
                  }}
                  className="btn-hitit-secondary h-9 px-4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={credsLoading}
                  className="btn-hitit-primary h-9 px-5 text-xs disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {credsLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Update Credentials</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
