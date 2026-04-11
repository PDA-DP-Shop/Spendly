// voiceReader.js — Feature 12: Web Speech API wrapper
// startListening(onResult) → fills expense form from spoken text

const AMOUNT_WORDS = { 'hundred': 100, 'thousand': 1000, 'lakh': 100000 }

/**
 * Parses a spoken phrase into an expense object.
 * Supports:
 *   "spent 450 at McDonald's"
 *   "paid 200 for Uber"
 *   "received 50000 salary"
 *   "450 rupees on food"
 */
export const parseSpeech = (transcript) => {
  const text = transcript.toLowerCase().trim()

  // Determine type
  const type = /received|got|income|salary|credit/.test(text) ? 'received' : 'spent'

  // Extract amount — look for numbers possibly followed by currency words
  const amountMatch = text.match(/(\d[\d,]*(?:\.\d+)?)\s*(rupee|rs|₹|inr)?/i)
  let amount = 0
  if (amountMatch) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ''))
  }

  // Extract merchant/place — after "at", "for", "on", "from"
  const placeMatch = text.match(/(?:at|for|on|from)\s+(.+?)(?:\s+for|\s+in|\s+on|$)/i)
  const shopName = placeMatch ? toTitleCase(placeMatch[1].trim()) : ''

  // Auto-detect category from keywords
  const category = detectCategoryFromText(text)

  return { type, amount, shopName, category, rawText: transcript }
}

const toTitleCase = str => str.replace(/\b\w/g, c => c.toUpperCase())

const detectCategoryFromText = (text) => {
  if (/food|restaurant|eat|lunch|dinner|breakfast|pizza|burger|zomato|swiggy/.test(text)) return 'food'
  if (/uber|ola|cab|auto|rickshaw|transport|travel|metro|bus/.test(text)) return 'travel'
  if (/amazon|flipkart|shop|buy|purchase|store/.test(text)) return 'shopping'
  if (/doctor|hospital|medicine|pharma|health/.test(text)) return 'health'
  if (/movie|netflix|spotify|entertainment/.test(text)) return 'entertainment'
  if (/rent|electricity|water|bill|gas|internet/.test(text)) return 'bills'
  if (/salary|income|payment/.test(text)) return 'income'
  return 'other'
}

/**
 * Starts the Web Speech API and calls onResult(parsedExpense) when the user finishes speaking.
 * Returns a stop function.
 */
export const startListening = ({ onResult, onError, lang = 'en-IN' }) => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) {
    onError?.('Voice recognition is not supported in this browser. Please use Chrome or Safari.')
    return () => {}
  }

  const recognition = new SpeechRecognition()
  recognition.lang = lang
  recognition.interimResults = false
  recognition.maxAlternatives = 1
  recognition.continuous = false

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    const parsed = parseSpeech(transcript)
    onResult?.(parsed)
  }

  recognition.onerror = (event) => {
    onError?.(event.error === 'no-speech' ? 'No speech detected. Please try again.' : `Error: ${event.error}`)
  }

  recognition.start()
  return () => recognition.stop()
}

export const isVoiceSupported = () =>
  !!(window.SpeechRecognition || window.webkitSpeechRecognition)
