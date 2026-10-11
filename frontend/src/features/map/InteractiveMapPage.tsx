import React, { useState, useEffect } from 'react'
import { MapPin, Search, Compass, Info, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import { api } from '@/services/api'
import { PostOffice, NetworkDot } from '@/types'
import { PostalMap } from '@/components/common/PostalMap'

export const InteractiveMapPage: React.FC = () => {
  const [postOffices, setPostOffices] = useState<PostOffice[]>([])
  const [networkDots, setNetworkDots] = useState<NetworkDot[]>([])
  const [selectedOffice, setSelectedOffice] = useState<PostOffice | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 1. Load nationwide postal network dots covering all 154,797 offices
  useEffect(() => {
    api
      .getNetworkDots()
      .then((dots) => setNetworkDots(dots))
      .catch((err) => console.warn('Could not load nationwide network dots:', err))
  }, [])

  // 2. Load postal directory records based on search query
  const loadData = (query: string) => {
    setLoading(true)
    setError(null)
    api
      .searchPostOffices({
        q: query.trim() || undefined,
        size: 50,
      })
      .then((res) => {
        setPostOffices(res.items)
        if (res.items.length > 0) {
          // If searching, automatically select the first matching office as the focused point
          if (query.trim()) {
            setSelectedOffice(res.items[0])
          } else {
            setSelectedOffice((prev) => {
              if (prev && res.items.some((p) => p.id === prev.id)) {
                return prev
              }
              return res.items[0]
            })
          }
        } else {
          setSelectedOffice(null)
        }
      })
      .catch((err) => {
        setError(err.message || 'Unable to connect to postal intelligence engine')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(searchTerm)
    }, 250)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const totalOffices = networkDots.reduce((acc, d) => acc + d.count, 0) || 154797

  return (
    <div className="space-y-8 font-['Urbanist']">
      {/* Editorial Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Postal Network
        </h1>
        <p className="text-base text-slate-600 dark:text-[#D9D9D9] mt-2 max-w-2xl leading-relaxed">
          Complete nationwide postal coverage across all 36 Indian states and union territories. Explore the full {totalOffices.toLocaleString()} postal node grid.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: All India Directory & Search (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1B1C1D] rounded-[30px] border border-slate-200 dark:border-white/20 p-5 sm:p-6 shadow-xl dark:shadow-2xl flex flex-col h-[650px] transition-colors">
          {/* Header indicator */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A01D26] animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">
                All India Directory
              </span>
            </div>
            <span className="font-mono text-[11px] font-bold text-[#A01D26] px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
              154,797 Nodes
            </span>
          </div>

          {/* Search bar */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-400 dark:text-[#D9D9D9]/60 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by PIN, city, district..."
              className="w-full pl-11 pr-4 py-2.5 text-xs rounded-full border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#141415] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#D9D9D9]/40 focus:outline-none focus:border-[#A01D26]"
            />
          </div>

          {/* Postal-node list */}
          <div className="flex-1 overflow-y-auto space-y-2.5 p-1 pr-2.5">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-xs text-slate-500 dark:text-[#D9D9D9]/70 space-y-3">
                <RefreshCw className="w-5 h-5 text-[#A01D26] animate-spin" />
                <span>Searching postal network...</span>
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
                  onClick={() => loadData(searchTerm)}
                  className="px-3 py-1.5 rounded-full bg-[#A01D26] text-white font-bold text-[10px] inline-flex items-center gap-1.5 hover:bg-[#85161E] transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry Connection</span>
                </button>
              </div>
            ) : postOffices.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400 dark:text-[#D9D9D9]/60">
                {searchTerm ? `No post offices matching "${searchTerm}".` : 'No post offices found.'}
              </div>
            ) : (
              postOffices.map((po) => {
                const isSelected = selectedOffice?.id === po.id
                return (
                  <button
                    key={po.id}
                    onClick={() => setSelectedOffice(po)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all text-xs flex flex-col gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-red-50/50 dark:bg-[#A01D26]/15 border-[#FF1E28] ring-1 ring-[#FF1E28]/40 shadow-sm'
                        : 'bg-slate-50 dark:bg-[#141415] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#A01D26] text-sm">
                        {po.pin_code}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-white border border-slate-300 dark:border-white/15">
                          {po.delivery_status}
                        </span>
                      </div>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {po.post_office_name}
                    </div>
                    <div className="text-slate-500 dark:text-[#D9D9D9]/70 text-[11px]">
                      {po.locality ? po.locality + ', ' : ''}{po.district}, {po.state}
                    </div>
                  </button>
                )
              })
            )}
          </div>

          <div className="pt-3 mt-2 border-t border-slate-200 dark:border-white/10 text-[11px] text-slate-500 dark:text-[#D9D9D9]/70 flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-[#A01D26] shrink-0" />
            <span>Search or select any post office to pinpoint it on the map.</span>
          </div>
        </div>

        {/* Right Side: Map Container & Selected Node (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="h-[520px] rounded-[30px] overflow-hidden border border-slate-200 dark:border-white/20 shadow-xl dark:shadow-2xl">
            <PostalMap
              postOffices={postOffices}
              selectedOffice={selectedOffice}
              networkDots={networkDots}
              height="520px"
              interactive={true}
              onSelectOffice={(po) => setSelectedOffice(po)}
              onSelectNetworkDot={(dot) => {
                setSearchTerm(dot.district)
              }}
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
                  {selectedOffice.locality ? selectedOffice.locality + ', ' : ''}{selectedOffice.district}, {selectedOffice.state}
                </p>
              </div>

              {selectedOffice.latitude && selectedOffice.longitude && (
                <div className="text-left sm:text-right shrink-0">
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#FF1E28] font-bold">
                    <div className="w-2 h-2 rounded-full bg-[#FF1E28] animate-ping" />
                    Searched Point
                  </span>
                  <div className="text-xs font-mono text-slate-500 dark:text-white/70 mt-0.5">
                    {selectedOffice.latitude.toFixed(4)}, {selectedOffice.longitude.toFixed(4)}
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

