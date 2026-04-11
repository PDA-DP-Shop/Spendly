// VoiceAddModal.jsx — Feature 11: Voice Add Expense
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, X, Check, Loader2 } from 'lucide-react'
import { guessCategory } from '../../utils/guessCategory'

const S = { fontFamily: "'Inter', sans-serif" }

export default function VoiceAddModal({ onClose, onParsed }) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const recognitionRef = useRef(null)
  const transcriptRef = useRef('')

  useEffect(() => {
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
      transcriptRef.current = current
    }

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow it.')
      } else {
        setError(`Error: ${event.error}`)
      }
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      if (transcriptRef.current) processTranscript(transcriptRef.current)
    }

    recognitionRef.current = recognition
  }, [])

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

  const processTranscript = (text) => {
    setIsProcessing(true)
    setTimeout(() => {
      const lowerAuth = text.toLowerCase()
      let amount = 0
      let type = 'spent'
      let shopName = ''

      const numMatch = lowerAuth.match(/\d+(?:\.\d+)?/)
      if (numMatch) amount = parseFloat(numMatch[0])

      if (lowerAuth.includes('got') || lowerAuth.includes('received') || lowerAuth.includes('earned') || lowerAuth.includes('salary')) {
        type = 'received'
      }

      const cleanText = text
        .replace(new RegExp(`\\b${amount}\\b`), '')
        .replace(/\b(spent|got|paid|bought|for|on|from)\b/gi, '')
        .trim()
        .replace(/\s+/g, ' ')

      shopName = cleanText.length > 0 ? cleanText.charAt(0).toUpperCase() + cleanText.slice(1) : ''
      const category = guessCategory(shopName) || 'general'

      setIsProcessing(false)
      if (amount > 0) {
        onParsed({ amount, type, shopName, category, note: `Voice: "${text}"` })
      } else {
        setError("I couldn't identify an amount. Please try again.")
      }
    }, 800)
  }

  return (
    <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div className="relative w-full max-w-[340px] bg-white rounded-[40px] p-8 shadow-2xl flex flex-col items-center text-center"
        initial={{ y: 50, scale: 0.9, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }}>
        
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#F6F6F6] flex items-center justify-center border border-[#EEEEEE]">
          <X className="w-5 h-5 text-black" strokeWidth={2.5} />
        </button>

        <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center mb-6">
           <Mic className="w-8 h-8 text-white" strokeWidth={2.5} />
        </div>

        <h3 className="text-[20px] font-[900] text-black mb-2 tracking-tight" style={S}>Neural Voice</h3>
        <p className="text-[13px] font-[600] text-[#AFAFAF] mb-8 leading-relaxed uppercase tracking-[0.1em]" style={S}>"Spent 500 on coffee today"</p>

        {/* Mic Button */}
        <div className="relative mb-10">
          <AnimatePresence>
            {isListening && (
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1.5, opacity: 0 }} 
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-black opacity-20" />
            )}
          </AnimatePresence>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={isListening ? stopListening : startListening}
            className="relative z-10 w-24 h-24 rounded-full flex items-center justify-center text-white bg-black shadow-2xl shadow-black/30 transition-all">
            <Mic className={`w-10 h-10 ${isListening ? 'animate-pulse' : ''}`} strokeWidth={3} />
          </motion.button>
        </div>

        {/* Status */}
        <div className="h-14 flex items-center justify-center w-full">
          {isProcessing ? (
            <div className="flex items-center gap-2 text-black font-[900] uppercase text-[12px] tracking-[0.2em]" style={S}>
              <Loader2 className="w-4 h-4 animate-spin" /> Synchronizing
            </div>
          ) : error ? (
            <p className="text-[12px] text-[#E11900] font-[900] px-4 uppercase tracking-[0.1em]" style={S}>{error}</p>
          ) : transcript ? (
            <p className="text-[15px] text-black font-[700] italic leading-tight" style={S}>"{transcript}"</p>
          ) : (
            <p className="text-[12px] text-[#AFAFAF] font-[900] uppercase tracking-[0.2em]" style={S}>Ready to Scan</p>
          )}
        </div>

      </motion.div>
    </motion.div>
  )
}
