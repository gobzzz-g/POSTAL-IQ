import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, Eye, EyeOff, AlertCircle, KeyRound } from 'lucide-react'
import { api, setAdminToken } from '@/services/api'

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      setError('Please provide administrative username and password.')
      return
    }

    setIsLoading(true)
    setError(null)

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

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-[#141517] font-['Urbanist'] text-slate-900 dark:text-white transition-colors duration-200">
      <div className="max-w-md w-full rounded-3xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#1B1C1D] shadow-xl dark:shadow-2xl p-8 sm:p-10 space-y-8 transition-colors">
        {/* Security Shield Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#A01D26]/10 dark:bg-[#A01D26]/20 border border-[#A01D26]/30 dark:border-[#A01D26]/40 text-[#A01D26] mx-auto flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Administrator Access</h1>
          <p className="text-xs text-slate-600 dark:text-[#D9D9D9]/70 leading-relaxed">
            Sign in to manage postal records, review feedback, and monitor platform performance.
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-[#A01D26]/10 border border-[#A01D26]/30 flex items-start gap-2.5 text-xs text-[#A01D26] dark:text-red-200 animate-in fade-in duration-150 font-semibold">
            <AlertCircle className="w-4 h-4 text-[#A01D26] shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
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
            <label className="text-xs font-semibold text-slate-700 dark:text-[#D9D9D9]/80 block">Password</label>
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
