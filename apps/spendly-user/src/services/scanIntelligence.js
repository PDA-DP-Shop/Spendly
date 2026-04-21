/**
 * Spendly Scan Intelligence Service
 * 100% Offline, On-Device AI Logic
 * No external APIs, Zero Cloud.
 */

import { db, decryptRecord } from './database'

const intelligenceCache = new Map()

const CATEGORY_KEYWORDS = {
  'Food & Dining': {
    icon: '🍔',
    keywords: [
      'biscuit', 'chips', 'namkeen', 'maggi', 'noodle', 'rice', 'dal', 'atta', 'flour',
      'bread', 'butter', 'milk', 'cheese', 'paneer', 'chocolate', 'candy', 'sweet', 'mithai', 'halwa',
      'pizza', 'burger', 'sandwich', 'biryani', 'curry', 'restaurant', 'cafe', 'dhaba', 'hotel', 'food',
      'snack', 'wafer', 'cookie', 'cake', 'juice', 'cold drink', 'pepsi', 'coke', 'thums up',
      'sprite', 'water bottle', 'soda', 'tea', 'coffee', 'chai', 'lassi', 'buttermilk', 'ice cream',
      'kurkure', 'lays', 'parle', 'britannia', 'amul', 'nestle', 'cadbury', 'haldiram', 'bikaji'
    ]
  },
  'Groceries': {
    icon: '🛒',
    keywords: [
      'sabzi', 'vegetable', 'fruit', 'onion', 'tomato', 'potato', 'garlic', 'ginger', 'lemon',
      'apple', 'banana', 'mango', 'grocery', 'kirana', 'supermarket', 'big bazaar', 'dmart', 'reliance',
      'fresh', 'organic', 'masala', 'spice', 'oil', 'mustard', 'sunflower', 'ghee', 'sugar', 'salt',
      'pulses', 'rajma', 'chana', 'moong', 'urad'
    ]
  },
  'Transport': {
    icon: '🚗',
    keywords: [
      'petrol', 'diesel', 'fuel', 'cng', 'gas', 'uber', 'ola', 'rapido', 'auto', 'rickshaw',
      'bus', 'train', 'metro', 'ticket', 'fare', 'toll', 'parking', 'cab', 'taxi', 'bike', 'scooter',
      'honda', 'yamaha', 'bajaj', 'tvs', 'hero', 'tyre', 'puncture', 'garage', 'service'
    ]
  },
  'Health': {
    icon: '💊',
    keywords: [
      'medicine', 'tablet', 'capsule', 'syrup', 'injection', 'hospital', 'clinic',
      'doctor', 'pharmacy', 'medical', 'health', 'dettol', 'savlon', 'bandage', 'sanitizer',
      'vitamin', 'protein', 'supplement', 'gym', 'fitness', 'apollo', 'medplus', '1mg',
      'test', 'pathology', 'scan', 'xray', 'blood'
    ]
  },
  'Shopping': {
    icon: '🛍️',
    keywords: [
      'shirt', 'pant', 'jeans', 'dress', 'kurta', 'saree', 'shoe', 'sandal', 'chappal',
      'bag', 'purse', 'wallet', 'watch', 'glasses', 'clothing', 'garment', 'fashion', 'zara',
      'myntra', 'flipkart', 'amazon', 'mall', 'showroom', 'boutique', 'textile', 'fabric'
    ]
  },
  'Entertainment': {
    icon: '🎬',
    keywords: [
      'movie', 'cinema', 'pvr', 'inox', 'ticket', 'game', 'sport', 'cricket', 'football',
      'netflix', 'hotstar', 'spotify', 'youtube', 'concert', 'event', 'park', 'amusement',
      'bowling', 'billiards', 'swimming', 'club'
    ]
  },
  'Education': {
    icon: '📚',
    keywords: [
      'book', 'notebook', 'pen', 'pencil', 'stationery', 'school', 'college', 'course',
      'fees', 'tuition', 'class', 'coaching', 'exam', 'test', 'degree', 'certificate',
      'udemy', 'coursera', 'byju', 'unacademy'
    ]
  },
  'Bills & Utilities': {
    icon: '📱',
    keywords: [
      'electricity', 'electric', 'bill', 'water', 'gas', 'internet', 'wifi', 'broadband',
      'mobile', 'recharge', 'postpaid', 'prepaid', 'jio', 'airtel', 'vi', 'bsnl', 'tata', 'rent',
      'maintenance', 'society', 'insurance', 'emi'
    ]
  },
  'Personal Care': {
    icon: '🧴',
    keywords: [
      'shampoo', 'soap', 'facewash', 'moisturizer', 'cream', 'lotion', 'perfume',
      'deodorant', 'toothpaste', 'toothbrush', 'hair oil', 'hair color', 'nail', 'beauty',
      'salon', 'parlour', 'spa', 'massage', 'dove', 'lux', 'lifebuoy', 'head shoulders',
      'pantene', 'garnier', 'lakme', 'nivea', 'colgate', 'pepsodent', 'oral b'
    ]
  }
}

