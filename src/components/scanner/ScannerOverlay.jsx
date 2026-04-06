/**
 * Scanner Overlay
 * Dual-mode styles: Blue Frame (Documents) and Purple Laser (Barcode)
 */
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, ScanBarcode } from 'lucide-react'

export default function ScannerOverlay({ status, mode = 'SCAN' }) {
  const S = { fontFamily: "'Inter', sans-serif" }

  const isScan = mode === 'SCAN'
  const accentColor = isScan ? '#3B82F6' : '#A855F7' // Blue vs Purple

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
      {/* Background Dimming (Hole in middle) */}
      <div 
        className="absolute inset-0 bg-black/50 transition-all duration-500" 
        style={{ clipPath: isScan ? 
            'polygon(0% 0%, 0% 100%, 10% 100%, 10% 20%, 90% 20%, 90% 80%, 10% 80%, 10% 100%, 100% 100%, 100% 0%)' : // Rectangular for Scan
            'polygon(0% 0%, 0% 100%, 15% 100%, 15% 35%, 85% 35%, 85% 65%, 15% 65%, 15% 100%, 100% 100%, 100% 0%)'   // Narrow for Barcode
        }} 
      />

      {/* Viewfinder Guide */}
      <div className={`relative transition-all duration-500 ${isScan ? 'w-[80vw] h-[60vh] max-w-[400px]' : 'w-[70vw] h-[30vh] max-w-[320px]'}`}>
        
        {/* Animated Bracket Corners */}
        {[0, 90, 180, 270].map((angle, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className={`absolute w-14 h-14 border-t-8 border-l-8 rounded-tl-3xl transition-colors duration-500`}
            style={{ 
                borderColor: accentColor,
                transform: `rotate(${angle}deg)`, 
                top: angle < 180 ? '-10px' : 'auto', 
                bottom: angle >= 180 ? '-10px' : 'auto', 
                left: (angle === 0 || angle === 270) ? '-10px' : 'auto', 
                right: (angle === 90 || angle === 180) ? '-10px' : 'auto' 
            }}
          />
        ))}

        {/* Scanning Elements */}
        {isScan ? (
           // SCAN Mode: Blue document frame pulsing
           <motion.div 
             animate={{ opacity: [0.1, 0.3, 0.1] }}
             transition={{ duration: 2, repeat: Infinity }}
             className="absolute inset-0 bg-blue-500/20 rounded-2xl border-4 border-blue-400 blur-sm"
           />
        ) : (
           // BARCODE Mode: Purple Laser Line
           <motion.div 
             animate={{ top: ['10%', '90%', '10%'] }}
             transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
             className="absolute left-[-10%] right-[-10%] h-[3px] bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_15px_rgba(168,85,247,0.9)] z-10"
           />
        )}

        {/* Content Detection Pill (Bottom center of viewfinder) */}
        <div className="absolute bottom-[-80px] left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3.5 rounded-full bg-black/60 backdrop-blur-2xl border border-white/20 shadow-2xl transition-all min-w-[200px] justify-center">
          <div className="relative">
             {status.includes('Captured') || status.includes('Detected') ? (
                 <CheckCircle2 className="w-5 h-5 text-emerald-400" />
             ) : (
                 <div className="w-2 h-2 rounded-full bg-white animate-pulse" style={{ backgroundColor: accentColor }} />
             )}
          </div>
          <span className="text-[12px] font-[800] whitespace-nowrap uppercase tracking-widest text-white/90" style={S}>
            {status}
          </span>
        </div>
      </div>

      {/* HQ Mode Badge */}
      <div className="absolute top-[10%] px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
        <span className="text-[10px] font-[900] text-white/50 uppercase tracking-[0.2em]" style={S}>
            4K High Precision Active
        </span>
      </div>

      {/* Target Guide Text */}
      <div className="absolute top-[18%] left-0 right-0 text-center px-10">
          <p className="text-white/40 text-[10px] font-[900] uppercase tracking-[0.4em] mb-2" style={S}>
              Viewfinder_Alignment
          </p>
          <div className="w-10 h-0.5 bg-white/10 mx-auto" />
      </div>
    </div>
  )
}
