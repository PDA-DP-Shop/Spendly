// Search screen — live search with category filter, sort, and amount range
import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import TopHeader from '../components/shared/TopHeader'
import TransactionItem from '../components/cards/TransactionItem'
import EmptyState from '../components/shared/EmptyState'
import ToastMessage from '../components/shared/ToastMessage'
import { useExpenses } from '../hooks/useExpenses'
import { useSettingsStore } from '../store/settingsStore'
import { CATEGORIES } from '../constants/categories'
import { useNavigate } from 'react-router-dom'

const SORT_OPTIONS = ['Newest', 'Oldest', 'Most', 'Least']

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
    setToast({ id: Date.now(), type: 'success', message: 'Deleted', duration: 4000,
      action: { label: 'Undo', fn: async () => { await restoreExpense(deleted); setToast(null) } } })
  }

  return (
    <div className="flex flex-col min-h-dvh mb-tab">
      {/* Search bar */}
      <div className="px-6 safe-top pt-6 pb-4">
        <div className="flex items-center gap-4 glass-elevated border-white/5 rounded-2xl px-5 py-4 shadow-glowLg transition-all duration-300 focus-within:border-cyan-glow/30 focus-within:shadow-glow">
          <Search className="w-5 h-5 text-[#3D4F70] flex-shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search records, categories, notes..."
            autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
            className="flex-1 bg-transparent text-[16px] font-body font-medium text-[#F0F4FF] outline-none placeholder-[#3D4F70]"
          />
          {query.length > 0 && (
            <button onClick={() => setQuery('')} className="p-1 hover:bg-white/5 rounded-lg transition-colors">
              <X className="w-4 h-4 text-[#7B8DB0]" />
            </button>
          )}
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-3 px-6 pb-4 overflow-x-auto scrollbar-hide">
        {[{ id: 'all', name: 'All', emoji: '🌟' }, ...CATEGORIES].map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-body font-bold whitespace-nowrap border transition-all duration-300 ${
              activeCategory === cat.id 
                ? 'bg-cyan-dim border-cyan-glow/30 text-cyan-glow shadow-glowSmall' 
                : 'glass border-transparent text-[#7B8DB0] hover:bg-white/5'
            }`}>
            <span className="text-sm">{cat.emoji}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Sort row */}
      <div className="flex items-center gap-3 px-6 pb-5 overflow-x-auto scrollbar-hide mt-1">
        <span className="text-[12px] font-display font-bold text-[#3D4F70] uppercase tracking-widest flex-shrink-0">Filter:</span>
        <div className="flex items-center gap-2">
          {SORT_OPTIONS.map(s => (
            <button key={s} onClick={() => setSort(s)}
              className={`px-4 py-2 rounded-lg text-[12px] font-body font-bold transition-all ${
                sort === s 
                  ? 'bg-white/10 text-cyan-glow border-b-2 border-cyan-glow shadow-cyan-glow/20' 
                  : 'text-[#7B8DB0] hover:text-[#F0F4FF]'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1">
      {results.length === 0 ? (
        <EmptyState 
          type="search" 
          title="No Matches Found" 
          message={query ? `Nothing found for "${query}". Try adjusting your filters.` : 'Search your financial ledger.'} 
        />
      ) : (
        <div className="pb-tab">
          <p className="px-6 mb-4 text-[13px] font-display font-bold text-[#3D4F70] uppercase tracking-wider">{results.length} record{results.length !== 1 ? 's' : ''} located</p>
          <div className="flex flex-col gap-3">
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
