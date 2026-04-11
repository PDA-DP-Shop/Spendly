/**
 * Scanner Overlay - Google Pay Inspired
 * Minimalist, high-precision viewfinder with dynamic scanning pulse
 */
import { motion } from 'framer-motion'
import { Cpu } from 'lucide-react'

export default function ScannerOverlay({ status, mode = 'SCAN' }) {
  const S = { fontFamily: "'Plus Jakarta Sans', sans-serif" }
  const isScan = mode === 'SCAN'
  const accentColor = '#4F46E5' // Indigo 600

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center overflow-hidden">
      
      {/* Viewfinder (Google Pay Minimalist Style) */}
      <div className={`relative transition-all duration-700 ease-out ${isScan ? 'w-[80vw] h-[55vh]' : 'w-[80vw] h-[25vh]'} max-w-[400px]`}>
        
        {/* Minimalist Corner Brackets - Thin & Clean */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] rounded-tl-[12px]" style={{ borderColor: accentColor }} />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] rounded-tr-[12px]" style={{ borderColor: accentColor }} />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] rounded-bl-[12px]" style={{ borderColor: accentColor }} />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] rounded-br-[12px]" style={{ borderColor: accentColor }} />

        {/* Dynamic Scanning Line (Google Pay Style Pulse) */}
        <motion.div 
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          className="absolute left-0 right-0 h-[3px] z-10 shadow-[0_0_15px_rgba(79,70,229,0.8)]"
          style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
        />

        {/* Floating Status Text - Cleanly Integrated Below Viewfinder */}
        <div className="absolute bottom-[-60px] left-0 right-0 text-center px-4">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[14px] font-[800] text-white bg-black/30 backdrop-blur-md px-6 py-2.5 rounded-full inline-block shadow-lg border border-white/5"
            style={S}
          >
            {status}
          </motion.p>
        </div>
      </div>

      {/* Top Branding (Subtle) */}
      <div className="absolute top-[8%] flex flex-col items-center gap-2">
        <div className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center gap-2.5 shadow-sm">
            <Cpu className="w-3.5 h-3.5 text-white/60" />
            <span className="text-[10px] font-[900] text-white/70 tracking-[0.25em] uppercase" style={S}>
                Neural Insight Lens
            </span>
        </div>
      </div>
    </div>
  )
}
