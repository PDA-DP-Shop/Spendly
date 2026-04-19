// White premium theme color system for Spendly
// Based on Purple (#000000) and Orange (#FF7043) brand palette

export const COLORS = {
  // Page backgrounds
  bgPage:        '#FFFFFF',
  bgSection:     '#F8F7FF',
  bgCard:        '#FFFFFF',
  bgCardHover:   '#F8F7FF',

  // Primary — Purple
  primary:       '#000000',
  primaryLight:  '#EEF2FF',
  primaryGrad:   'linear-gradient(135deg, #333333, #C56BB0)',

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
  borderFocus:   '#000000',
  borderLight:   '#F8F9FF',

  // Legacy aliases
  cyan:          '#000000',
  blue:          '#FF7043',
  cyanDim:       'rgba(124, 111, 247, 0.1)',
  blueDim:       'rgba(255, 112, 67, 0.1)',
  gradientMain:  'linear-gradient(135deg, #333333, #C56BB0)',

  bgBase:        '#FFFFFF',
  bgSecondary:   '#F8F7FF',
  bgElevated:    '#F8F7FF',

  // Category colors (gradient pairs)
  categories: {
    food:        ['#F43F5E', '#FB7185'],
    travel:      ['#000000', '#333333'],
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
    holiday:     ['#000000', '#0E7490'],
    tech:        ['#000000', '#4338CA'],
    other:       ['#94A3B8', '#64748B'],
  },
}

export const CHART_COLORS = [
  '#000000', '#FF7043', '#8B5CF6', '#10B981', '#F43F5E',
  '#F59E0B', '#3B82F6', '#EC4899', '#84CC16', '#FB923C',
  '#22D3EE', '#A78BFA',
]
