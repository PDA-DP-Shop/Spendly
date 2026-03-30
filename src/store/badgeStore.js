import { create } from 'zustand'
import { badgeService } from '../services/database'
import { BADGES } from '../constants/badges'

export const useBadgeStore = create((set, get) => ({
  earned: [],  // array of { badgeId, earnedAt, isNew }
  newBadge: null, // badge just earned — triggers toast/celebreation

  loadBadges: async () => {
    const earned = await badgeService.getAll()
    set({ earned })
  },

  // Check all badges against current app state, earn any newly unlocked ones
  checkBadges: async (appState) => {
    const earned = await badgeService.getAll()
    const earnedIds = new Set(earned.map(b => b.badgeId))

    for (const badge of BADGES) {
      if (earnedIds.has(badge.id)) continue
      try {
        if (badge.check(appState)) {
          await badgeService.earn(badge.id)
          set({ newBadge: badge })
          // Auto-clear new badge toast after 4s
          setTimeout(() => set(s => s.newBadge?.id === badge.id ? { newBadge: null } : {}), 4000)
        }
      } catch { /* badge check error — skip */ }
    }

    const updatedEarned = await badgeService.getAll()
    set({ earned: updatedEarned })
  },

  clearNewBadge: () => set({ newBadge: null }),

  markSeen: async (badgeId) => {
    await badgeService.markSeen(badgeId)
    set(s => ({ earned: s.earned.map(b => b.badgeId === badgeId ? { ...b, isNew: false } : b) }))
  },

  isEarned: (badgeId) => get().earned.some(b => b.badgeId === badgeId),
  getEarnedDate: (badgeId) => get().earned.find(b => b.badgeId === badgeId)?.earnedAt || null,
}))
