import { motion } from 'framer-motion'

export default function GlobalLoading() {
  const S = { fontFamily: "'Inter', sans-serif" }

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-white overflow-hidden">
      {/* Background Micro-shimmer */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-black to-transparent" />
      </div>

      {/* Main Logo Container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, filter: 'blur(10px)' }}
        animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex items-center justify-center mb-16"
      >
        {/* Animated Scanning Ring */}
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.1, 0, 0.1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-[200px] h-[200px] rounded-full border border-black"
        />

        {/* Sophisticated Breathing Logo */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative z-10"
        >
          <img 
            src="/spendly-logo.png" 
            alt="Spendly"
            className="w-[120px] h-[120px] rounded-[40px] shadow-[0_40px_80px_rgba(0,0,0,0.15)]"
          />
        </motion.div>

        {/* Highlight Shimmer Loop */}
        <motion.div
          animate={{
            x: ['-200%', '200%'],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
        />
      </motion.div>

      {/* Narrative Loading Block */}
      <div className="flex flex-col items-center gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-[16px] font-[900] text-black uppercase tracking-[0.4em] mb-2" style={S}>
            Terminal_Spendly
          </h2>
          <div className="flex items-center justify-center gap-2">
            <span className="w-1 h-1 rounded-full bg-black/20 animate-pulse" />
            <p className="text-[9px] font-[900] text-[#AFAFAF] uppercase tracking-[0.3em]" style={S}>
              Initializing_Neural_Node
            </p>
          </div>
        </motion.div>

        {/* Minimalist Progress Line */}
        <div className="w-[200px] h-[2px] bg-[#F6F6F6] rounded-full overflow-hidden mt-8">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="h-full w-full bg-black rounded-full"
          />
        </div>
      </div>

      {/* Version Tag */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-20">
        <p className="text-[8px] font-[900] text-black uppercase tracking-[0.5em]" style={S}>
          Build_v1.0.8_Staged
        </p>
      </div>
    </div>
  )
}
