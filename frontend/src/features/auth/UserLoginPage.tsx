import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Layers, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react'
import { setUserSession } from '@/services/api'

export const UserLoginPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const redirectDest = (location.state as any)?.from?.pathname || '/app/predict'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please provide both email and password.')
      return
    }

    setIsLoading(true)
    setError(null)

    setTimeout(() => {
      setIsLoading(false)
      setUserSession(email.trim())
      navigate(redirectDest, { replace: true })
    }, 400)
  }

  const handleGuestAccess = () => {
    setUserSession('guest-analyst@postaliq.org')
    navigate(redirectDest, { replace: true })
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-[#18191B] font-['Urbanist'] text-slate-900 dark:text-white transition-colors duration-200">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 rounded-3xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#1B1C1D] shadow-xl dark:shadow-2xl overflow-hidden transition-colors">
        {/* Left Side: Brand Statement & Access Model */}
        <div className="p-8 sm:p-10 flex flex-col justify-between bg-slate-100/60 dark:bg-gradient-to-br dark:from-[#1B1C1D] dark:via-[#202123] dark:to-[#161718] border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 transition-colors">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#A01D26] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                POSTAL<span className="text-[#A01D26]">IQ</span>
              </span>
            </Link>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Welcome back.</h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#D9D9D9]/70 leading-relaxed">
                Access your address intelligence workspace, history logs, and batch validation workflows.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Open Public Access Enabled</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-[#D9D9D9]/70 leading-relaxed">
                The core POSTALIQ prediction engine, directory, interactive map, and CSV validation tools
                are open to all visitors. Sign in or continue directly as a guest.
              </p>
            </div>
          </div>

          <div className="pt-8 text-xs text-slate-500 dark:text-[#D9D9D9]/50">
            Need system configuration access?{' '}
            <Link to="/admin/login" className="text-[#A01D26] hover:underline font-bold">
              Admin Login →
            </Link>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">User Sign In</h3>
              <p className="text-xs text-slate-500 dark:text-[#D9D9D9]/60">Enter your credentials or use instant guest access</p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-[#A01D26]/10 border border-[#A01D26]/30 text-xs text-[#A01D26] dark:text-red-200 font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-[#D9D9D9]/80 block">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@logistics.in"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-[#D9D9D9]/30 focus:outline-none focus:border-[#A01D26] transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#D9D9D9]/50 hover:text-slate-900 dark:hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-full bg-[#A01D26] hover:bg-[#85161E] text-white text-xs font-bold tracking-wider uppercase transition-colors shadow-lg shadow-[#A01D26]/20 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 dark:border-white/10 w-full" />
              <span className="bg-white dark:bg-[#1B1C1D] px-3 text-[10px] uppercase font-bold text-slate-400 dark:text-[#D9D9D9]/40 tracking-wider">
                Or
              </span>
            </div>

            <button
              onClick={handleGuestAccess}
              className="w-full py-2.5 rounded-full border border-slate-300 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-800 dark:text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue as Guest</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-center pt-2">
            <Link to="/" className="text-xs text-slate-400 dark:text-[#D9D9D9]/50 hover:text-slate-900 dark:hover:text-white transition-colors">
              ← Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserLoginPage
