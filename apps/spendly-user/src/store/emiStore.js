import { create } from 'zustand'
import { emiService } from '../services/database'
import { addMonths, format, parseISO } from 'date-fns'

const computeNextDue = (startDate, paidMonths) => {
  try {
    const start = parseISO(startDate)
    const nextDue = addMonths(start, paidMonths)
    return format(nextDue, 'yyyy-MM-dd')
  } catch { return null }
}

export const useEMIStore = create((set, get) => ({
  emis: [],
  isLoading: false,

  loadEMIs: async () => {
    set({ isLoading: true })
    try {
      const emis = await emiService.getAll()
      set({ emis, isLoading: false })
    } catch { set({ isLoading: false }) }
  },

  addEMI: async (emi) => {
    const fullEMI = {
      ...emi,
      paidMonths: emi.paidMonths || 0,
      isActive: true,
      nextDueDate: computeNextDue(emi.startDate, emi.paidMonths || 0),
    }
    const id = await emiService.add(fullEMI)
    set(s => ({ emis: [...s.emis, { ...fullEMI, id }] }))
    return id
  },

  updateEMI: async (id, changes) => {
    await emiService.update(id, changes)
    const emis = await emiService.getAll()
    set({ emis })
  },

  markPaid: async (id) => {
    const emi = get().emis.find(e => e.id === id)
    if (!emi) return
    const paidMonths = (emi.paidMonths || 0) + 1
    const isActive = paidMonths < emi.months
    const nextDueDate = isActive ? computeNextDue(emi.startDate, paidMonths) : null
    await emiService.update(id, { paidMonths, isActive, nextDueDate })
    set(s => ({ emis: s.emis.map(e => e.id === id ? { ...e, paidMonths, isActive, nextDueDate } : e) }))
  },

  removeEMI: async (id) => {
    await emiService.remove(id)
    set(s => ({ emis: s.emis.filter(e => e.id !== id) }))
  },

  thisMonthTotal: () => get().emis.filter(e => e.isActive).reduce((sum, e) => sum + (e.emiAmount || 0), 0),
}))
