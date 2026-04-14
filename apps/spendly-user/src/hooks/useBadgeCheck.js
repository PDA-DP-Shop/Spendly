import { useEffect } from 'react'
import { useBadgeStore } from '../store/badgeStore'
import { useExpenseStore } from '../store/expenseStore'
import { useSettingsStore } from '../store/settingsStore'
import { useGoalStore } from '../store/goalStore'
import { useTripStore } from '../store/tripStore'
import { useBudgetStore } from '../store/budgetStore'

export function useBadgeCheck() {
  const { checkBadges } = useBadgeStore()
  const { expenses } = useExpenseStore()
  const { settings } = useSettingsStore()
  const { goals } = useGoalStore()
  const { trips } = useTripStore()
  const { budgets } = useBudgetStore()

  useEffect(() => {
    // Only check if we have the core data loaded
    if (!settings) return

    // Construct app state for badge criteria
    const appState = {
      expenses,
      settings,
      goals,
      trips,
      // Calculate derived stats for badges
      noSpendDays: calculateNoSpendDays(expenses),
      streakDays: calculateStreakDays(expenses),
      underBudgetMonths: calculateUnderBudgetMonths(expenses, budgets),
      totalSaved: calculateTotalSaved(expenses, settings),
      usedFeatures: getUsedFeatures(expenses, settings),
      categoryBudgetCount: budgets.length,
    }

    checkBadges(appState)
  }, [expenses, settings, goals, trips, budgets, checkBadges])
}

// Helper calculation functions
function calculateNoSpendDays(expenses) {
  // Simple count of unique days with no (or very low) expenses in last 30 days
  const last30 = new Date()
  last30.setDate(last30.getDate() - 30)
  
  const spentDays = new Set(
    expenses
      .filter(e => new Date(e.date) >= last30)
      .map(e => new Date(e.date).toDateString())
  )
  
  return 30 - spentDays.size
}

function calculateStreakDays(expenses) {
  // Days in a row with at least 1 expense (app usage)
  if (expenses.length === 0) return 0;
  
  let streak = 0
  let current = new Date()
  current.setHours(0,0,0,0)

  // This is a simplified streak — days with app activity
  const dates = new Set(expenses.map(e => new Date(e.date).toDateString()))
  
  while (dates.has(current.toDateString())) {
    streak++
    current.setDate(current.getDate() - 1)
  }
  return streak
}

function calculateUnderBudgetMonths(expenses, budgets) {
  // Count months where total expense < total budget
  return 0 // Placeholder logic
}

function calculateTotalSaved(expenses, settings) {
  // total income - total expenses
  const totalExp = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
  // this is dummy for now
  return Math.max(0, 5000 - totalExp) 
}

function getUsedFeatures(expenses, settings) {
  const features = []
  if (expenses.some(e => e.scanType === 'barcode')) features.push('barcode')
  if (expenses.some(e => e.scanType === 'bill_scan')) features.push('bill_scan')
  if (expenses.some(e => e.scanType === 'voice')) features.push('voice')
  return features
}
