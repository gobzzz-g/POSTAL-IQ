import React, { useState } from 'react'
import {
  UploadCloud,
  FileText,
  Download,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Filter,
  ArrowRight,
  Check,
} from 'lucide-react'
import { api } from '@/services/api'
import { motion } from 'motion/react'
import { BatchJobStatus, BatchRecordResult } from '@/types'

export const BulkValidation: React.FC = () => {
  const [file, setFile] = useState<File | null>(null)
  const [addressCol, setAddressCol] = useState('address')
  const [previewRows, setPreviewRows] = useState<string[][]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [jobStatus, setJobStatus] = useState<BatchJobStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'matched' | 'ambiguous' | 'unmatched'>('all')

  const currentStep = jobStatus ? 4 : isUploading ? 3 : file ? 2 : 1

  const processFile = (selectedFile: File) => {
    setError(null)
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a valid .csv file.')
      return
    }

    setFile(selectedFile)

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n').filter((l) => l.trim().length > 0)
      if (lines.length > 0) {
        const parsedHeaders = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''))
        setHeaders(parsedHeaders)
        
        const foundCol = parsedHeaders.find((h) =>
          /address|addr|location|street/i.test(h)
        )
        if (foundCol) {
          setAddressCol(foundCol)
        } else {
          setAddressCol(parsedHeaders[0])
        }

        const sample = lines.slice(1, 6).map((l) => l.split(',').map((c) => c.trim().replace(/^["']|["']$/g, '')))
        setPreviewRows(sample)
      }
    }
    reader.readAsText(selectedFile)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) processFile(selectedFile)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) processFile(droppedFile)
  }

  const handleStartProcessing = async () => {
    if (!file) return
    setIsUploading(true)
    setError(null)
    setJobStatus(null)

    try {
      const resp = await api.uploadBatchCsv(file, addressCol)
      setJobStatus(resp)
    } catch (err: any) {
      setError(err.message || 'Error executing bulk validation job.')
    } finally {
      setIsUploading(false)
    }
  }

  const filteredResults = jobStatus?.results.filter((r) => {
    if (statusFilter === 'all') return true
    return r.status === statusFilter
  }) || []

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-['Urbanist']">
      {/* Editorial Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Bulk Address Validation
        </h1>
        <p className="text-base text-slate-600 dark:text-[#D9D9D9] mt-2 max-w-2xl leading-relaxed">
          Upload CSV address batches to predict official PIN codes and post offices with high-throughput local ML ranking and verification.
        </p>
      </div>

      {/* Operational Step Indicator */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        {[
          { step: 1, label: 'Upload CSV' },
          { step: 2, label: 'Map Columns' },
          { step: 3, label: 'Validate' },
          { step: 4, label: 'Review & Export' },
        ].map((s) => {
          const isActive = currentStep === s.step
          const isDone = currentStep > s.step
          return (
            <div
              key={s.step}
              className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
                isActive
                  ? 'bg-slate-100 dark:bg-white/10 border-slate-300 dark:border-white/40 shadow-sm'
                  : isDone
                  ? 'bg-white dark:bg-[#1B1C1D] border-slate-200 dark:border-white/20 text-slate-700 dark:text-[#D9D9D9]'
                  : 'bg-slate-50 dark:bg-[#141415] border-slate-200 dark:border-white/10 text-slate-400 dark:text-[#D9D9D9]/40'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  isActive
                    ? 'bg-[#A01D26] text-white'
                    : isDone
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-200 dark:bg-white/5 text-slate-500 dark:text-[#D9D9D9]/40'
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : s.step}
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white tracking-[0.5px]">
                {s.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Upload & Configuration Card */}
      <div className="bg-white dark:bg-[#1B1C1D] rounded-[30px] border border-slate-200 dark:border-white/20 p-6 sm:p-8 shadow-xl dark:shadow-2xl space-y-6 transition-colors">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-slate-400 dark:hover:border-white/50 rounded-[24px] p-8 sm:p-10 text-center transition-colors bg-slate-50/70 dark:bg-[#141415]/50"
        >
          <UploadCloud className="w-12 h-12 text-[#A01D26] mx-auto mb-3" />
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            Choose CSV Address File or Drag and Drop
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#D9D9D9]/70 max-w-sm mx-auto mt-1 mb-5 leading-relaxed">
            Supports UTF-8 CSV up to 5MB and 500 address rows per batch. Addresses are processed locally without third-party tracking.
          </p>

          <input
            type="file"
            id="csv-file-input"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="csv-file-input"
            className="btn-hitit-primary inline-flex cursor-pointer text-xs h-11 px-7"
          >
            <FileText className="w-4 h-4 text-white dark:text-[#A01D26]" />
            <span>{file ? file.name : 'Select CSV File'}</span>
          </label>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-[#A01D26]/10 dark:bg-[#A01D26]/15 border border-[#A01D26]/30 dark:border-[#A01D26]/40 text-[#A01D26] dark:text-white text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[#A01D26] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Preview & Column selector */}
        {file && headers.length > 0 && (
          <div className="space-y-5 pt-4 border-t border-slate-200 dark:border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#D9D9D9]/80 mb-1">
                  Select Address Field Column
                </label>
                <select
                  value={addressCol}
                  onChange={(e) => setAddressCol(e.target.value)}
                  className="px-4 py-2.5 text-xs rounded-full border border-slate-200 dark:border-white/20 bg-slate-50 dark:bg-[#141415] text-slate-900 dark:text-white focus:outline-none focus:border-[#A01D26] cursor-pointer"
                >
                  {headers.map((h, i) => (
                    <option key={i} value={h} className="bg-white dark:bg-[#1B1C1D] text-slate-900 dark:text-white">
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleStartProcessing}
                disabled={isUploading}
                className="btn-hitit-primary h-11 px-7 text-xs font-bold shrink-0"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white dark:text-[#A01D26]" />
                    <span>Processing Address Batch...</span>
                  </>
                ) : (
                  <>
                    <span>Start Batch Validation</span>
                    <ArrowRight className="w-4 h-4 text-white dark:text-[#A01D26]" />
                  </>
                )}
              </button>
            </div>

            {/* Preview Sample Table */}
            {previewRows.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#D9D9D9]/70 block mb-2">
                  Sample Preview (First 5 Rows)
                </span>
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/15">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-[#141415] font-extrabold uppercase text-slate-600 dark:text-[#D9D9D9] border-b border-slate-200 dark:border-white/10">
                      <tr>
                        {headers.map((h, i) => (
                          <th key={i} className="px-4 py-2.5">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/10 text-slate-700 dark:text-[#D9D9D9]">
                      {previewRows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="px-4 py-2.5 truncate max-w-xs">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Batch Job Results */}
      {jobStatus && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white dark:bg-[#1B1C1D] rounded-[30px] border border-slate-200 dark:border-white/20 p-6 sm:p-8 shadow-xl dark:shadow-2xl space-y-6 transition-colors"
        >
          {/* Summary Metric Counters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                Batch Processing Complete
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#D9D9D9]/80 mt-1">
                File: <strong className="text-slate-900 dark:text-white">{jobStatus.filename}</strong> • {jobStatus.total_records} addresses processed
              </p>
            </div>

            <a
              href={api.getBatchDownloadUrl(jobStatus.job_id)}
              className="btn-hitit-primary h-10 px-6 text-xs inline-flex shrink-0"
              download
            >
              <Download className="w-4 h-4 text-white dark:text-[#A01D26]" />
              <span>Download Validated CSV</span>
            </a>
          </div>

          {/* Counts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#141415] border border-slate-200 dark:border-white/10 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#D9D9D9]/70 block">Total Processed</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{jobStatus.total_records}</span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">Matched (High Conf)</span>
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1 block">{jobStatus.matched_count}</span>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 block">Ambiguous (Review)</span>
              <span className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1 block">{jobStatus.ambiguous_count}</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#A01D26]/10 dark:bg-[#A01D26]/15 border border-[#A01D26]/30 dark:border-[#A01D26]/40 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#A01D26] block">Unmatched / Refused</span>
              <span className="text-2xl font-black text-[#A01D26] mt-1 block">{jobStatus.unmatched_count}</span>
            </div>
          </div>

          {/* Result Filter Tabs */}
          <div className="flex flex-wrap gap-2 text-xs">
            {(['all', 'matched', 'ambiguous', 'unmatched'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-4 py-2 rounded-full capitalize font-bold tracking-[0.5px] transition-all cursor-pointer ${
                  statusFilter === filter
                    ? 'bg-[#A01D26] text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-[#141415] border border-slate-200 dark:border-white/15 text-slate-700 dark:text-[#D9D9D9] hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Detailed Results Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/15">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#141415] text-slate-600 dark:text-[#D9D9D9] font-extrabold uppercase tracking-wider border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="px-4 py-3">Row</th>
                  <th className="px-4 py-3">Original Address</th>
                  <th className="px-4 py-3">Predicted PIN</th>
                  <th className="px-4 py-3">Post Office</th>
                  <th className="px-4 py-3">District</th>
                  <th className="px-4 py-3">Confidence</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Alternative / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/10 text-slate-700 dark:text-[#D9D9D9]">
                {filteredResults.map((rec) => (
                  <tr key={rec.row_index} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-400 dark:text-[#D9D9D9]/50">{rec.row_index}</td>
                    <td className="px-4 py-3 max-w-xs truncate text-slate-900 dark:text-white font-medium">{rec.original_address}</td>
                    <td className="px-4 py-3 font-mono font-bold text-[#A01D26] text-sm">
                      {rec.predicted_pin || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">{rec.post_office_name || '—'}</td>
                    <td className="px-4 py-3">{rec.district || '—'}</td>
                    <td className="px-4 py-3 font-mono">
                      {rec.confidence ? `${rec.confidence.toFixed(1)}%` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          rec.status === 'matched'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : rec.status === 'ambiguous'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            : 'bg-[#A01D26]/10 dark:bg-[#A01D26]/20 text-[#A01D26] dark:text-white border-[#A01D26]/30 dark:border-[#A01D26]/50'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-[#D9D9D9]/70 max-w-xs truncate">
                      {rec.suggested_alternative || rec.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  )
}
