// VoiceAddModal.jsx — Feature 11: Voice Add Expense
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, X, Check, Loader2 } from 'lucide-react'
import { guessCategory } from '../../utils/guessCategory'

export default function VoiceAddModal({ onClose, onParsed }) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const recognitionRef = useRef(null)

  useEffect(() => {
    // Check support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('Voice recognition is not supported in this browser.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      let current = ''
      for (let i = 0; i < event.results.length; i++) {
        current += event.results[i][0].transcript
      }
      setTranscript(current)
    }

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow it in your browser settings.')
      } else {
        setError(`Error: ${event.error}`)
      }
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      if (transcript) {
        processTranscript(transcript)
      }
    }

    recognitionRef.current = recognition
  }, []) // Empty dep array because we rely on the latest state in onend via ref or closure isn't strictly needed if we process in a separate effect, but let's be careful.

  // Re-bind onend to capture latest transcript
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = () => {
        setIsListening(false)
        if (transcript) processTranscript(transcript)
      }
    }
  }, [transcript])

  const startListening = () => {
    if (!recognitionRef.current) return
    setError('')
    setTranscript('')
    setIsProcessing(false)
    recognitionRef.current.start()
    setIsListening(true)
  }

  const stopListening = () => {
    if (!recognitionRef.current) return
    recognitionRef.current.stop()
  }

  // Simple Local Parsing Logic
  // Examples: 
  // "Spent 500 on dinner"
  // "Got 1000 from mom"
  // "I bought a new laptop for 45000"
  const processTranscript = (text) => {
    setIsProcessing(true)
    setTimeout(() => {
      const lowerAuth = text.toLowerCase()
      let amount = 0
      let type = 'spent'
      let shopName = ''

      // Extract amount
      const numMatch = lowerAuth.match(/\d+(?:\.\d+)?/)
      if (numMatch) {
        amount = parseFloat(numMatch[0])
      }

      // Determine type
      if (lowerAuth.includes('got') || lowerAuth.includes('received') || lowerAuth.includes('earned') || lowerAuth.includes('salary')) {
        type = 'received'
      }

      // Extract shop name / note (everything except the amount and filler words)
      const cleanText = text
        .replace(new RegExp(`\\b${amount}\\b`), '')
        .replace(/\b(spent|got|paid|bought|for|on|from)\b/gi, '')
        .trim()
        .replace(/\s+/g, ' ')

      shopName = cleanText.length > 0 ? cleanText.charAt(0).toUpperCase() + cleanText.slice(1) : ''
      const category = guessCategory(shopName) || 'general'

      setIsProcessing(false)
      
      if (amount > 0) {
        onParsed({ amount, type, shopName, category, note: `Voice Note: "${text}"` })
      } else {
        setError("Couldn't find an amount in what you said. Try 'Spent 500 on dinner'.")
      }
    }, 600) // Small fake delay for UX
  }

  return (
    <motion.div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 pb-12"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      
      <motion.div className="relative w-full max-w-sm bg-white dark:bg-[#1A1A2E] rounded-[32px] p-6 shadow-2xl flex flex-col items-center text-center"
        initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.95 }}>
        
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <p className="font-sora font-bold text-[20px] text-gray-900 dark:text-white mb-2">Voice Add</p>
        <p className="text-[14px] text-gray-500 mb-8">Say something like: <br/>"Spent 500 on dinner yesterday"</p>

        {/* Mic Button */}
        <div className="relative mb-8">
          {isListening && (
            <div className="absolute inset-0 rounded-full bg-purple-500 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-50"></div>
          )}
          <button 
            onClick={isListening ? stopListening : startListening}
            className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center text-white shadow-xl transition-all ${isListening ? 'bg-purple-600 scale-105' : 'bg-[#1A1A2E] dark:bg-white text-white dark:text-[#1A1A2E]'}`}>
            <Mic className={`w-10 h-10 ${isListening ? 'animate-pulse' : 'text-purple-600 dark:text-purple-600'}`} />
          </button>
        </div>

        {/* Status Text */}
        <div className="h-16 flex items-center justify-center w-full">
          {isProcessing ? (
            <div className="flex items-center gap-2 text-purple-600 font-semibold">
              <Loader2 className="w-5 h-5 animate-spin" /> Parsing...
            </div>
          ) : error ? (
            <p className="text-[13px] text-red-500 font-medium px-4">{error}</p>
          ) : transcript ? (
            <p className="text-[16px] text-gray-800 dark:text-gray-200 font-medium italic">"{transcript}"</p>
          ) : (
            <p className="text-[14px] text-gray-400 font-medium">Tap mic to start</p>
          )}
        </div>

      </motion.div>
    </motion.div>
  )
}
