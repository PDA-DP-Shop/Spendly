// scoreCalculator.js — Feature 23: Spending Score logic
// Pure function: takes app state → returns score (0–850) + breakdown + tips

import { startOfMonth, endOfMonth, parseISO, isWithinInterval, format, subMonths } from 'date-fns'

const SCORE_MAX = 850

/**
 * calculateScore({ expenses, settings, goals, noSpendCount, streakDays, budgets })
 * Returns { score, grade, breakdown, tips }
 */
export const calculateScore = ({ expenses = [], settings = {}, goals = [], noSpendCount = 0, streakDays = 0, budgets = [] }) => {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const thisMonth = expenses.filter(e => {
    try { return isWithinInterval(parseISO(e.date), { start: monthStart, end: monthEnd }) } catch { return false }
  })

  const spent = thisMonth.filter(e => e.type === 'spent').reduce((s, e) => s + e.amount, 0)
  const received = thisMonth.filter(e => e.type === 'received').reduce((s, e) => s + e.amount, 0)
  const budget = settings?.monthlyBudget || 0

  let score = 400  // baseline
  const breakdown = []
  const tips = []

  // +100: under budget this month
  if (budget > 0 && spent <= budget) {
    score += 100
    breakdown.push({ label: 'Under budget this month', pts: +100 })
  } else if (budget > 0 && spent > budget) {
    score -= 50
    breakdown.push({ label: 'Over budget this month', pts: -50 })
    tips.push('🎯 Stick to your monthly budget for +100 pts')
  }

  // +50: under budget by 20%+
  if (budget > 0 && spent <= budget * 0.8) {
    score += 50
    breakdown.push({ label: 'Under budget by 20%+', pts: +50 })
  }

  // +50: logged daily (has expenses most days this month)
  const loggedDays = new Set(thisMonth.map(e => e.date?.slice(0, 10))).size
  const daysInMonth = monthEnd.getDate()
  const coverage = loggedDays / daysInMonth
  if (coverage >= 0.7) {
    score += 50
    breakdown.push({ label: 'Logging expenses regularly', pts: +50 })
  } else {
    const ptsPotential = Math.round((0.7 - coverage) / 0.7 * 50)
    tips.push(`📝 Log expenses more regularly to earn +${ptsPotential} pts`)
  }

  // +30 per no-spend day (up to 5)
  const noSpendPts = Math.min(noSpendCount, 5) * 30
  if (noSpendPts > 0) {
    score += noSpendPts
    breakdown.push({ label: `${noSpendCount} no-spend days`, pts: noSpendPts })
  } else {
    tips.push('🚫 Try a no-spend day for +30 pts each')
  }

  // +50: savings goal progress
  const activeGoals = goals.filter(g => !g.isComplete && g.targetAmount > 0)
  const avgProgress = activeGoals.length > 0
    ? activeGoals.reduce((s, g) => s + (g.savedAmount / g.targetAmount), 0) / activeGoals.length
    : 0
  if (avgProgress >= 0.1) {
    score += 50
    breakdown.push({ label: 'Saving towards goals', pts: +50 })
  } else if (activeGoals.length === 0) {
    tips.push('🎯 Set a savings goal for +50 pts')
  }

  // +30: streak bonus
  if (streakDays >= 7) {
    score += 30
    breakdown.push({ label: `${streakDays}-day logging streak`, pts: +30 })
  }

  // Clamp
  score = Math.max(0, Math.min(SCORE_MAX, score))

  // Grade
  let grade, gradeColor
  if (score >= 750) { grade = 'Excellent 🟢'; gradeColor = '#22C55E' }
  else if (score >= 600) { grade = 'Good 🟡'; gradeColor = '#F59E0B' }
  else if (score >= 400) { grade = 'Fair 🟠'; gradeColor = '#F97316' }
  else { grade = 'Needs Work 🔴'; gradeColor = '#EF4444' }

  if (tips.length === 0) tips.push('🌟 You\'re doing great! Keep it up!')

  return { score, grade, gradeColor, breakdown, tips }
}
