// Green premium theme color system for Spendly Shop
// Based on Emerald/Green (#10B981) brand palette

export const COLORS = {
  // Page backgrounds
  bgPage:        '#FFFFFF',
  bgSection:     '#F0FDF4',
  bgCard:        '#FFFFFF',
  bgCardHover:   '#F0FDF4',

  // Primary — Green
  primary:       '#10B981',
  primaryLight:  '#ECFDF5',
  primaryGrad:   'linear-gradient(135deg, #10B981, #059669)',

  // Secondary — Deeper Green
  secondary:     '#059669',
  secondaryGrad: 'linear-gradient(135deg, #059669, #047857)',

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
  borderFocus:   '#10B981',
  borderLight:   '#F8F9FF',

  // Legacy aliases
  cyan:          '#10B981',
  blue:          '#059669',
  cyanDim:       'rgba(16, 185, 129, 0.1)',
  blueDim:       'rgba(5, 150, 105, 0.1)',
  gradientMain:  'linear-gradient(135deg, #10B981, #059669)',

  bgBase:        '#FFFFFF',
  bgSecondary:   '#F0FDF4',
  bgElevated:    '#F0FDF4',

  // Category colors (keeping generic for now or adapting)
  categories: {
    food:        ['#F43F5E', '#FB7185'],
    travel:      ['#10B981', '#34D399'],
    shopping:    ['#8B5CF6', '#A78BFA'],
    bills:       ['#F59E0B', '#FCD34D'],
    health:      ['#10B981', '#34D399'],
    fun:         ['#FF7043', '#FF8A65'],
    education:   ['#8B5CF6', '#6D28D9'],
    coffee:      ['#92400E', '#B45309'],
    rent:        ['#3B82F6', '#60A5FA'],
    clothes:     ['#EC4899', '#F472B6'],
    gifts:       ['#F43F5E', '#E11D48'],
    gym:         ['#84CC16', '#65A30D'],
    pets:        ['#FB923C', '#FDBA74'],
    holiday:     ['#10B981', '#0E7490'],
    tech:        ['#10B981', '#4338CA'],
    other:       ['#94A3B8', '#64748B'],
  },
}

export const CHART_COLORS = [
  '#10B981', '#059669', '#34D399', '#F59E0B', '#F43F5E',
  '#3B82F6', '#8B5CF6', '#EC4899', '#84CC16', '#FB923C',
  '#22D3EE', '#A78BFA',
]
