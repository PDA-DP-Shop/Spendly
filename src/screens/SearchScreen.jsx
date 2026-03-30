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
    <div className="flex flex-col min-h-dvh bg-[#F5F5F5] dark:bg-[#0F0F1A] mb-tab">
      {/* Search bar */}
      <div className="px-4 safe-top pt-4 pb-3">
        <div className="flex items-center gap-3 bg-white dark:bg-[#1A1A2E] rounded-2xl px-4 py-3 shadow-sm border-2 border-transparent focus-within:border-purple-400 transition-colors">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search expenses..."
            autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
            className="flex-1 bg-transparent text-[15px] text-gray-900 dark:text-white outline-none placeholder-gray-400"
          />
          {query.length > 0 && (
            <button onClick={() => setQuery('')}><X className="w-4 h-4 text-gray-400" /></button>
          )}
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
        {[{ id: 'all', name: 'All', emoji: '✨' }, ...CATEGORIES].map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-medium whitespace-nowrap border flex-shrink-0 transition-all ${
              activeCategory === cat.id ? 'bg-purple-600 text-white border-purple-600' : 'bg-white dark:bg-[#1A1A2E] text-gray-500 border-gray-200 dark:border-gray-600'
            }`}>
            <span>{cat.emoji}</span><span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Sort row */}
      <div className="flex items-center gap-2 px-4 pb-3">
        <span className="text-[13px] text-gray-400">Sort:</span>
        {SORT_OPTIONS.map(s => (
          <button key={s} onClick={() => setSort(s)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${
              sort === s ? 'bg-purple-100 text-purple-600 border-b-2 border-purple-600' : 'text-gray-400'
            }`}>
            {s}
          </button>
        ))}
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <EmptyState type="search" title="Nothing found 🔍"
          message={query ? 'Try a different search term' : 'Start typing to search your expenses'} />
      ) : (
        <div>
          <p className="px-4 mb-3 text-[13px] text-gray-400">{results.length} result{results.length !== 1 ? 's' : ''}</p>
          {results.map((exp, i) => (
            <TransactionItem key={exp.id} expense={exp} currency={currency} index={i}
              onDelete={handleDelete} onEdit={() => navigate(`/add?edit=${exp.id}`)} />
          ))}
        </div>
      )}

      <ToastMessage toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