export async function detectCategory(productName) {
  if (!productName || typeof productName !== 'string') return { category: 'Other', icon: '✨', confidence: 'low' }
  const lowerName = productName.toLowerCase()

  try {
    // 1. Check user corrections first (Learning)
    if (productName) {
      const correction = await db.categoryCorrections.where('productName').equalsIgnoreCase(productName).first()
      if (correction) {
        const info = CATEGORY_KEYWORDS[correction.correctedCategory]
        return { 
          category: correction.correctedCategory, 
          icon: info?.icon || '✨', 
          confidence: 'learned' 
        }
      }
    }
  } catch (err) {
    console.warn("[Intelligence] Category correction lookup failed", err)
  }

  // 2. Keyword Match
  let bestMatch = null
  let maxMatches = 0

  for (const [cat, info] of Object.entries(CATEGORY_KEYWORDS)) {
    const matches = info.keywords.filter(kw => lowerName.includes(kw.toLowerCase())).length
    if (matches > maxMatches) {
      maxMatches = matches
      bestMatch = { category: cat, icon: info.icon }
    }
  }

  if (bestMatch) {
    return {
      ...bestMatch,
      confidence: maxMatches >= 2 ? 'high' : 'medium'
    }
  }

  return { category: 'Other', icon: '✨', confidence: 'low' }
}

