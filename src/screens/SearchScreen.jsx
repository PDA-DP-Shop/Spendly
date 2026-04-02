// Search screen — white premium live search
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import TransactionItem from '../components/cards/TransactionItem'
import EmptyState from '../components/shared/EmptyState'
import ToastMessage from '../components/shared/ToastMessage'
import { useExpenses } from '../hooks/useExpenses'
import { useSettingsStore } from '../store/settingsStore'
import { CATEGORIES } from '../constants/categories'
import { useNavigate } from 'react-router-dom'

const SORT_OPTIONS = ['Newest', 'Oldest', 'Most', 'Least']
const S = { fontFamily: "'Plus Jakarta Sans', sans-serif" }

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
      <div className="px-5 safe-top pt-5 pb-3 bg-white" style={{ borderBottom: '1px solid #F0F0F8' }}>
        <div
          className="flex items-center gap-3 px-4 py-3.5 rounded-[16px] transition-all"
          style={{ background: '#F8F9FF', border: '1px solid #F0F0F8' }}
        >
          <Search className="w-5 h-5 text-[#94A3B8] flex-shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search expenses, notes, categories..."
            autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
            className="flex-1 bg-transparent text-[15px] font-medium text-[#0F172A] outline-none placeholder-[#CBD5E1]"
            style={S}
          />
          {query.length > 0 && (
            <button onClick={() => setQuery('')} className="p-1">
              <X className="w-4 h-4 text-[#94A3B8]" />
            </button>
          )}
        </div>
      </div>

      {/* Category filter chips */}
      <div className="flex gap-2 px-5 py-3 overflow-x-auto scrollbar-hide" style={{ borderBottom: '1px solid #F0F0F8' }}>
        {[{ id: 'all', name: 'All', emoji: '✨' }, ...CATEGORIES].map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap flex-shrink-0 transition-all"
            style={{
              background: activeCategory === cat.id ? '#EEF2FF' : '#FFFFFF',
              border: `1px solid ${activeCategory === cat.id ? '#6366F1' : '#E2E8F0'}`,
              color: activeCategory === cat.id ? '#6366F1' : '#64748B',
              ...S
            }}>
            <span className="text-sm">{cat.emoji}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Sort row */}
      <div className="flex items-center gap-3 px-5 py-3 overflow-x-auto scrollbar-hide" style={{ borderBottom: '1px solid #F0F0F8' }}>
        <span className="text-[12px] font-semibold uppercase tracking-wider text-[#94A3B8] flex-shrink-0" style={S}>Sort:</span>
        <div className="flex gap-2">
          {SORT_OPTIONS.map(s => (
            <button key={s} onClick={() => setSort(s)}
              className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all"
              style={{
                background: sort === s ? '#EEF2FF' : 'transparent',
                color: sort === s ? '#6366F1' : '#94A3B8',
                border: `1px solid ${sort === s ? 'rgba(99,102,241,0.3)' : 'transparent'}`,
                ...S
              }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 pt-3">
        {results.length === 0 ? (
          <EmptyState
            type="search"
            title="No matches found"
            message={query ? `Nothing found for "${query}". Try different keywords.` : 'Search your expenses.'}
          />
        ) : (
          <div className="pb-tab">
            <p className="px-5 mb-3 text-[12px] font-semibold uppercase tracking-wider text-[#94A3B8]" style={S}>
              {results.length} result{results.length !== 1 ? 's' : ''}
            </p>
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
