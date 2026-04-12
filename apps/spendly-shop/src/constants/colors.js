// White premium theme color system for Spendly Shop
// Synchronized with Spendly User app palette
export const COLORS = {
  // Page backgrounds
  bgPage:        '#FFFFFF',
  bgSection:     '#F8F7FF',
  bgCard:        '#FFFFFF',
  bgCardHover:   '#F8F7FF',

  // Primary — Purple (Matches user app)
  primary:       '#7C6FF7',
  primaryLight:  '#EEF2FF',
  primaryGrad:   'linear-gradient(135deg, #9B6FE4, #C56BB0)',

  // Secondary — Orange
  secondary:     '#FF7043',
  secondaryGrad: 'linear-gradient(135deg, #FF7043, #FF8A65)',

  // Semantic
  income:        '#10B981',
  incomeBg:      '#ECFDF5',
  expense:       '#F43F5E',
  expenseBg:     '#FFF1F2',
  warning:       '#F59E0B',
  warningBg:     '#FFFBEB',
  success:       '#10B981',
  error:         '#F43F5E',

  // Text
  textPrimary:   '#0F172A',
  textSecondary: '#64748B',
  textMuted:     '#94A3B8',
  textOnPrimary: '#FFFFFF',

  // Borders
  borderDefault: '#F0F0F8',
  borderFocus:   '#7C6FF7',
  borderLight:   '#F8F9FF',

  // Category colors (gradient pairs)
  categories: {
    food:        ['#F43F5E', '#FB7185'],
    travel:      ['#7C6FF7', '#9B6FE4'],
    shopping:    ['#8B5CF6', '#A78BFA'],
    bills:       ['#F59E0B', '#FCD34D'],
    health:      ['#10B981', '#34D399'],
    other:       ['#94A3B8', '#64748B'],
  },
}

export const CHART_COLORS = [
  '#7C6FF7', '#FF7043', '#8B5CF6', '#10B981', '#F43F5E',
  '#F59E0B', '#3B82F6', '#EC4899', '#84CC16', '#FB923C',
]
