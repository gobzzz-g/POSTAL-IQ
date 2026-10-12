import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, Eye, EyeOff, AlertCircle, KeyRound, CheckCircle2, UserCog, Lock } from 'lucide-react'
import { api, setAdminToken } from '@/services/api'

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'login' | 'change'>('login')

  // Login form state
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Change credentials state
  const [currUser, setCurrUser] = useState('admin')
  const [currPass, setCurrPass] = useState('')
  const [newUser, setNewUser] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showCurrPass, setShowCurrPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [isChanging, setIsChanging] = useState(false)

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      setError('Please provide administrative username and password.')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccessMsg(null)

    try {
      const response = await api.adminLogin({ username: username.trim(), password })
      if (response.access_token) {
        setAdminToken(response.access_token)
        navigate('/admin')
      } else {
        setError('Authentication response did not contain a valid bearer token.')
      }
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || 'Invalid administrator credentials. Access denied.'
      setError(detail)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangeCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    if (!currPass) {
      setError('Current administrator password is required for verification.')
      return
    }

    if (!newUser.trim() && !newPass) {
      setError('Please provide a new username or new password to update.')
      return
    }

    if (newPass) {
      if (newPass.length < 6) {
        setError('New password must be at least 6 characters in length.')
        return
      }
      if (newPass !== confirmPass) {
        setError('New password and confirmation password do not match.')
        return
      }
    }

    setIsChanging(true)

    try {
      const res = await api.changeAdminCredentials({
        current_username: currUser.trim() || undefined,
        current_password: currPass,
        new_username: newUser.trim() || undefined,
        new_password: newPass || undefined,
      })

      const updatedUser = res.username || newUser.trim() || currUser.trim()
      setUsername(updatedUser)
      setCurrUser(updatedUser)
      setCurrPass('')
      setNewUser('')
      setNewPass('')
      setConfirmPass('')
      setSuccessMsg(`Credentials successfully updated for '${updatedUser}'! Please log in now.`)
      setActiveTab('login')
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || 'Failed to update admin credentials.'
      setError(detail)
    } finally {
      setIsChanging(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-[#141517] font-['Urbanist'] text-slate-900 dark:text-white transition-colors duration-200">
      <div className="max-w-md w-full rounded-3xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#1B1C1D] shadow-xl dark:shadow-2xl p-8 sm:p-10 space-y-6 transition-colors">
        {/* Security Shield Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#A01D26]/10 dark:bg-[#A01D26]/20 border border-[#A01D26]/30 dark:border-[#A01D26]/40 text-[#A01D26] mx-auto flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Administrator Access</h1>
          <p className="text-xs text-slate-600 dark:text-[#D9D9D9]/70 leading-relaxed">
            Manage postal records, dataset audits, security metrics, and credentials.
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Change Credentials */}
        <div className="flex border-b border-slate-200 dark:border-white/10">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login')
              setError(null)
            }}
            className={`flex-1 pb-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'border-[#A01D26] text-[#A01D26] dark:text-red-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('change')
              setError(null)
            }}
            className={`flex-1 pb-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'change'
                ? 'border-[#A01D26] text-[#A01D26] dark:text-red-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <UserCog className="w-3.5 h-3.5" />
            <span>Change Username / Password</span>
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-3.5 rounded-xl bg-[#A01D26]/10 border border-[#A01D26]/30 flex items-start gap-2.5 text-xs text-[#A01D26] dark:text-red-200 animate-in fade-in duration-150 font-semibold">
            <AlertCircle className="w-4 h-4 text-[#A01D26] shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in duration-150 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab 1: Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-[#D9D9D9]/80 block">Admin Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-[#D9D9D9]/30 focus:outline-none focus:border-[#A01D26] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-700 dark:text-[#D9D9D9]/80 block">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('change')
                    setError(null)
                  }}
                  className="text-[11px] text-[#A01D26] dark:text-red-400 hover:underline cursor-pointer"
                >
                  Change Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-[#D9D9D9]/30 focus:outline-none focus:border-[#A01D26] transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#D9D9D9]/50 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-[#A01D26] hover:bg-[#85161E] text-white text-xs font-bold tracking-wider uppercase transition-colors shadow-lg shadow-[#A01D26]/25 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Authenticate & Access Console</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Tab 2: Change Credentials Form */}
        {activeTab === 'change' && (
          <form onSubmit={handleChangeCredentials} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-[#D9D9D9]/80 block">Current Admin Username</label>
              <input
                type="text"
                value={currUser}
                onChange={(e) => setCurrUser(e.target.value)}
                placeholder="admin"
                required
                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#A01D26]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-[#D9D9D9]/80 block">
                Current Password <span className="text-[#A01D26]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrPass ? 'text' : 'password'}
                  value={currPass}
                  onChange={(e) => setCurrPass(e.target.value)}
                  placeholder="Enter current password to authorize changes"
                  required
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#A01D26] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrPass(!showCurrPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  {showCurrPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-white/10 space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-[#D9D9D9]/80 block">New Admin Username (Leave blank to keep same)</label>
                <input
                  type="text"
                  value={newUser}
                  onChange={(e) => setNewUser(e.target.value)}
                  placeholder="e.g. lead_admin or admin_hq"
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#A01D26]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-[#D9D9D9]/80 block">New Password (Leave blank to keep same)</label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#A01D26] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {newPass && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-[#D9D9D9]/80 block">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#A01D26]"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isChanging}
              className="w-full py-3 rounded-full bg-[#A01D26] hover:bg-[#85161E] text-white text-xs font-bold tracking-wider uppercase transition-colors shadow-lg shadow-[#A01D26]/25 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-3"
            >
              {isChanging ? (
                <span>Updating Credentials...</span>
              ) : (
                <>
                  <UserCog className="w-3.5 h-3.5" />
                  <span>Update Admin Credentials</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Footnote & Navigation */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col items-center gap-2 text-xs text-slate-500 dark:text-[#D9D9D9]/50 transition-colors">
          <Link to="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            ← Return to Public Homepage
          </Link>
          <Link to="/login" className="hover:text-slate-900 dark:hover:text-white transition-colors text-[11px]">
            Regular User Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginPage
