// Automatically guesses category based on shop name using keyword matching
import { CATEGORIES } from '../constants/categories'

export const guessCategory = (shopName = '') => {
  const lower = shopName.toLowerCase()
  for (const category of CATEGORIES) {
    if (category.keywords.some(keyword => lower.includes(keyword))) {
      return category.id
    }
  }
  return 'other'
}
