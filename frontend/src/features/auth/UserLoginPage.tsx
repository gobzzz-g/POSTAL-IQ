import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Layers, Eye, EyeOff, ArrowRight, CheckCircle2, Check, AlertCircle, UserPlus, LogIn, User } from 'lucide-react'
import { setUserSession, api } from '@/services/api'

export const UserLoginPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Password validation conditions (enforced during account creation)
  const hasMinLength = password.length >= 6
  const hasUppercase = /[A-Z]/.test(password)
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>_\-\\/+=~`[\];']/.test(password)
  const isPasswordValid = hasMinLength && hasUppercase && hasSymbol

  const redirectDest = (location.state as any)?.from?.pathname || '/app/predict'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('Please provide both email and password.')
      return
    }

    if (authMode === 'signup') {
      if (!isPasswordValid) {
        setError('Password must contain at least 6 characters, 1 uppercase letter, and 1 symbol.')
        return
      }
      if (confirmPassword && password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter your password confirmation.')
        return
      }
    }

    setIsLoading(true)

    try {
      await api.recordUserLogin(email.trim(), 'user').catch(() => {})
      setUserSession(email.trim())
      navigate(redirectDest, { replace: true })
    } catch {
      setError('Authentication failed. Please verify your details.')
    } finally {
      setIsLoading(false)
    }
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
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {authMode === 'signin' ? 'Welcome back.' : 'Create your account.'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#D9D9D9]/70 leading-relaxed">
                {authMode === 'signin'
                  ? 'Access your address intelligence workspace, history logs, and batch validation workflows.'
                  : 'Join thousands of logistics teams and data analysts optimizing pin code lookups across India.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Open Public Access Enabled</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-[#D9D9D9]/70 leading-relaxed">
                The core POSTALIQ prediction engine, directory, interactive map, and CSV validation tools
                are open to all users. Sign in to your existing account or create a new account in seconds.
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

        {/* Right Side: Form (Sign In / Sign Up) */}
        <div className="p-8 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            {/* Top Switcher Tabs */}
            <div className="flex border-b border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin')
                  setError(null)
                }}
                className={`flex-1 pb-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === 'signin'
                    ? 'border-[#A01D26] text-[#A01D26] dark:text-red-400'
                    : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup')
                  setError(null)
                }}
                className={`flex-1 pb-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === 'signup'
                    ? 'border-[#A01D26] text-[#A01D26] dark:text-red-400'
                    : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {authMode === 'signin' ? 'User Sign In' : 'Create an Account'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#D9D9D9]/60">
                {authMode === 'signin'
                  ? 'Enter your registered credentials to access your console'
                  : 'Sign up for a new account to save history and custom validation logs'}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-[#A01D26]/10 border border-[#A01D26]/30 text-xs text-[#A01D26] dark:text-red-200 font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#A01D26] shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {authMode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-[#D9D9D9]/80 block">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-[#D9D9D9]/30 focus:outline-none focus:border-[#A01D26] transition-colors"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-[#D9D9D9]/80 block">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@logistics.in"
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

                {/* Password Criteria Checklist ONLY in Sign Up / Account Creation */}
                {authMode === 'signup' && (
                  <div className="pt-1.5 space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-[#D9D9D9]/60">
                      Password Security Requirements:
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <div
                        className={`flex-1 min-w-0 flex items-center justify-center gap-1 px-2 py-1 rounded-full border whitespace-nowrap transition-colors ${
                          hasMinLength
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-bold'
                            : 'bg-slate-100/70 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-[#D9D9D9]/60'
                        }`}
                      >
                        <Check className={`w-3 h-3 shrink-0 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400' : 'opacity-30'}`} />
                        <span className="truncate">6+ Chars</span>
                      </div>

                      <div
                        className={`flex-1 min-w-0 flex items-center justify-center gap-1 px-2 py-1 rounded-full border whitespace-nowrap transition-colors ${
                          hasUppercase
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-bold'
                            : 'bg-slate-100/70 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-[#D9D9D9]/60'
                        }`}
                      >
                        <Check className={`w-3 h-3 shrink-0 ${hasUppercase ? 'text-emerald-600 dark:text-emerald-400' : 'opacity-30'}`} />
                        <span className="truncate">1 Uppercase</span>
                      </div>

                      <div
                        className={`flex-1 min-w-0 flex items-center justify-center gap-1 px-2 py-1 rounded-full border whitespace-nowrap transition-colors ${
                          hasSymbol
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-bold'
                            : 'bg-slate-100/70 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-[#D9D9D9]/60'
                        }`}
                      >
                        <Check className={`w-3 h-3 shrink-0 ${hasSymbol ? 'text-emerald-600 dark:text-emerald-400' : 'opacity-30'}`} />
                        <span className="truncate">1 Symbol</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {authMode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-[#D9D9D9]/80 block">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-[#D9D9D9]/30 focus:outline-none focus:border-[#A01D26] transition-colors"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-full bg-[#A01D26] hover:bg-[#85161E] text-white text-xs font-bold tracking-wider uppercase transition-colors shadow-lg shadow-[#A01D26]/20 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isLoading
                  ? authMode === 'signin'
                    ? 'Signing In...'
                    : 'Creating Account...'
                  : authMode === 'signin'
                  ? 'Sign In'
                  : 'Create Account & Sign In'}
              </button>
            </form>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 dark:border-white/10 w-full" />
              <span className="bg-white dark:bg-[#1B1C1D] px-3 text-[10px] uppercase font-bold text-slate-400 dark:text-[#D9D9D9]/40 tracking-wider">
                Or
              </span>
            </div>

            {/* Replace Continue as Guest with Sign Up / Sign In switch button */}
            {authMode === 'signin' ? (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup')
                  setError(null)
                }}
                className="w-full py-2.5 rounded-full border border-slate-300 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-800 dark:text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#A01D26]" />
                <span>Create an Account (Sign Up)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin')
                  setError(null)
                }}
                className="w-full py-2.5 rounded-full border border-slate-300 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-800 dark:text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-[#A01D26]" />
                <span>Already have an account? Sign In</span>
              </button>
            )}
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
