// Groups expenses by category, returns array of {category, total, count, expenses}
import { CATEGORIES } from '../constants/categories'

export const groupByCategory = (expenses) => {
  const map = {}
  expenses.forEach(exp => {
    if (exp.type !== 'spent') return
    if (!map[exp.category]) {
      map[exp.category] = { category: exp.category, total: 0, count: 0, expenses: [] }
    }
    map[exp.category].total += exp.amount
    map[exp.category].count += 1
    map[exp.category].expenses.push(exp)
  })
  return Object.values(map).sort((a, b) => b.total - a.total)
}

export const groupByDate = (expenses) => {
  const map = {}
  expenses.forEach(exp => {
    const dateKey = exp.date.slice(0, 10) // yyyy-mm-dd
    if (!map[dateKey]) map[dateKey] = []
    map[dateKey].push(exp)
  })
  return map
}

export const groupByMonth = (expenses) => {
  const map = {}
  expenses.forEach(exp => {
    const monthKey = exp.date.slice(0, 7) // yyyy-mm
    if (!map[monthKey]) map[monthKey] = []
    map[monthKey].push(exp)
  })
  return map
}
