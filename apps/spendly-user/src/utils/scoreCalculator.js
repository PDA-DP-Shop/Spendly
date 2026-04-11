/**
 * calculateScore — computes a spending health score similar to a credit score.
 * @param {Array}  expenses      – array of expense objects
 * @param {number} overallBudget – monthly budget in the user's currency
 * @param {number} spent         – total spent this month
 * @returns {{ score, grade, gradeColor, breakdown, tips }}
 */
export function calculateScore(expenses = [], overallBudget = 0, spent = 0) {
  let score = 400 // base
  const breakdown = []
  const tips = []

  // ── 1. Budget adherence (up to ±200 pts) ───────────────────────────────────
  if (overallBudget > 0) {
    const ratio = spent / overallBudget
    if (ratio <= 0.5) {
      breakdown.push({ label: 'Excellent budget control', pts: 200 })
      score += 200
    } else if (ratio <= 0.75) {
      breakdown.push({ label: 'Good budget control', pts: 120 })
      score += 120
    } else if (ratio <= 0.9) {
      breakdown.push({ label: 'Near budget limit', pts: 60 })
      score += 60
      tips.push('💡 You\'re close to your budget — try cutting discretionary spending.')
    } else if (ratio <= 1.0) {
      breakdown.push({ label: 'At budget limit', pts: 10 })
      score += 10
      tips.push('⚠️ You\'ve almost hit your budget. Avoid unnecessary purchases.')
    } else {
      const over = Math.round((ratio - 1) * 100)
      breakdown.push({ label: `Over budget by ${over}%`, pts: -150 })
      score -= 150
      tips.push('🚨 You\'ve exceeded your budget. Review your largest expenses.')
    }
  } else {
    tips.push('📋 Set a monthly budget to unlock budget score tracking.')
  }

  // ── 2. Transaction consistency — reward regular saving behaviour (up to 100 pts) ─
  if (expenses.length > 0) {
    const income = expenses.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0)
    const expenseTotal = expenses.filter(e => e.type !== 'income').reduce((s, e) => s + e.amount, 0)
    if (income > 0) {
      const savingsRate = (income - expenseTotal) / income
      if (savingsRate >= 0.3) {
        breakdown.push({ label: 'Strong savings rate (≥30%)', pts: 100 })
        score += 100
      } else if (savingsRate >= 0.15) {
        breakdown.push({ label: 'Healthy savings rate (≥15%)', pts: 60 })
        score += 60
      } else if (savingsRate >= 0) {
        breakdown.push({ label: 'Positive savings rate', pts: 20 })
        score += 20
        tips.push('💰 Try to save at least 20% of your income each month.')
      } else {
        breakdown.push({ label: 'Spending exceeds income', pts: -100 })
        score -= 100
        tips.push('🔴 You\'re spending more than you earn. Review your expenses.')
      }
    }
  }

  // ── 3. Diversity penalty — penalise if one category dominates (up to -50 pts) ─
  if (expenses.length >= 5) {
    const byCategory = {}
    expenses
      .filter(e => e.type !== 'income')
      .forEach(e => {
        byCategory[e.category] = (byCategory[e.category] || 0) + e.amount
      })
    const values = Object.values(byCategory)
    const total = values.reduce((s, v) => s + v, 0)
    const topShare = total > 0 ? Math.max(...values) / total : 0
    if (topShare > 0.7) {
      breakdown.push({ label: 'Spending heavily concentrated', pts: -50 })
      score -= 50
      tips.push('📊 Your spending is concentrated in one category — try to diversify.')
    } else if (topShare < 0.4) {
      breakdown.push({ label: 'Well-diversified spending', pts: 50 })
      score += 50
    }
  }

  // ── 4. Activity bonus — reward regular tracking (up to 50 pts) ─────────────
  if (expenses.length >= 20) {
    breakdown.push({ label: 'Active tracker (20+ entries)', pts: 50 })
    score += 50
  } else if (expenses.length >= 10) {
    breakdown.push({ label: 'Regular tracker (10+ entries)', pts: 25 })
    score += 25
  } else if (expenses.length === 0) {
    tips.push('✏️ Start logging expenses to build your spending score.')
  }

  // ── Clamp to 300–850 range ──────────────────────────────────────────────────
  score = Math.min(850, Math.max(300, Math.round(score)))

  // ── Grade mapping ───────────────────────────────────────────────────────────
  let grade, gradeColor
  if (score >= 750) {
    grade = 'Excellent'; gradeColor = '#22c55e'
  } else if (score >= 650) {
    grade = 'Good'; gradeColor = '#84cc16'
  } else if (score >= 550) {
    grade = 'Fair'; gradeColor = '#f59e0b'
  } else if (score >= 450) {
    grade = 'Poor'; gradeColor = '#f97316'
  } else {
    grade = 'Very Poor'; gradeColor = '#ef4444'
  }

  return { score, grade, gradeColor, breakdown, tips }
}
