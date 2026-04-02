// TopHeader — white header with back button and title
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function TopHeader({ title, onBack }) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center gap-4 px-5 safe-top pt-4 pb-4 bg-white">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onBack || (() => navigate(-1))}
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: '#F8F9FF', border: '1px solid #F0F0F8' }}
      >
        <ChevronLeft className="w-5 h-5 text-[#64748B]" />
      </motion.button>
      <h1 className="text-[20px] font-bold text-[#0F172A] tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {title}
      </h1>
    </div>
  )
}
