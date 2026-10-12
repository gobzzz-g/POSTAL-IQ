import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import {
  ShieldCheck,
  BarChart3,
  Database,
  LogOut,
  Layers,
  Activity,
  Menu,
  X,
  ArrowLeft,
  Lock,
  Sun,
  Moon,
  Users,
  UserCog,
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { getAdminToken, setAdminToken, api } from '@/services/api'
import { PageTransition } from '@/components/animation/PageTransition'

export const AdminLayout: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const token = getAdminToken()

  // Credentials modal state
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

  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('postaliq_theme') !== 'light'
  })

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('postaliq_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('postaliq_theme', 'light')
    }
  }, [isDark])

  // Strict Authentication Guard
  useEffect(() => {
    if (!token) {
      navigate('/admin/login', { replace: true })
    }
  }, [token, navigate])

  const handleSignOut = () => {
    setAdminToken(null)
    navigate('/admin/login', { replace: true })
  }

  // If not authenticated, do not render admin workspace
  if (!token) {
    return null
  }

  const adminNavLinks = [
    { to: '/admin', label: 'Console Overview', icon: ShieldCheck, exact: true },
    { to: '/admin/login-history', label: 'User Login History', icon: Users },
    { to: '/admin/postal-records', label: 'Postal Records', icon: Database },
    { to: '/admin/dataset-management', label: 'Dataset Imports', icon: Activity },
  ]

  const navContent = (
    <div className="flex flex-col h-full justify-between font-['Urbanist']">
      <div className="space-y-6">
        {/* Brand with Admin Badge */}
        <Link to="/admin" className="flex items-center gap-3.5 group">
          <div className="w-10 h-10 rounded-2xl bg-[#A01D26] text-white flex items-center justify-center font-bold text-lg shadow-md group-hover:scale-105 transition-transform shrink-0">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white font-['Urbanist']">
                POSTAL<span className="text-[#A01D26]">IQ</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#A01D26]/20 text-[#A01D26] border border-[#A01D26]/40">
                ADMIN
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-[#D9D9D9]/70 font-medium leading-tight mt-0.5">
              Postal Administration Console
            </p>
          </div>
        </Link>

        {/* Exit to Public Website */}
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-[#D9D9D9]/60 dark:hover:text-white transition-colors px-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Public Website</span>
        </Link>

        {/* Divider */}
        <div className="h-px bg-slate-200 dark:bg-white/10" />

        {/* Admin Navigation */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#D9D9D9]/40 px-3.5 mb-2">
            Administrator Tools
          </div>
          <nav className="space-y-1.5">
            {adminNavLinks.map((item) => {
              const Icon = item.icon
              const active = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-full text-xs font-bold tracking-[0.5px] transition-all ${
                    active
                      ? 'bg-[#A01D26] text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-[#D9D9D9] dark:hover:text-white dark:hover:bg-white/5'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      active ? 'text-white' : 'text-slate-400 dark:text-[#D9D9D9]/60'
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Bottom: Theme Toggle, Admin Session Info & Sign Out */}
      <div className="pt-6 mt-6 border-t border-slate-200 dark:border-white/10 space-y-3">
        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={() => setIsDark(!isDark)}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-full text-xs font-semibold text-slate-700 dark:text-[#D9D9D9] hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/15 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
            <span>{isDark ? 'Black Dark Mode' : 'Clean Light Mode'}</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-[#D9D9D9]/50">
            {isDark ? 'Dark' : 'Light'}
          </span>
        </button>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
            <Lock className="w-3.5 h-3.5 text-[#A01D26]" />
            <span>Administrator (admin)</span>
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">
            JWT Session Active
          </div>
        </div>

        {/* Change Credentials Button */}
        <button
          type="button"
          onClick={() => {
            setIsCredsModalOpen(true)
            setCredsMessage(null)
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold text-slate-700 dark:text-[#D9D9D9] hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/15 transition-all cursor-pointer"
        >
          <UserCog className="w-3.5 h-3.5 text-[#A01D26]" />
          <span>Change Credentials</span>
        </button>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold text-[#A01D26] hover:text-white hover:bg-[#A01D26] border border-[#A01D26]/40 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-[#141517] text-slate-900 dark:text-white selection:bg-[#A01D26] selection:text-white font-['Urbanist'] transition-colors duration-200">
      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden lg:flex w-72 h-screen sticky top-0 flex-col bg-white dark:bg-[#1B1C1D] border-r border-slate-200 dark:border-white/10 p-6 z-40 shrink-0 transition-colors">
        {navContent}
      </aside>

      {/* Mobile Top Navigation Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-white/95 dark:bg-[#18191B]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-4 py-3 flex items-center justify-between transition-colors">
        <Link to="/admin" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#A01D26] text-white flex items-center justify-center font-bold shadow-sm">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white font-['Urbanist']">
            POSTAL<span className="text-[#A01D26]">IQ</span> ADMIN
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full text-slate-600 dark:text-[#D9D9D9] hover:bg-slate-100 dark:hover:bg-white/10"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-out Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] h-full bg-white dark:bg-[#1B1C1D] border-r border-slate-200 dark:border-white/10 p-6 z-50 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}

      {/* Main Admin Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-10">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </main>
      </div>

      {/* Global Change Admin Credentials Modal */}
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
