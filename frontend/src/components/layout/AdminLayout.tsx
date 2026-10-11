import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import {
  ShieldCheck,
  BarChart3,
  Database,
  FileCheck,
  LogOut,
  Layers,
  Activity,
  Menu,
  X,
  ArrowLeft,
  Lock,
} from 'lucide-react'
import { getAdminToken, setAdminToken } from '@/services/api'
import { PageTransition } from '@/components/animation/PageTransition'

export const AdminLayout: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const token = getAdminToken()

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
    { to: '/admin/analytics', label: 'Analytics & Models', icon: BarChart3 },
    { to: '/admin/postal-records', label: 'Postal Records', icon: Database },
    { to: '/admin/feedback', label: 'Feedback Queue', icon: FileCheck },
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
              <span className="text-xl font-extrabold tracking-tight text-white font-['Urbanist']">
                POSTAL<span className="text-[#A01D26]">IQ</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#A01D26]/20 text-[#A01D26] border border-[#A01D26]/40">
                ADMIN
              </span>
            </div>
            <p className="text-[11px] text-[#D9D9D9]/70 font-medium leading-tight mt-0.5">
              Postal Administration Console
            </p>
          </div>
        </Link>

        {/* Exit to Public Website */}
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-semibold text-[#D9D9D9]/60 hover:text-white transition-colors px-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Public Website</span>
        </Link>

        {/* Divider */}
        <div className="h-px bg-white/10" />

        {/* Admin Navigation */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#D9D9D9]/40 px-3.5 mb-2">
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
                      : 'text-[#D9D9D9] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      active ? 'text-white' : 'text-[#D9D9D9]/60'
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Bottom: Admin Session Info & Sign Out */}
      <div className="pt-6 mt-6 border-t border-white/10 space-y-4">
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Lock className="w-3.5 h-3.5 text-[#A01D26]" />
            <span>Administrator (admin)</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-mono">
            JWT Session Active
          </div>
        </div>

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
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#141517] text-white selection:bg-[#A01D26] selection:text-white font-['Urbanist']">
      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden lg:flex w-72 h-screen sticky top-0 flex-col bg-[#1B1C1D] border-r border-white/10 p-6 z-40 shrink-0">
        {navContent}
      </aside>

      {/* Mobile Top Navigation Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-[#18191B]/95 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#A01D26] text-white flex items-center justify-center font-bold shadow-sm">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-white font-['Urbanist']">
            POSTAL<span className="text-[#A01D26]">IQ</span> ADMIN
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-white hover:bg-white/10 cursor-pointer"
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
          <div className="relative w-80 max-w-[85vw] h-full bg-[#1B1C1D] border-r border-white/10 p-6 z-50 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
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
    </div>
  )
}