export async function saveCategoryCorrection(productName, suggestedCategory, correctedCategory) {
  if (!productName || suggestedCategory === correctedCategory) return
  
  try {
    const existing = await db.categoryCorrections.where('productName').equalsIgnoreCase(productName).first()
    if (existing) {
      await db.categoryCorrections.update(existing.id, {
        correctedCategory,
        count: (existing.count || 0) + 1,
        updatedAt: new Date().toISOString()
      })
    } else {
      await db.categoryCorrections.add({
        productName,
        suggestedCategory,
        correctedCategory,
        count: 1,
        updatedAt: new Date().toISOString()
      })
    }
  } catch (err) {
    console.error("[Intelligence] saveCategoryCorrection failed", err)
  }
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * INTELLIGENCE 2 — PREDICT AMOUNT
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

export async function predictAmount(productName, category) {
  try {
    // Use limited fetch to check if we even have enough data
    const expensesCount = await db.expenses.count()
    if (expensesCount < 5) return { predictedAmount: null, confidence: 'none' }

    // Optimization: Load decrypted names/categories only from the last 200 expenses to avoid memory overhead
    const recentExpensesEnc = await db.expenses.reverse().limit(200).toArray()
    const allExpenses = (await Promise.all(recentExpensesEnc.map(decryptRecord))).filter(Boolean)

    if (!productName) {
       // Fallback to Category average from recent
       const catMatches = allExpenses.filter(e => e.category === category)
       if (catMatches.length >= 2) {
         const avg = catMatches.reduce((acc, curr) => acc + curr.amount, 0) / catMatches.length
         return { predictedAmount: Math.round(avg), confidence: 'low', basedOn: `${category} average` }
       }
       return { predictedAmount: null, confidence: 'none' }
    }

    // Step 1: Exact Name Match
    const exactMatches = allExpenses.filter(e => e.shopName === productName || e.productName === productName)
    if (exactMatches.length >= 3) {
      const avg = exactMatches.reduce((acc, curr) => acc + curr.amount, 0) / exactMatches.length
      return { 
        predictedAmount: Math.round(avg), 
        confidence: 'high', 
        basedOn: `Your last ${exactMatches.length} purchases` 
      }
    }

    // Step 2: Similar Name Match (First 4 chars)
    if (productName.length >= 4) {
      const prefix = productName.toLowerCase().slice(0, 4)
      const similarMatches = allExpenses.filter(e => (e.shopName || e.productName || '').toLowerCase().startsWith(prefix))
      if (similarMatches.length > 0) {
        const avg = similarMatches.reduce((acc, curr) => acc + curr.amount, 0) / similarMatches.length
        return { 
          predictedAmount: Math.round(avg), 
          confidence: 'medium', 
          basedOn: `Similar past purchases` 
        }
      }
    }

    // Step 3: Category average
    const catMatches = allExpenses.filter(e => e.category === category)
    if (catMatches.length >= 3) {
      const avg = catMatches.reduce((acc, curr) => acc + curr.amount, 0) / catMatches.length
      return { 
        predictedAmount: Math.round(avg), 
        confidence: 'low', 
        basedOn: `Your ${category} average` 
      }
    }
  } catch (err) {
    console.warn("[Intelligence] predictAmount failed", err)
  }

  return { predictedAmount: null, confidence: 'none' }
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * INTELLIGENCE 3 — SMART SUGGESTIONS
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

const COMMON_PRODUCTS = [
  { name: 'Maggi Masala', category: 'Food & Dining', amount: 15 },
  { name: 'Parle-G Biscuit', category: 'Food & Dining', amount: 10 },
  { name: 'Lays Chips', category: 'Food & Dining', amount: 20 },
  { name: 'Milk 1L', category: 'Food & Dining', amount: 65 },
  { name: 'Amul Butter', category: 'Food & Dining', amount: 56 },
  { name: 'Coca Cola 250ml', category: 'Food & Dining', amount: 20 },
  { name: 'Petrol', category: 'Transport', amount: 500 },
  { name: 'Uber Ride', category: 'Transport', amount: 150 },
  { name: 'Airtel Recharge', category: 'Bills & Utilities', amount: 299 },
  { name: 'Electricity Bill', category: 'Bills & Utilities', amount: 1200 }
]

export async function getSmartSuggestions(partialText) {
  if (!partialText || partialText.length < 2) return []
  const lower = partialText.toLowerCase()

  try {
    // 1. Get Recent Expenses (Limit to 100 for speed)
    const expensesEnc = await db.expenses.reverse().limit(100).toArray()
    const history = (await Promise.all(expensesEnc.map(decryptRecord))).filter(Boolean)
    
    // 2. Get Learned Barcodes
    const learned = await db.learnedBarcodes.toArray()

    let suggestions = []

    // Add from history (recency/frequency)
    history.forEach(e => {
      const name = e.shopName || e.productName
      if (name && name.toLowerCase().includes(lower)) {
        const existing = suggestions.find(s => s.name === name)
        if (existing) {
          existing.useCount++
          if (new Date(e.date) > new Date(existing.lastUsed)) {
            existing.lastUsed = e.date
            existing.lastAmount = e.amount
          }
        } else {
          const catInfo = CATEGORY_KEYWORDS[e.category] || { icon: '✨' }
          suggestions.push({
            name,
            lastAmount: e.amount,
            lastUsed: e.date,
            useCount: 1,
            category: e.category,
            icon: catInfo.icon
          })
        }
      }
    })

    // Add from learned barcodes
    learned.forEach(l => {
      if (l.name && l.name.toLowerCase().includes(lower)) {
        if (!suggestions.find(s => s.name === l.name)) {
          const catInfo = CATEGORY_KEYWORDS[l.category] || { icon: '✨' }
          suggestions.push({
            name: l.name,
            lastAmount: l.price,
            lastUsed: l.learnedAt,
            useCount: 1,
            category: l.category || 'Other',
            icon: catInfo.icon
          })
        }
      }
    })

    // Add from common products (Day 1 fallback)
    COMMON_PRODUCTS.forEach(p => {
      if (p.name.toLowerCase().includes(lower)) {
        if (!suggestions.find(s => s.name === p.name)) {
          const catInfo = CATEGORY_KEYWORDS[p.category] || { icon: '✨' }
          suggestions.push({
            name: p.name,
            lastAmount: p.amount,
            lastUsed: new Date(0).toISOString(),
            useCount: 0,
            category: p.category,
            icon: catInfo.icon
          })
        }
      }
    })

    // Sort: Recent first, then Frequent
    return suggestions.sort((a,b) => {
      if (new Date(b.lastUsed) - new Date(a.lastUsed) !== 0) {
        return new Date(b.lastUsed) - new Date(a.lastUsed)
      }
      return b.useCount - a.useCount
    }).slice(0, 5)
  } catch (err) {
    console.error("[Intelligence] getSmartSuggestions failed", err)
    return []
  }
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * INTELLIGENCE 4 — LEARN USER HABITS
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

export async function learnFromExpense(expense) {
  if (!expense || !expense.amount) return
  
  try {
    const d = new Date(expense.date)
    const hour = d.getHours()
    const day = d.toLocaleDateString('en-US', { weekday: 'long' })

    // A. Time Habits
    let slot = 'Morning'
    if (hour >= 11 && hour < 16) slot = 'Afternoon'
    else if (hour >= 16 && hour < 20) slot = 'Evening'
    else if (hour >= 20 || hour < 6) slot = 'Night'

    await db.timeHabits.add({
      timeSlot: slot,
      category: expense.category,
      productName: expense.shopName || expense.productName,
      addedAt: new Date().toISOString()
    })

    // B. Day Habits
    await db.dayHabits.add({
      dayOfWeek: day,
      category: expense.category,
      productName: expense.shopName || expense.productName,
      addedAt: new Date().toISOString()
    })

    // C. Frequency Patterns
    const name = expense.shopName || expense.productName
    if (!name) return

    const lastPattern = await db.frequencyPatterns.where('productName').equalsIgnoreCase(name).reverse().first()
    if (lastPattern) {
      const days = Math.round((new Date(expense.date) - new Date(lastPattern.lastBought)) / (1000 * 60 * 60 * 24))
      await db.frequencyPatterns.add({
        productName: name,
        daysSinceLast: days,
        lastBought: expense.date
      })
    } else {
      await db.frequencyPatterns.add({
        productName: name,
        lastBought: expense.date,
        daysSinceLast: 0
      })
    }

    // D. Amount Patterns
    const amtPattern = await db.amountPatterns.where('productName').equalsIgnoreCase(name).first()
    if (amtPattern) {
      const amounts = [...(amtPattern.amounts || []), expense.amount]
      const avg = amounts.reduce((a,b) => a+b, 0) / amounts.length
      await db.amountPatterns.update(amtPattern.id, {
        amounts,
        avgAmount: avg,
        minAmount: Math.min(...amounts),
        maxAmount: Math.max(...amounts)
      })
    } else {
      await db.amountPatterns.add({
        productName: name,
        amounts: [expense.amount],
        avgAmount: expense.amount,
        minAmount: expense.amount,
        maxAmount: expense.amount
      })
    }
  } catch (err) {
    console.error("[Intelligence] learnFromExpense failed", err)
  }
}

export async function getHabitSuggestions() {
  try {
    const hour = new Date().getHours()
    const day = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    
    let slot = 'Morning'
    if (hour >= 11 && hour < 16) slot = 'Afternoon'
    else if (hour >= 16 && hour < 20) slot = 'Evening'
    else if (hour >= 20 || hour < 6) slot = 'Night'

    const suggestions = []

    // 1. Time based logic (Limit lookup)
    const timeHabits = await db.timeHabits.where('timeSlot').equals(slot).reverse().limit(10).toArray()
    if (timeHabits.length > 0) {
      const counts = {}
      timeHabits.forEach(h => counts[h.productName] = (counts[h.productName] || 0) + 1)
      const best = Object.keys(counts).sort((a,b) => counts[b] - counts[a])[0]
      
      if (best) {
        const msg = slot === 'Morning' ? `Good morning! Having ${best}? ☕` : 
                    slot === 'Evening' ? `Evening snack? ${best} 🍪` : `Late night ${best}? 🌙`
        suggestions.push({
          type: 'time_based',
          message: msg,
          suggestedName: best,
          suggestedCategory: timeHabits.find(h => h.productName === best).category
        })
      }
    }

    return suggestions.slice(0, 3)
  } catch (err) {
    console.error("[Intelligence] getHabitSuggestions failed", err)
    return []
  }
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * INTELLIGENCE 5 — SCAN RESULT ENHANCER
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

export async function enhanceScanResult(rawResult) {
  if (!rawResult) return null
  const cacheKey = rawResult.barcode || rawResult.text || rawResult.name
  if (cacheKey && intelligenceCache.has(cacheKey)) {
    return { ...rawResult, ...intelligenceCache.get(cacheKey) }
  }

  const { name, amount, category } = rawResult
  
  try {
    // 1. Detect Category
    const detected = await detectCategory(name)
    
    // 2. Predict Amount (if not already found)
    let prediction = { predictedAmount: null, confidence: 'none' }
    if (!amount) {
      prediction = await predictAmount(name, detected.category)
    }
    
    // 3. Check Price Warning
    let priceWarning = null
    if (amount && name) {
      const pattern = await db.amountPatterns.where('productName').equalsIgnoreCase(name).first()
      if (pattern && pattern.amounts.length >= 3) {
        if (amount > pattern.avgAmount * 1.3) {
          priceWarning = `${Math.round(pattern.avgAmount)}`
        }
      }
    }

    const enhanced = {
      ...rawResult,
      category: category || detected.category,
      categoryIcon: detected.icon,
      categoryConfidence: detected.confidence,
      predictedAmount: amount || prediction.predictedAmount,
      predictionBasis: prediction.basedOn,
      priceWarning,
      habitSuggestion: null // Handled at screen level
    }

    if (cacheKey) intelligenceCache.set(cacheKey, enhanced)
    return enhanced
  } catch (err) {
    console.error("[Intelligence] enhanceScanResult Error:", err)
    return rawResult
  }
}
