import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { PageTransition } from '@/components/animation/PageTransition'

export const PublicLayout: React.FC = () => {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#18191B] text-slate-900 dark:text-white selection:bg-[#A01D26] selection:text-white font-['Urbanist'] transition-colors duration-200">
      <PublicNavbar />
      <main className="flex-1 w-full">
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>
      <PublicFooter />
    </div>
  )
}

export default PublicLayout
