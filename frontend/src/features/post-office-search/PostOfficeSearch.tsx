import React, { useState, useEffect } from 'react'
import { Search, MapPin, Filter, ChevronLeft, ChevronRight, RefreshCw, X } from 'lucide-react'
import { api } from '@/services/api'
import { PostOffice, PostOfficeListResponse } from '@/types'

export const PostOfficeSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [districtFilter, setDistrictFilter] = useState('')
  const [deliveryFilter, setDeliveryFilter] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<PostOfficeListResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | number | null>(null)

  // Autocomplete suggestions
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const fetchRecords = async () => {
    setLoading(true)
    setError(null)
    try {
      const resp = await api.searchPostOffices({
        q: searchTerm.trim() || undefined,
        state: stateFilter.trim() || undefined,
        district: districtFilter.trim() || undefined,
        delivery_status: deliveryFilter || undefined,
        page,
        size: 15,
      })
      setData(resp)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch postal records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [page, stateFilter, districtFilter, deliveryFilter])

  // Handle autocomplete
  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      api
        .autocomplete(searchTerm.trim())
        .then((items) => setSuggestions(items))
        .catch(() => setSuggestions([]))
    } else {
      setSuggestions([])
    }
  }, [searchTerm])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowSuggestions(false)
    setPage(1)
    fetchRecords()
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setStateFilter('')
    setDistrictFilter('')
    setDeliveryFilter('')
    setPage(1)
  }

  return (
    <div className="space-y-8 font-['Urbanist']">
      {/* Editorial Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Postal Directory
        </h1>
        <p className="text-base text-slate-600 dark:text-[#D9D9D9] mt-2 max-w-2xl leading-relaxed">
          Search and query the authoritative India Post gazette directory by PIN code, office name, district, or delivery status with verified provenance.
        </p>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white dark:bg-[#1B1C1D] rounded-[30px] border border-slate-200 dark:border-white/20 p-6 sm:p-7 shadow-xl dark:shadow-2xl space-y-4 transition-colors">
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 dark:text-[#D9D9D9]/60 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search by 6-digit PIN code, post office name, or locality..."
                className="w-full pl-11 pr-4 py-3 text-sm rounded-full border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#141415] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#D9D9D9]/40 focus:outline-none focus:border-[#A01D26]"
              />
            </div>
            <button
              type="submit"
              className="btn-hitit-primary h-[47px] px-7 text-xs shrink-0"
            >
              Search Directory
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1B1C1D] rounded-2xl border border-slate-200 dark:border-white/20 shadow-2xl z-30 overflow-hidden max-h-64 overflow-y-auto">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSearchTerm(s.label)
                    setShowSuggestions(false)
                    setPage(1)
                  }}
                  className="w-full px-5 py-3 text-left text-xs hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-between border-b border-slate-100 dark:border-white/10 last:border-0 transition-colors cursor-pointer"
                >
                  <span className="font-bold text-slate-900 dark:text-white">{s.label}</span>
                  <span className="text-slate-500 dark:text-[#D9D9D9]/60">{s.district}, {s.state}</span>
                </button>
              ))}
            </div>
          )}
        </form>

        {/* Secondary Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#D9D9D9]/70 mb-1">State / UT</label>
            <input
              type="text"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              placeholder="e.g. Karnataka"
              className="w-full px-4 py-2 text-xs rounded-full border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#141415] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#D9D9D9]/40 focus:outline-none focus:border-[#A01D26]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#D9D9D9]/70 mb-1">District</label>
            <input
              type="text"
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              placeholder="e.g. Bengaluru Urban"
              className="w-full px-4 py-2 text-xs rounded-full border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#141415] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#D9D9D9]/40 focus:outline-none focus:border-[#A01D26]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#D9D9D9]/70 mb-1">Delivery Status</label>
            <select
              value={deliveryFilter}
              onChange={(e) => setDeliveryFilter(e.target.value)}
              className="w-full px-4 py-2 text-xs rounded-full border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#141415] text-slate-900 dark:text-white focus:outline-none focus:border-[#A01D26] cursor-pointer"
            >
              <option value="" className="bg-white dark:bg-[#1B1C1D] text-slate-900 dark:text-white">All Statuses</option>
              <option value="Delivery" className="bg-white dark:bg-[#1B1C1D] text-slate-900 dark:text-white">Delivery Only</option>
              <option value="Non-Delivery" className="bg-white dark:bg-[#1B1C1D] text-slate-900 dark:text-white">Non-Delivery</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleClearFilters}
              className="btn-hitit-secondary h-[38px] w-full text-xs font-semibold"
            >
              <X className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Table Panel */}
      <div className="bg-white dark:bg-[#1B1C1D] rounded-[30px] border border-slate-200 dark:border-white/20 shadow-xl dark:shadow-2xl overflow-hidden transition-colors">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between text-xs text-slate-600 dark:text-[#D9D9D9]">
          <span>Matching Records: <strong className="text-slate-900 dark:text-white font-mono font-bold">{data?.total || 0}</strong></span>
          {loading && <RefreshCw className="w-4 h-4 animate-spin text-[#A01D26]" />}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#141415] text-slate-600 dark:text-[#D9D9D9] font-extrabold uppercase tracking-wider border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="px-5 py-3.5">PIN Code</th>
                <th className="px-5 py-3.5">Post Office Name</th>
                <th className="px-5 py-3.5">Office Type</th>
                <th className="px-5 py-3.5">Delivery Status</th>
                <th className="px-5 py-3.5">Locality</th>
                <th className="px-5 py-3.5">District</th>
                <th className="px-5 py-3.5">State</th>
                <th className="px-5 py-3.5">Coordinates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10 text-slate-700 dark:text-[#D9D9D9]">
              {data?.items && data.items.length > 0 ? (
                data.items.map((po) => {
                  const isSelected = selectedId === po.id
                  return (
                    <tr
                      key={po.id}
                      onClick={() => setSelectedId(po.id)}
                      className={`hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                        isSelected ? 'bg-slate-100 dark:bg-white/10' : ''
                      }`}
                    >
                      <td className="px-5 py-3.5 font-mono font-bold text-[#A01D26] text-sm">
                        {po.pin_code}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white text-sm">
                        {po.post_office_name}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 dark:text-[#D9D9D9]/80 font-medium">{po.office_type}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            po.delivery_status === 'Delivery'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-[#D9D9D9] border-slate-200 dark:border-white/15'
                          }`}
                        >
                          {po.delivery_status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-[#D9D9D9]/90">{po.locality}</td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-[#D9D9D9]/90">{po.district}</td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-[#D9D9D9]/90">{po.state}</td>
                      <td className="px-5 py-3.5 text-[11px] font-mono text-slate-400 dark:text-[#D9D9D9]/60">
                        {po.has_verified_coords && po.latitude && po.longitude
                          ? `${po.latitude.toFixed(3)}, ${po.longitude.toFixed(3)}`
                          : 'Unverified'}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400 dark:text-[#D9D9D9]/60">
                    {loading ? 'Querying postal records...' : 'No postal records found matching the current query.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {data && data.total_pages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs text-slate-600 dark:text-[#D9D9D9]">
            <span>
              Page <strong className="text-slate-900 dark:text-white">{data.page}</strong> of <strong className="text-slate-900 dark:text-white">{data.total_pages}</strong>
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="btn-hitit-secondary h-8 px-4 text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <button
                disabled={page >= data.total_pages}
                onClick={() => setPage(page + 1)}
                className="btn-hitit-secondary h-8 px-4 text-xs"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
