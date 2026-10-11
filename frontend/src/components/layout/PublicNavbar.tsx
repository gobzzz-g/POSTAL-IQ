import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Layers,
  ChevronDown,
  Search,
  Compass,
  MapPin,
  UploadCloud,
  History,
  Sun,
  Moon,
  Menu,
  X,
  User,
  LogOut,
} from 'lucide-react'
import { getUserSession, setUserSession } from '@/services/api'

export const PublicNavbar: React.FC = () => {
  const location = useLocation()
  const user = getUserSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [platformDropdownOpen, setPlatformDropdownOpen] = useState(false)
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('postaliq_theme') !== 'light'
  })

  const appPath = (path: string) => user ? path : '/login'

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('postaliq_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('postaliq_theme', 'light')
    }
  }, [isDark])

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setPlatformDropdownOpen(false)
  }, [location.pathname])

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-[#18191B]/85 backdrop-blur-md border-b border-slate-200 dark:border-white/10 text-slate-900 dark:text-white transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Brand */}
        <Link to="/" className="flex items-center gap-3.5 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#A01D26] text-white flex items-center justify-center font-bold text-lg shadow-md group-hover:scale-105 transition-transform shrink-0">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white font-['Urbanist']">
                POSTAL<span className="text-[#A01D26]">IQ</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#A01D26]/10 dark:bg-[#A01D26]/20 text-[#A01D26] border border-[#A01D26]/30 dark:border-[#A01D26]/40">
                INDIA POST ML
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-[#D9D9D9]/70 font-medium leading-none mt-0.5">
              Postal Intelligence System
            </p>
          </div>
        </Link>

        {/* Center: Corporate Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-[#D9D9D9]">
          {/* Platform Dropdown */}
          <div className="relative">
            <button
              onClick={() => setPlatformDropdownOpen(!platformDropdownOpen)}
              onMouseEnter={() => setPlatformDropdownOpen(true)}
              className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer py-2"
            >
              <span>Platform</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${platformDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {platformDropdownOpen && (
              <div
                onMouseLeave={() => setPlatformDropdownOpen(false)}
                className="absolute top-full left-0 w-64 bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/15 rounded-2xl shadow-xl p-2.5 space-y-1 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <Link
                  to={appPath('/app/predict')}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-xs font-semibold"
                >
                  <Compass className="w-4 h-4 text-[#A01D26]" />
                  <div>
                    <div className="text-slate-900 dark:text-white font-bold">Predict & Match</div>
                    <div className="text-[10px] text-slate-500 dark:text-[#D9D9D9]/60 font-normal">Intelligent address resolution</div>
                  </div>
                </Link>
                <Link
                  to={appPath('/app/directory')}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-xs font-semibold"
                >
                  <Search className="w-4 h-4 text-[#A01D26]" />
                  <div>
                    <div className="text-slate-900 dark:text-white font-bold">Postal Directory</div>
                    <div className="text-[10px] text-slate-500 dark:text-[#D9D9D9]/60 font-normal">Search official gazetteer</div>
                  </div>
                </Link>
                <Link
                  to={appPath('/app/map')}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-xs font-semibold"
                >
                  <MapPin className="w-4 h-4 text-[#A01D26]" />
                  <div>
                    <div className="text-slate-900 dark:text-white font-bold">Interactive Map</div>
                    <div className="text-[10px] text-slate-500 dark:text-[#D9D9D9]/60 font-normal">GPS coordinates & centroids</div>
                  </div>
                </Link>
                <Link
                  to={appPath('/app/bulk-validation')}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-xs font-semibold"
                >
                  <UploadCloud className="w-4 h-4 text-[#A01D26]" />
                  <div>
                    <div className="text-slate-900 dark:text-white font-bold">Bulk Validation</div>
                    <div className="text-[10px] text-slate-500 dark:text-[#D9D9D9]/60 font-normal">Upload CSV datasets</div>
                  </div>
                </Link>
                <Link
                  to={appPath('/app/history')}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-xs font-semibold"
                >
                  <History className="w-4 h-4 text-[#A01D26]" />
                  <div>
                    <div className="text-slate-900 dark:text-white font-bold">Search History</div>
                    <div className="text-[10px] text-slate-500 dark:text-[#D9D9D9]/60 font-normal">Private query log</div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          <Link to="/features" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Features
          </Link>
          <Link to="/how-it-works" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            How It Works
          </Link>
          <Link to="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            About
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="hidden sm:flex items-center gap-4">
          {/* Quick search shortcut */}
          <Link
            to={appPath('/app/directory')}
            className="p-2 rounded-full text-slate-600 dark:text-[#D9D9D9] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            title="Search Postal Directory"
          >
            <Search className="w-4 h-4" />
          </Link>

          {/* Theme toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full text-slate-600 dark:text-[#D9D9D9] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Toggle theme"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Editorial Mode"}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* User Session or Login Link */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/app/predict"
                className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/15 transition-colors"
                title={`Logged in as ${user}`}
              >
                <User className="w-3.5 h-3.5 text-[#A01D26]" />
                <span className="max-w-[100px] truncate">{user}</span>
              </Link>
              <button
                onClick={() => {
                  setUserSession(null)
                  window.location.reload()
                }}
                className="p-1.5 rounded-full text-slate-400 dark:text-[#D9D9D9]/60 hover:text-[#A01D26] hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-sm font-bold text-slate-700 dark:text-[#D9D9D9] hover:text-slate-900 dark:hover:text-white px-3 py-2 transition-colors"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile menu hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full text-slate-600 dark:text-[#D9D9D9] hover:bg-slate-100 dark:hover:bg-white/10"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
            aria-label="Open mobile navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#18191B] px-4 pt-4 pb-6 space-y-4 shadow-xl">
          <div className="space-y-1">
            <Link
              to={appPath('/app/directory')}
              className="block px-3 py-2 text-sm text-slate-700 dark:text-[#D9D9D9] hover:text-slate-900 dark:hover:text-white font-medium"
            >
              Postal Directory
            </Link>
            <Link
              to={appPath('/app/map')}
              className="block px-3 py-2 text-sm text-slate-700 dark:text-[#D9D9D9] hover:text-slate-900 dark:hover:text-white font-medium"
            >
              Interactive Map
            </Link>
            <Link
              to={appPath('/app/bulk-validation')}
              className="block px-3 py-2 text-sm text-slate-700 dark:text-[#D9D9D9] hover:text-slate-900 dark:hover:text-white font-medium"
            >
              Bulk Address Validation
            </Link>
            <Link
              to="/features"
              className="block px-3 py-2 text-sm text-slate-700 dark:text-[#D9D9D9] hover:text-slate-900 dark:hover:text-white font-medium"
            >
              Features
            </Link>
            <Link
              to="/how-it-works"
              className="block px-3 py-2 text-sm text-slate-700 dark:text-[#D9D9D9] hover:text-slate-900 dark:hover:text-white font-medium"
            >
              How It Works
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 text-sm text-slate-700 dark:text-[#D9D9D9] hover:text-slate-900 dark:hover:text-white font-medium"
            >
              About POSTALIQ
            </Link>
            <Link
              to="/login"
              className="block px-3 py-2 text-sm text-slate-700 dark:text-[#D9D9D9] hover:text-slate-900 dark:hover:text-white font-medium"
            >
              Sign In (User Login)
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default PublicNavbar
