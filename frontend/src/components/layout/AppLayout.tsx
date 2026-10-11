import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import {
  Compass,
  MapPin,
  Search,
  UploadCloud,
  History,
  Settings,
  Moon,
  Sun,
  Layers,
  Menu,
  X,
  Activity,
  User,
  LogOut,
} from 'lucide-react'
import { api, getUserSession, setUserSession } from '@/services/api'
import { PageTransition } from '@/components/animation/PageTransition'

export const AppLayout: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const user = getUserSession()

  // Authentication Guard: Redirect to /login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true })
    }
  }, [user, navigate])

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('postaliq_theme') !== 'light'
  })
  const [apiOnline, setApiOnline] = useState<boolean | null>(null)

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('postaliq_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('postaliq_theme', 'light')
    }
  }, [isDark])

  useEffect(() => {
    api
      .getHealth()
      .then(() => setApiOnline(true))
      .catch(() => setApiOnline(false))
  }, [])

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  if (!user) {
    return null
  }

  // Normal user navigation: STRICTLY NO ADMIN WORKSPACE CONTROLS
  const navLinks = [
    { to: '/app/predict', label: 'Predict & Match', icon: Compass },
    { to: '/app/directory', label: 'Postal Directory', icon: Search },
    { to: '/app/map', label: 'Interactive Map', icon: MapPin },
    { to: '/app/bulk-validation', label: 'Bulk Validation', icon: UploadCloud },
    { to: '/app/history', label: 'Search History', icon: History },
    { to: '/app/settings', label: 'Platform Settings', icon: Settings },
  ]

  const navContent = (
    <div className="flex flex-col h-full justify-between font-['Urbanist']">
      {/* Top: Brand Header & Navigation */}
      <div className="space-y-6">
        <Link to="/" className="flex items-center gap-3.5 group">
          <div className="w-10 h-10 rounded-2xl bg-[#A01D26] text-white flex items-center justify-center font-bold text-lg shadow-md group-hover:scale-105 transition-transform shrink-0">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white font-['Urbanist']">
                POSTAL<span className="text-[#A01D26]">IQ</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#A01D26]/10 dark:bg-[#A01D26]/20 text-[#A01D26] border border-[#A01D26]/30">
                APP
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-[#D9D9D9]/70 font-medium leading-tight mt-0.5">
              Postal Intelligence System
            </p>
          </div>
        </Link>

        {/* Divider */}
        <div className="h-px bg-slate-200 dark:bg-white/10" />

        {/* Vertical Navigation Links */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#D9D9D9]/50 px-3.5 mb-2">
            Navigation
          </div>
          <nav className="space-y-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon
              const active = location.pathname === item.to
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-full text-xs font-bold tracking-[0.5px] transition-all ${active
                      ? 'bg-[#A01D26] text-white shadow-md'
                      : 'text-slate-600 dark:text-[#D9D9D9] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400 dark:text-[#D9D9D9]/60'
                      }`}
                  />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Bottom: Live API Status & Theme Toggle */}
      <div className="pt-6 mt-6 border-t border-slate-200 dark:border-white/10 space-y-3.5">
        {/* User Account Info & Sign Out */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <div className="w-7 h-7 rounded-xl bg-[#A01D26]/20 text-[#A01D26] flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="truncate">
              <div className="text-[11px] font-bold text-slate-800 dark:text-white truncate leading-tight">
                {user}
              </div>
              <div className="text-[9px] text-slate-400 dark:text-[#D9D9D9]/50">
                Active Session
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setUserSession(null)
              navigate('/login', { replace: true })
            }}
            className="p-1.5 rounded-lg text-slate-400 dark:text-[#D9D9D9]/50 hover:text-[#A01D26] hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live API Health Status */}
        <div
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium border ${apiOnline === true
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
              : apiOnline === false
                ? 'bg-[#A01D26]/10 dark:bg-[#A01D26]/20 text-[#A01D26] border-[#A01D26]/30 dark:border-[#A01D26]/50'
                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-[#D9D9D9] border-slate-200 dark:border-white/10'
            }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${apiOnline === true
                  ? 'bg-emerald-500 animate-pulse'
                  : apiOnline === false
                    ? 'bg-[#A01D26]'
                    : 'bg-amber-400'
                }`}
            />
            <span className="text-[11px] font-bold">
              {apiOnline === true ? 'FastAPI Engine Active' : apiOnline === false ? 'API Offline' : 'Connecting...'}
            </span>
          </div>
          <Activity className="w-3.5 h-3.5 opacity-60" />
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-full text-xs font-semibold text-slate-700 dark:text-[#D9D9D9] hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/15 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
            <span>{isDark ? 'Black Dark Editorial' : 'Clean Light Mode'}</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-[#D9D9D9]/50">
            {isDark ? 'Dark' : 'Light'}
          </span>
        </button>

        <div className="text-[10px] text-slate-400 dark:text-[#D9D9D9]/40 text-center font-mono">
          India Post ML • Gazette 2024
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-[#1A1A1A] text-slate-900 dark:text-white selection:bg-[#A01D26] selection:text-white font-['Urbanist'] transition-colors duration-200">
      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden lg:flex w-72 h-screen sticky top-0 flex-col bg-white dark:bg-[#1B1C1D] border-r border-slate-200 dark:border-white/10 p-6 z-40 shrink-0 transition-colors">
        {navContent}
      </aside>

      {/* Mobile Top Navigation Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-white/95 dark:bg-[#1A1A1A]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-4 py-3 flex items-center justify-between transition-colors">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#A01D26] text-white flex items-center justify-center font-bold shadow-sm">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white font-['Urbanist']">
            POSTAL<span className="text-[#A01D26]">IQ</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full text-slate-600 dark:text-[#D9D9D9] hover:bg-slate-100 dark:hover:bg-white/10"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-10">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </main>
        <footer className="py-6 px-4 sm:px-6 lg:px-10 border-t border-slate-200 dark:border-white/10 text-center text-xs text-slate-400 dark:text-[#D9D9D9]/40 font-mono transition-colors">
          POSTALIQ Postal Intelligence Engine • India Post Gazette 2024
        </footer>
      </div>
    </div>
  )
}
