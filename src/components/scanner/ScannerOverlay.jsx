/**
 * Scanner Overlay
 * Dual-mode styles: Blue Frame (Documents) and Purple Laser (Barcode)
 */
import { motion } from 'framer-motion'
import { CheckCircle2, Zap, Cpu, Scan } from 'lucide-react'

export default function ScannerOverlay({ status, mode = 'SCAN' }) {
  const S = { fontFamily: "'Plus Jakarta Sans', sans-serif" }

  const isScan = mode === 'SCAN'
  const accentColor = isScan ? '#6366F1' : '#A855F7' // Indigo vs Purple

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center overflow-hidden">
      {/* Background Dimming (Dark Glass) */}
      <div 
        className="absolute inset-0 bg-black/60 transition-all duration-700 ease-out" 
        style={{ 
          clipPath: isScan ? 
            'polygon(0% 0%, 0% 100%, 8% 100%, 8% 18%, 92% 18%, 92% 78%, 8% 78%, 8% 100%, 100% 100%, 100% 0%)' : 
            'polygon(0% 0%, 0% 100%, 12% 100%, 12% 38%, 88% 38%, 88% 62%, 12% 62%, 12% 100%, 100% 100%, 100% 0%)'
        }} 
      >
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      </div>

      {/* Perfected Viewfinder Geometry */}
      <div className={`relative transition-all duration-700 ease-out ${isScan ? 'w-[84vw] h-[60vh] max-w-[450px]' : 'w-[76vw] h-[24vh] max-w-[340px]'}`}>
        
        {/* Top Left Corner */}
        <motion.div 
          className="absolute top-0 left-0 w-16 h-16 border-t-[6px] border-l-[6px] rounded-tl-[32px]"
          style={{ borderColor: accentColor }}
        />
        {/* Top Right Corner */}
        <motion.div 
          className="absolute top-0 right-0 w-16 h-16 border-t-[6px] border-r-[6px] rounded-tr-[32px]"
          style={{ borderColor: accentColor }}
        />
        {/* Bottom Left Corner */}
        <motion.div 
          className="absolute bottom-0 left-0 w-16 h-16 border-b-[6px] border-l-[6px] rounded-bl-[32px]"
          style={{ borderColor: accentColor }}
        />
        {/* Bottom Right Corner */}
        <motion.div 
          className="absolute bottom-0 right-0 w-16 h-16 border-b-[6px] border-r-[6px] rounded-br-[32px]"
          style={{ borderColor: accentColor }}
        />

        {/* Neural Scan Line (Luminous) */}
        <motion.div 
          animate={{ top: ['2%', '98%', '2%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-0 right-0 h-[2px] z-10"
          style={{ 
            background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
            boxShadow: `0 0 20px ${accentColor}`
          }}
        />

        {/* Status Pill (Dark Premium Glass) */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-full max-w-[320px]"
        >
          <div className="flex items-center gap-4 px-6 py-4 rounded-3xl bg-black/40 backdrop-blur-3xl border border-white/10 shadow-2xl">
            <div className="relative flex items-center justify-center">
              {status.includes('Verified') || status.includes('Detected') || status.includes('Captured') ? (
                <div className="p-1 px-2 rounded-full bg-emerald-500/20 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
              ) : (
                <div className="flex gap-1.5 items-center px-1">
                  {[0, 1, 2].map(i => (
                    <motion.div 
                      key={i}
                      animate={{ height: [4, 12, 4], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                      className="w-1 rounded-full bg-white/40"
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-[800] text-white tracking-tight" style={S}>
                {status}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Identity Badge */}
      <div className="absolute top-[8%] px-5 py-2.5 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-2xl flex items-center gap-3 shadow-xl">
        <Cpu className="w-4 h-4 text-white/40" />
        <span className="text-[11px] font-[900] text-white/40 tracking-[0.3em] uppercase" style={S}>
           Neural Insight v2.0
        </span>
      </div>
    </div>
  )
}
