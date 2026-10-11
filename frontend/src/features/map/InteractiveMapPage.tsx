import React, { useState, useEffect } from 'react'
import { MapPin, Search, Compass, Info, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import { api } from '@/services/api'
import { PostOffice } from '@/types'
import { PostalMap } from '@/components/common/PostalMap'

export const InteractiveMapPage: React.FC = () => {
  const [postOffices, setPostOffices] = useState<PostOffice[]>([])
  const [selectedOffice, setSelectedOffice] = useState<PostOffice | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = () => {
    setLoading(true)
    setError(null)
    api
      .searchPostOffices({ size: 100 })
      .then((res) => {
        setPostOffices(res.items)
        if (res.items.length > 0) {
          const verified = res.items.find((p) => p.has_verified_coords)
          if (verified) setSelectedOffice(verified)
        }
      })
      .catch((err) => {
        setError(err.message || 'Unable to connect to postal intelligence engine')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredOffices = postOffices.filter((p) => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    return (
      p.post_office_name.toLowerCase().includes(term) ||
      p.pin_code.includes(term) ||
      p.locality.toLowerCase().includes(term) ||
      p.district.toLowerCase().includes(term) ||
      p.state.toLowerCase().includes(term)
    )
  })

  return (
    <div className="space-y-8 font-['Urbanist']">
      {/* Editorial Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Postal Network
        </h1>
        <p className="text-base text-slate-600 dark:text-[#D9D9D9] mt-2 max-w-2xl leading-relaxed">
          Explore verified coordinate benchmarks across major delivery circles. Markers indicate surveyed post offices.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Directory & Node Selection (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1B1C1D] rounded-[30px] border border-slate-200 dark:border-white/20 p-5 sm:p-6 shadow-xl dark:shadow-2xl flex flex-col h-[650px] transition-colors">
          <div className="relative mb-4">
            <Search className="w-4 h-4 text-slate-400 dark:text-[#D9D9D9]/60 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by city, PIN, district..."
              className="w-full pl-11 pr-4 py-2.5 text-xs rounded-full border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#141415] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#D9D9D9]/40 focus:outline-none focus:border-[#A01D26]"
            />
          </div>

          {/* Postal-node list */}
          <div className="flex-1 overflow-y-auto space-y-2.5 p-1 pr-2.5">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-xs text-slate-500 dark:text-[#D9D9D9]/70 space-y-3">
                <RefreshCw className="w-5 h-5 text-[#A01D26] animate-spin" />
                <span>Loading verified postal survey nodes...</span>
              </div>
            ) : error ? (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-[#A01D26]/10 border border-amber-200 dark:border-[#A01D26]/30 text-xs space-y-2.5 my-4">
                <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-[#FF6B6B]">
                  <AlertCircle className="w-4 h-4 text-[#A01D26]" />
                  <span>Connection Notice</span>
                </div>
                <p className="text-slate-600 dark:text-[#D9D9D9]/80 text-[11px] leading-relaxed">
                  {error}
                </p>
                <button
                  onClick={loadData}
                  className="px-3 py-1.5 rounded-full bg-[#A01D26] text-white font-bold text-[10px] inline-flex items-center gap-1.5 hover:bg-[#85161E] transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry Connection</span>
                </button>
              </div>
            ) : filteredOffices.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400 dark:text-[#D9D9D9]/60">
                {searchTerm ? `No post offices matching "${searchTerm}".` : 'No post offices found.'}
              </div>
            ) : (
              filteredOffices.map((po) => {
                const isSelected = selectedOffice?.id === po.id
                return (
                  <button
                    key={po.id}
                    onClick={() => setSelectedOffice(po)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all text-xs flex flex-col gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-red-50/50 dark:bg-[#A01D26]/10 border-[#A01D26] shadow-sm'
                        : 'bg-slate-50 dark:bg-[#141415] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#A01D26] text-sm">
                        {po.pin_code}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-white border border-slate-300 dark:border-white/15">
                        {po.delivery_status}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {po.post_office_name}
                    </div>
                    <div className="text-slate-500 dark:text-[#D9D9D9]/70 text-[11px]">
                      {po.locality}, {po.district}, {po.state}
                    </div>
                  </button>
                )
              })
            )}
          </div>

          <div className="pt-3 mt-2 border-t border-slate-200 dark:border-white/10 text-[11px] text-slate-500 dark:text-[#D9D9D9]/70 flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-[#A01D26] shrink-0" />
            <span>Select any postal node to zoom and focus map coordinates.</span>
          </div>
        </div>

        {/* Right Side: Map Container & Selected Node (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="h-[520px] rounded-[30px] overflow-hidden border border-slate-200 dark:border-white/20 shadow-xl dark:shadow-2xl">
            <PostalMap
              postOffices={filteredOffices}
              selectedOffice={selectedOffice}
              height="520px"
              interactive={true}
              onSelectOffice={(po) => setSelectedOffice(po)}
            />
          </div>

          {/* Selected Post Office Card */}
          {selectedOffice && (
            <div className="p-5 rounded-[24px] bg-white dark:bg-[#1B1C1D] border border-slate-200 dark:border-white/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xl font-black text-[#A01D26]">
                    PIN {selectedOffice.pin_code}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white font-semibold">
                    {selectedOffice.office_type}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white border border-slate-200 dark:border-white/20">
                    {selectedOffice.delivery_status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {selectedOffice.post_office_name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#D9D9D9]">
                  {selectedOffice.locality}, {selectedOffice.district}, {selectedOffice.state}
                </p>
              </div>

              {selectedOffice.has_verified_coords && selectedOffice.latitude && selectedOffice.longitude && (
                <div className="text-left sm:text-right shrink-0">
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Centroid
                  </span>
                  <div className="text-xs font-mono text-slate-500 dark:text-white/70 mt-0.5">
                    Lat: {selectedOffice.latitude.toFixed(4)}, Lng: {selectedOffice.longitude.toFixed(4)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
