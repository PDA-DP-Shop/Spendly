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
const S = { fontFamily: "'Inter', sans-serif" }

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
      id: Date.now(), type: 'success', message: 'Activity Removed', duration: 4000,
      action: { label: 'Undo', fn: async () => { await restoreExpense(deleted); setToast(null) } }
    })
  }

  return (
    <div className="flex flex-col min-h-dvh mb-tab bg-white">
      {/* Search bar */}
      <div className="px-6 safe-top pt-8 pb-5 bg-white sticky top-0 z-20 border-b border-[#EEEEEE]">
        <div
          className="flex items-center gap-4 px-6 py-4 rounded-full transition-all bg-[#F6F6F6] border border-[#EEEEEE]"
        >
          <Search className="w-5 h-5 text-black flex-shrink-0" strokeWidth={3} />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search activities..."
            autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
            className="flex-1 bg-transparent text-[16px] font-[900] text-black outline-none placeholder-[#AFAFAF]"
            style={S}
          />
          {query.length > 0 && (
            <button onClick={() => setQuery('')} className="w-7 h-7 flex items-center justify-center rounded-full bg-black">
              <X className="w-4 h-4 text-white" strokeWidth={3} />
            </button>
          )}
        </div>
      </div>

      {/* Category filter chips */}
      <div className="flex gap-3 px-6 py-6 overflow-x-auto scrollbar-hide bg-white border-b border-[#EEEEEE]">
        {[{ id: 'all', name: 'Total', emoji: '✨' }, ...CATEGORIES].map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-full text-[13px] font-[900] whitespace-nowrap flex-shrink-0 transition-all border ${
              activeCategory === cat.id 
                ? 'bg-black text-white border-black shadow-xl' 
                : 'bg-white text-black border-[#EEEEEE]'
            }`}
            style={S}>
            <span className="text-base">{cat.emoji}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Sort row */}
      <div className="flex items-center gap-4 px-6 py-5 overflow-x-auto scrollbar-hide bg-[#FBFBFB] border-b border-[#EEEEEE]">
        <div className="flex items-center gap-2 mr-2">
            <SlidersHorizontal className="w-4 h-4 text-black" strokeWidth={3} />
            <span className="text-[11px] font-[900] uppercase tracking-[0.2em] text-black flex-shrink-0" style={S}>Sort</span>
        </div>
        <div className="flex gap-3">
          {SORT_OPTIONS.map(s => (
            <button key={s} onClick={() => setSort(s)}
              className={`px-6 py-2.5 rounded-full text-[12px] font-[900] transition-all border tracking-[0.1em] ${
                sort === s ? 'bg-black text-white border-black' : 'bg-white text-black border-[#EEEEEE]'
              }`}
              style={S}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 pt-6">
        {results.length === 0 ? (
          <EmptyState
            type="search"
            title="Search Negative"
            message={query ? `No records found for "${query}" on this terminal.` : 'Enter search parameters to query the database.'}
          />
        ) : (
          <div className="pb-tab">
            <div className="flex items-center gap-3 px-6 mb-6">
                <div className="w-2 h-2 rounded-full bg-black shadow-[0_0_8px_rgba(0,0,0,0.3)]" />
                <p className="text-[11px] font-[900] uppercase tracking-[0.2em] text-[#AFAFAF]" style={S}>
                  {results.length} Activity Encounters
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
