// Search screen — white premium live search
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import TransactionItem from '../components/cards/TransactionItem'
import EmptyState from '../components/shared/EmptyState'
import ToastMessage from '../components/shared/ToastMessage'
import { useExpenses } from '../hooks/useExpenses'
import { useSettingsStore } from '../store/settingsStore'
import { CATEGORIES } from '../constants/categories'
import { useNavigate } from 'react-router-dom'

const SORT_OPTIONS = ['Newest', 'Oldest', 'Most', 'Least']
const S = { fontFamily: "'Nunito', sans-serif" }

export default function SearchScreen() {
  const navigate = useNavigate()
  const { expenses, deleteExpense, restoreExpense } = useExpenses()
  const { settings } = useSettingsStore()
  const currency = settings?.currency || 'USD'
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [sort, setSort] = useState('Newest')
  const [toast, setToast] = useState(null)

  const results = useMemo(() => {
    let exps = expenses
    if (query) {
      const q = query.toLowerCase()
      exps = exps.filter(e =>
        (e.shopName || '').toLowerCase().includes(q) ||
        (e.note || '').toLowerCase().includes(q) ||
        (e.category || '').toLowerCase().includes(q)
      )
    }
    if (activeCategory !== 'all') exps = exps.filter(e => e.category === activeCategory)
    if (sort === 'Newest') exps = [...exps].sort((a, b) => new Date(b.date) - new Date(a.date))
    if (sort === 'Oldest') exps = [...exps].sort((a, b) => new Date(a.date) - new Date(b.date))
    if (sort === 'Most') exps = [...exps].sort((a, b) => b.amount - a.amount)
    if (sort === 'Least') exps = [...exps].sort((a, b) => a.amount - b.amount)
    return exps
  }, [expenses, query, activeCategory, sort])

  const handleDelete = async (id) => {
    const deleted = await deleteExpense(id)
    setToast({
      id: Date.now(), type: 'success', message: 'Deleted', duration: 4000,
      action: { label: 'Undo', fn: async () => { await restoreExpense(deleted); setToast(null) } }
    })
  }

  return (
    <div className="flex flex-col min-h-dvh mb-tab bg-white">
      {/* Search bar */}
      <div className="px-5 safe-top pt-6 pb-4 bg-white sticky top-0 z-20 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div
          className="flex items-center gap-3 px-5 py-4 rounded-[20px] transition-all hover:shadow-md"
          style={{ background: '#F8F7FF', border: '1px solid #F0F0F8' }}
        >
          <Search className="w-5 h-5 text-[var(--primary)] flex-shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by shop, note, category..."
            autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
            className="flex-1 bg-transparent text-[16px] font-[700] text-[#0F172A] outline-none placeholder-[#CBD5E1]"
            style={S}
          />
          {query.length > 0 && (
            <button onClick={() => setQuery('')} className="w-6 h-6 flex items-center justify-center rounded-full bg-[#E2E8F0]/30">
              <X className="w-3.5 h-3.5 text-[#64748B]" />
            </button>
          )}
        </div>
      </div>

      {/* Category filter chips */}
      <div className="flex gap-2.5 px-5 py-5 overflow-x-auto scrollbar-hide bg-white border-b border-[#F0F0F8]">
        {[{ id: 'all', name: 'Total', emoji: '✨' }, ...CATEGORIES].map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-[800] whitespace-nowrap flex-shrink-0 transition-all border"
            style={{
              background: activeCategory === cat.id ? '#F8F7FF' : '#FFFFFF',
              borderColor: activeCategory === cat.id ? 'var(--primary)' : '#F0F0F8',
              color: activeCategory === cat.id ? 'var(--primary)' : '#94A3B8',
              boxShadow: activeCategory === cat.id ? '0 4px 12px rgba(124,111,247,0.08)' : 'none',
              ...S
            }}>
            <span className="text-sm">{cat.emoji}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Sort row */}
      <div className="flex items-center gap-3 px-5 py-4 overflow-x-auto scrollbar-hide bg-[#F8F9FA]/30 border-b border-[#F0F0F8]">
        <div className="flex items-center gap-2 mr-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span className="text-[11px] font-[800] uppercase tracking-widest text-[#94A3B8] flex-shrink-0" style={S}>Sort</span>
        </div>
        <div className="flex gap-2">
          {SORT_OPTIONS.map(s => (
            <button key={s} onClick={() => setSort(s)}
              className="px-4 py-2 rounded-full text-[12px] font-[800] transition-all border"
              style={{
                background: sort === s ? 'var(--primary)' : '#FFFFFF',
                color: sort === s ? '#FFFFFF' : '#94A3B8',
                borderColor: sort === s ? 'var(--primary)' : '#F0F0F8',
                ...S
              }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 pt-4">
        {results.length === 0 ? (
          <EmptyState
            type="search"
            title="No results found"
            message={query ? `We couldn't find anything for "${query}".` : 'Start typing to find transactions.'}
          />
        ) : (
          <div className="pb-tab">
            <div className="flex items-center gap-2 px-5 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                <p className="text-[12px] font-[800] uppercase tracking-widest text-[#94A3B8]" style={S}>
                  {results.length} Matches Found
                </p>
            </div>
            <div className="flex flex-col">
              {results.map((exp, i) => (
                <TransactionItem key={exp.id} expense={exp} currency={currency} index={i}
                  onDelete={handleDelete} onEdit={() => navigate(`/add?edit=${exp.id}`)} />
              ))}
            </div>
          </div>
        )}
      </div>

      <ToastMessage toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
