import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { AppLayout } from '@/components/layout/AppLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'

// Public Marketing Pages
import { LandingPage } from '@/features/landing/LandingPage'
import { AboutPage } from '@/features/landing/AboutPage'
import { FeaturesPage } from '@/features/landing/FeaturesPage'
import { HowItWorksPage } from '@/features/landing/HowItWorksPage'
import { PrivacyPage } from '@/features/landing/PrivacyPage'
import { UserLoginPage } from '@/features/auth/UserLoginPage'
import { AdminLoginPage } from '@/features/auth/AdminLoginPage'

// User Postal Application Pages
import { AddressWorkspace } from '@/features/address-search/AddressWorkspace'
import { PostOfficeSearch } from '@/features/post-office-search/PostOfficeSearch'
import { InteractiveMapPage } from '@/features/map/InteractiveMapPage'
import { BulkValidation } from '@/features/bulk-validation/BulkValidation'
import { HistoryView } from '@/features/history/HistoryView'
import { SettingsView } from '@/features/settings/SettingsView'

// Administrator Application Pages
import { AdminDashboard } from '@/features/admin/AdminDashboard'

import { AlertTriangle, Compass } from 'lucide-react'

const queryClient = new QueryClient()

const NotFound: React.FC = () => (
  <div className="py-24 text-center space-y-5 max-w-md mx-auto font-['Urbanist']">
    <div className="w-14 h-14 rounded-full bg-[#A01D26]/20 text-[#A01D26] mx-auto flex items-center justify-center border border-[#A01D26]/40">
      <AlertTriangle className="w-7 h-7" />
    </div>
    <h2 className="text-2xl font-extrabold text-white">Page Not Found</h2>
    <p className="text-sm text-[#D9D9D9]/80">
      The requested postal intelligence resource does not exist in the routing table.
    </p>
    <div className="flex items-center justify-center gap-3 pt-2">
      <Link
        to="/"
        className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[#A01D26] hover:bg-[#85161E] transition-colors"
      >
        Homepage
      </Link>
      <Link
        to="/app/predict"
        className="px-5 py-2.5 rounded-full text-xs font-bold text-[#D9D9D9] hover:text-white border border-white/20 hover:bg-white/5 transition-colors inline-flex items-center gap-1.5"
      >
        <Compass className="w-3.5 h-3.5 text-[#A01D26]" />
        Predict Workspace
      </Link>
    </div>
  </div>
)

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* ==================================================== */}
      {/* 1. PUBLIC MARKETING WEBSITE (No Authentication Req) */}
      {/* ==================================================== */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/login" element={<UserLoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
      </Route>

      {/* ==================================================== */}
      {/* 2. USER POSTAL APPLICATION (Dedicated Workspace Shell) */}
      {/* ==================================================== */}
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Navigate to="/app/predict" replace />} />
        <Route path="predict" element={<AddressWorkspace />} />
        <Route path="directory" element={<PostOfficeSearch />} />
        <Route path="map" element={<InteractiveMapPage />} />
        <Route path="bulk-validation" element={<BulkValidation />} />
        <Route path="history" element={<HistoryView />} />
        <Route path="settings" element={<SettingsView />} />
      </Route>

      {/* Backward compatibility direct routes -> redirect to /app/* */}
      <Route path="/predict" element={<Navigate to="/app/predict" replace />} />
      <Route path="/search" element={<Navigate to="/app/directory" replace />} />
      <Route path="/map" element={<Navigate to="/app/map" replace />} />
      <Route path="/bulk" element={<Navigate to="/app/bulk-validation" replace />} />
      <Route path="/history" element={<Navigate to="/app/history" replace />} />
      <Route path="/settings" element={<Navigate to="/app/settings" replace />} />

      {/* ==================================================== */}
      {/* 3. ADMINISTRATOR APPLICATION (Protected Session Shell) */}
      {/* ==================================================== */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="analytics" element={<Navigate to="/admin" replace />} />
        <Route path="postal-records" element={<AdminDashboard />} />
        <Route path="feedback" element={<AdminDashboard />} />
        <Route path="dataset-management" element={<AdminDashboard />} />
      </Route>

      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
