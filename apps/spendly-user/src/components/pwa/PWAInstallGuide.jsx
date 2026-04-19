import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share, PlusSquare, Smartphone, ArrowRight, Download, ShieldCheck, Zap, MoreVertical } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useSettingsStore } from '../../store/settingsStore'

const S = { fontFamily: "'Inter', sans-serif" }

export default function PWAInstallGuide() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { settings, isLoaded, showPWAInstall, setPWAInstallVisible } = useSettingsStore()
  const [isVisible, setIsVisible] = useState(false)
  const [platform, setPlatform] = useState(null)
  
  const isReturning = settings?.onboardingDone

  useEffect(() => {
    if (showPWAInstall) {
      setIsVisible(true)
      return
    }
    if (!isLoaded) return
    
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
    if (isStandalone) return

    const lastPrompt = localStorage.getItem('spendly-pwa-last-prompt')
    const SIX_HOURS = 6 * 60 * 60 * 1000
    if (lastPrompt && (Date.now() - parseInt(lastPrompt) < SIX_HOURS)) return

    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIOS = /iphone|ipad|ipod/.test(userAgent)
    const isAndroid = /android/.test(userAgent)

    if (isIOS) setPlatform('ios')
    else if (isAndroid) setPlatform('android')
    else return

    const timer = setTimeout(() => setIsVisible(true), 1500)
    return () => clearTimeout(timer)
  }, [isLoaded, showPWAInstall])

  const handleDismiss = () => {
    localStorage.setItem('spendly-pwa-last-prompt', Date.now().toString())
    setIsVisible(false)
    setPWAInstallVisible(false)
  }

  if (!isVisible) return null

  const containerVariants = {
    hidden: { opacity: 0, y: '100%' },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: 'spring', 
        damping: 30, 
        stiffness: 250,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    },
    exit: { opacity: 0, y: '100%', transition: { duration: 0.3 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleDismiss} 
            className="fixed inset-0 z-[1200] bg-black/60 backdrop-blur-[10px]" 
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-6 left-6 right-6 z-[1300] bg-white rounded-[40px] px-7 py-10 overflow-hidden max-w-[380px] mx-auto border border-[#F0F0F0]"
          >
            {/* Background Aura Glow */}
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-full h-[400px] bg-gradient-to-b from-[#000000]/5 to-transparent -z-10 blur-[60px]" />

            <div className="flex flex-col items-center text-center">
               <motion.div variants={itemVariants} className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#000000]/5 border border-[#000000]/10 mb-6">
                <ShieldCheck className="w-3.5 h-3.5 text-[#000000]" />
                <span className="text-[9px] font-[900] text-[#000000] uppercase tracking-[0.2em]" style={S}>Official Spendly App</span>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="w-20 h-20 bg-black rounded-[32px] flex items-center justify-center mb-6 relative border border-white/10"
              >
                <Smartphone className="w-10 h-10 text-white" strokeWidth={1} />
                <motion.div 
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-[-10px] bg-[#000000]/20 rounded-[40px] -z-10"
                />
                <div className="absolute -top-1.5 -right-1.5 w-8 h-8 bg-[#000000] rounded-full flex items-center justify-center border-4 border-white">
                  <Download className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                </div>
              </motion.div>

              <motion.h1 variants={itemVariants} className="text-[30px] font-[900] text-black mb-3 tracking-tighter leading-[0.95]" style={S}>
                {isReturning ? "Welcome Back!" : "Install App"}
              </motion.h1>
              
              <motion.p variants={itemVariants} className="text-[#545454] font-[500] text-[14px] mb-10 leading-relaxed max-w-[260px]" style={S}>
                Add Spendly to your home screen for full offline access & better performance.
              </motion.p>
              
              {/* Timeline Style Steps */}
              <div className="w-full space-y-3 mb-10 text-left">
                {platform === 'ios' ? (
                  <>
                    <StepItem variants={itemVariants} icon={Share} label="Tap share icon" color="#3B82F6" />
                    <StepItem variants={itemVariants} icon={PlusSquare} label="Add to Home Screen" color="#000000" />
                  </>
                ) : (
                  <>
                    <StepItem variants={itemVariants} icon={MoreVertical} label="Tap browser menu" color="#000000" />
                    <StepItem variants={itemVariants} icon={PlusSquare} label="Install App / Add" color="#000000" />
                  </>
                )}
              </div>

              <motion.div variants={itemVariants} className="w-full flex flex-col gap-4">
                <button onClick={handleDismiss} className="w-full py-5 rounded-[28px] bg-black text-white text-[16px] font-[900] flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
                  Get Started <ArrowRight className="w-5 h-5" strokeWidth={3} />
                </button>
                <button onClick={handleDismiss} className="text-[12px] font-[900] text-[#AFAFAF] uppercase tracking-[0.2em] pt-2">
                  Maybe Later
                </button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function StepItem({ variants, icon: Icon, label, color }) {
  return (
    <motion.div variants={variants} className="flex items-center gap-6 p-5 rounded-[28px] bg-[#F8F9FA] border border-[#EEEEEE] group hover:bg-white hover:border-[#000000]/20 transition-all">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white border border-[#F0F0F0]">
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <p className="text-[16px] font-[800] text-black tracking-tight" style={S}>{label}</p>
    </motion.div>
  )
}
