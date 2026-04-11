// Date formatting helpers for Spendly
import { format, isToday, isYesterday, formatDistanceToNow, parseISO } from 'date-fns'

export const formatDate = (dateStr) => {
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr)
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'd MMM yyyy')
}

export const formatDateShort = (dateStr) => {
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr)
  return format(date, 'd MMM')
}

export const formatDateFull = (dateStr) => {
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr)
  return format(date, 'EEEE, d MMMM yyyy')
}

export const formatTime = (dateStr) => {
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr)
  return format(date, 'h:mm a')
}

export const formatTimeAgo = (dateStr) => {
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr)
  return formatDistanceToNow(date, { addSuffix: true })
}

export const formatMonthYear = (dateStr) => {
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr)
  return format(date, 'MMMM yyyy')
}

export const formatDayLetter = (dateStr) => {
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr)
  return format(date, 'EEEEE') // M, T, W, T, F, S, S
}
