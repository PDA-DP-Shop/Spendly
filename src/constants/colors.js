// White premium theme color system for Spendly

export const COLORS = {

  // Page backgrounds
  bgPage:        '#FFFFFF',
  bgSection:     '#F8F9FF',
  bgCard:        '#FFFFFF',
  bgCardHover:   '#F8F9FF',

  // Primary — Indigo
  primary:       '#6366F1',
  primaryLight:  '#EEF2FF',
  primaryGrad:   'linear-gradient(135deg, #6366F1, #8B5CF6)',

  // Secondary — Cyan
  secondary:     '#06B6D4',
  secondaryGrad: 'linear-gradient(135deg, #06B6D4, #3B82F6)',

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
  borderDefault: '#E2E8F0',
  borderFocus:   '#6366F1',
  borderLight:   '#F0F0F8',

  // Legacy aliases (used in many components)
  cyan:          '#6366F1',
  blue:          '#8B5CF6',
  cyanDim:       'rgba(99,102,241,0.1)',
  blueDim:       'rgba(139,92,246,0.1)',
  gradientMain:  'linear-gradient(135deg, #6366F1, #8B5CF6)',

  bgBase:        '#FFFFFF',
  bgSecondary:   '#F8F9FF',
  bgElevated:    '#F0F2FF',

  // Category colors (gradient pairs) — keep same for icon circles
  categories: {
    food:        ['#F43F5E', '#FB7185'],
    travel:      ['#06B6D4', '#22D3EE'],
    shopping:    ['#8B5CF6', '#A78BFA'],
    bills:       ['#F59E0B', '#FCD34D'],
    health:      ['#10B981', '#34D399'],
    fun:         ['#6366F1', '#818CF8'],
    education:   ['#8B5CF6', '#6D28D9'],
    coffee:      ['#92400E', '#B45309'],
    rent:        ['#3B82F6', '#60A5FA'],
    clothes:     ['#EC4899', '#F472B6'],
    gifts:       ['#F43F5E', '#E11D48'],
    gym:         ['#84CC16', '#65A30D'],
    pets:        ['#FB923C', '#FDBA74'],
    holiday:     ['#06B6D4', '#0E7490'],
    tech:        ['#6366F1', '#4338CA'],
    other:       ['#94A3B8', '#64748B'],
  },
}

export const CHART_COLORS = [
  '#6366F1', '#8B5CF6', '#06B6D4', '#10B981', '#F43F5E',
  '#F59E0B', '#3B82F6', '#EC4899', '#84CC16', '#FB923C',
  '#22D3EE', '#A78BFA',
]
