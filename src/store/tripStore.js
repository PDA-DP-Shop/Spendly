import { create } from 'zustand'
import { tripService } from '../services/database'

export const useTripStore = create((set, get) => ({
  trips: [],
  activeTrip: null,
  isLoading: false,

  loadTrips: async () => {
    set({ isLoading: true })
    try {
      const trips = await tripService.getAll()
      const activeTrip = trips.find(t => t.isActive) || null
      set({ trips, activeTrip, isLoading: false })
    } catch { set({ isLoading: false }) }
  },

  addTrip: async (trip) => {
    const id = await tripService.add({ ...trip, isActive: true, totalSpent: 0 })
    const trips = await tripService.getAll()
    set({ trips, activeTrip: trips.find(t => t.id === id) || null })
    return id
  },

  updateTrip: async (id, changes) => {
    await tripService.update(id, changes)
    const trips = await tripService.getAll()
    set({ trips, activeTrip: trips.find(t => t.isActive) || null })
  },

  removeTrip: async (id) => {
    await tripService.remove(id)
    set(s => ({
      trips: s.trips.filter(t => t.id !== id),
      activeTrip: s.activeTrip?.id === id ? null : s.activeTrip,
    }))
  },

  addTripExpense: async (tripId, amount) => {
    const trip = get().trips.find(t => t.id === tripId)
    if (!trip) return
    const totalSpent = (trip.totalSpent || 0) + amount
    await tripService.update(tripId, { totalSpent })
    set(s => ({ trips: s.trips.map(t => t.id === tripId ? { ...t, totalSpent } : t) }))
  },
}))
