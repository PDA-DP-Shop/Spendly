import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share, PlusSquare, X, Smartphone, ArrowRight, Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useSettingsStore } from '../../store/settingsStore'

const S = { fontFamily: "'Inter', sans-serif" }

const HAPTIC_SHAKE = {
  tap: { 
    x: [0, -2, 2, -2, 2, 0],
    transition: { duration: 0.3 }
  }
}

export default function PWAInstallGuide() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { settings, isLoaded, showPWAInstall, setPWAInstallVisible } = useSettingsStore()
  const [isVisible, setIsVisible] = useState(false)
  const [platform, setPlatform] = useState(null)
  
  // A user is "returning" if they have already finished onboarding previously
  const isReturning = settings?.onboardingDone

  useEffect(() => {
    if (showPWAInstall) {
      setIsVisible(true)
      return
    }
    if (!isLoaded) return
    
    // 1. Check if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
    if (isStandalone) return

    // 2. Cooldown check (6 hours)
    const lastPrompt = localStorage.getItem('spendly-pwa-last-prompt')
    const SIX_HOURS = 6 * 60 * 60 * 1000
    if (lastPrompt && (Date.now() - parseInt(lastPrompt) < SIX_HOURS)) return

    // 3. Platform detection
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIOS = /iphone|ipad|ipod/.test(userAgent)
    const isAndroid = /android/.test(userAgent)

    if (isIOS) setPlatform('ios')
    else if (isAndroid) setPlatform('android')
    else return

    // 4. Trigger Visibility
    const timer = setTimeout(() => setIsVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [isLoaded])

  const handleDismiss = () => {
    localStorage.setItem('spendly-pwa-last-prompt', Date.now().toString())
    setIsVisible(false)
    setPWAInstallVisible(false)
  }

  if (!isVisible) return null

  const containerVariants = {
    hidden: { opacity: 0, y: 100 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: 'spring', 
        damping: 25, 
        stiffness: 200,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    },
    exit: { opacity: 0, y: 100, transition: { duration: 0.3 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  }

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-0 left-0 right-0 z-[1000] bg-white rounded-t-[40px] shadow-[0_-20px_80px_rgba(0,0,0,0.15)] px-8 pt-10 pb-12 overflow-hidden border-t border-[#F6F6F6]"
          >
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-gradient-to-b from-blue-50/50 to-transparent -z-10 blur-3xl opacity-50" />

            <div className="flex flex-col items-center text-center relative z-10">
              {/* Animated Phone Illustration */}
              <motion.div 
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 bg-black rounded-[24px] flex items-center justify-center mb-8 shadow-2xl relative"
              >
                <Smartphone className="w-10 h-10 text-white" strokeWidth={2} />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 bg-blue-500/20 rounded-[24px] -z-10"
                />
              </motion.div>

              <h3 className="text-[26px] font-[800] text-black mb-3 tracking-tight leading-tight" style={S}>
                {isReturning ? t('pwa.title_returning') : t('pwa.title_new')}
              </h3>
              <p className="text-[#AFAFAF] font-[500] text-[15px] mb-10 leading-relaxed max-w-[280px]" style={S}>
                {isReturning ? t('pwa.desc_returning') : t('pwa.desc_new')}
              </p>
              
              {/* Instruction Steps */}
              <div className="w-full space-y-4 mb-10 text-left">
                {platform === 'ios' ? (
                  <>
                    <motion.div variants={itemVariants} className="flex items-center gap-5 p-5 rounded-[24px] bg-[#F9F9F9] border border-[#EEEEEE]">
                      <div className="w-10 h-10 rounded-full bg-white border border-[#EEEEEE] flex items-center justify-center shrink-0 shadow-sm">
                        <Share className="w-4.5 h-4.5 text-blue-600" />
                      </div>
                      <p className="text-[14px] font-[700] text-black" style={S}>{t('pwa.step1_ios')}</p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex items-center gap-5 p-5 rounded-[24px] bg-[#F9F9F9] border border-[#EEEEEE]">
                      <div className="w-10 h-10 rounded-full bg-white border border-[#EEEEEE] flex items-center justify-center shrink-0 shadow-sm">
                        <PlusSquare className="w-4.5 h-4.5 text-black" />
                      </div>
                      <p className="text-[14px] font-[700] text-black" style={S}>{t('pwa.step2_ios')}</p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex items-center gap-5 p-5 rounded-[24px] bg-[#F9F9F9] border border-[#EEEEEE]">
                      <div className="w-10 h-10 rounded-full bg-white border border-[#EEEEEE] flex items-center justify-center shrink-0 shadow-sm">
                        <Download className="w-4.5 h-4.5 text-blue-600" />
                      </div>
                      <p className="text-[14px] font-[700] text-black" style={S}>{t('pwa.step3_ios')}</p>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div variants={itemVariants} className="flex items-center gap-5 p-5 rounded-[24px] bg-[#F9F9F9] border border-[#EEEEEE]">
                      <div className="w-10 h-10 rounded-full bg-white border border-[#EEEEEE] flex items-center justify-center shrink-0 shadow-sm">
                        <div className="flex flex-col gap-0.5"><div className="w-1 h-1 bg-black rounded-full"/><div className="w-1 h-1 bg-black rounded-full"/><div className="w-1 h-1 bg-black rounded-full"/></div>
                      </div>
                      <p className="text-[14px] font-[700] text-black" style={S}>{t('pwa.step1_android')}</p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex items-center gap-5 p-5 rounded-[24px] bg-[#F9F9F9] border border-[#EEEEEE]">
                      <div className="w-10 h-10 rounded-full bg-white border border-[#EEEEEE] flex items-center justify-center shrink-0 shadow-sm">
                        <PlusSquare className="w-4.5 h-4.5 text-black" />
                      </div>
                      <p className="text-[14px] font-[700] text-black" style={S}>{t('pwa.step2_android')}</p>
                    </motion.div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="w-full flex flex-col gap-3">
                <motion.button 
                  variants={HAPTIC_SHAKE}
                  whileTap="tap"
                  onClick={handleDismiss}
                  className="w-full py-6 rounded-[28px] bg-black text-white text-[16px] font-[800] flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/10" 
                  style={S}
                >
                  {t('pwa.button')} <ArrowRight className="w-5 h-5" />
                </motion.button>
                <button onClick={handleDismiss} className="py-2 text-[12px] font-[800] text-[#D8D8D8] uppercase tracking-[0.2em] hover:text-black transition-colors" style={S}>
                  Later
                </button>
                <div 
                  onClick={() => { handleDismiss(); navigate('/migration-guide'); }}
                  className="mt-4 flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span className="text-[11px] font-[800] text-blue-500 uppercase tracking-widest border-b border-transparent group-hover:border-blue-500 transition-all">How to move my data?</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={handleDismiss} 
            className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-[4px]" 
          />
        </>
      )}
    </AnimatePresence>
  )
}
