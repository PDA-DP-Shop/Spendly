import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share, PlusSquare, Smartphone, ArrowRight, Download, ShieldCheck, Zap } from 'lucide-react'
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
        damping: 32, 
        stiffness: 300,
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    exit: { opacity: 0, y: '100%', transition: { duration: 0.4, ease: [0.32, 0, 0.67, 0] } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
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
            className="fixed bottom-0 left-0 right-0 z-[1000] bg-white rounded-t-[42px] shadow-[0_-30px_90px_rgba(0,0,0,0.18)] px-8 pt-12 pb-14 overflow-hidden border-t border-[#F0F0F0]"
          >
            {/* Premium Decorative Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[350px] bg-gradient-to-b from-blue-50/60 to-transparent -z-10 blur-3xl opacity-60" />

            <div className="flex flex-col items-center text-center relative z-10">
               {/* Privacy Badge */}
               <motion.div variants={itemVariants} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50/50 border border-blue-100/50 mb-6">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-[10px] font-[800] text-blue-500 uppercase tracking-widest" style={S}>Privacy Certified</span>
              </motion.div>

              {/* Animated Phone Illustration (Premium Overhaul) */}
              <motion.div 
                initial={{ scale: 0.9, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="w-22 h-22 bg-black rounded-[28px] flex items-center justify-center mb-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] relative border-2 border-white/10"
              >
                <Smartphone className="w-11 h-11 text-white" strokeWidth={1.5} />
                <div className="absolute -top-1.5 -right-1.5 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-lg border-2 border-white">
                    <Zap className="w-4 h-4 text-white fill-current" />
                </div>
                <motion.div 
                  animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.1, 0.4] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute inset-[-8px] bg-blue-500/15 rounded-[36px] -z-10"
                />
              </motion.div>

              <h3 className="text-[28px] font-[800] text-black mb-3 tracking-tighter leading-tight" style={S}>
                {isReturning ? t('pwa.title_returning') : t('pwa.title_new')}
              </h3>
              <p className="text-[#AFAFAF] font-[500] text-[15px] mb-10 leading-relaxed max-w-[280px]" style={S}>
                {isReturning ? t('pwa.desc_returning') : t('pwa.desc_new')}
              </p>
              
              {/* Instruction Steps (Premium Cards) */}
              <div className="w-full space-y-3.5 mb-12 text-left">
                {platform === 'ios' ? (
                  <>
                    <motion.div variants={itemVariants} className="flex items-center gap-5 p-5.5 rounded-[26px] bg-[#F8F9FA] border border-[#EEEEEE] shadow-sm">
                      <div className="w-11 h-11 rounded-2xl bg-white border border-[#F0F0F0] flex items-center justify-center shrink-0 shadow-sm">
                        <Share className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-[14.5px] font-[700] text-black tracking-tight" style={S}>{t('pwa.step1_ios')}</p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex items-center gap-5 p-5.5 rounded-[26px] bg-[#F8F9FA] border border-[#EEEEEE] shadow-sm">
                      <div className="w-11 h-11 rounded-2xl bg-white border border-[#F0F0F0] flex items-center justify-center shrink-0 shadow-sm">
                        <PlusSquare className="w-5 h-5 text-black" />
                      </div>
                      <p className="text-[14.5px] font-[700] text-black tracking-tight" style={S}>{t('pwa.step2_ios')}</p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex items-center gap-5 p-5.5 rounded-[26px] bg-[#F8F9FA] border border-[#EEEEEE] shadow-sm">
                      <div className="w-11 h-11 rounded-2xl bg-white border border-[#F0F0F0] flex items-center justify-center shrink-0 shadow-sm">
                        <Download className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-[14.5px] font-[700] text-black tracking-tight" style={S}>{t('pwa.step3_ios')}</p>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div variants={itemVariants} className="flex items-center gap-5 p-5.5 rounded-[26px] bg-[#F8F9FA] border border-[#EEEEEE] shadow-sm">
                      <div className="w-11 h-11 rounded-2xl bg-white border border-[#F0F0F0] flex items-center justify-center shrink-0 shadow-sm">
                        <div className="flex flex-col gap-0.5"><div className="w-1 h-1 bg-black rounded-full"/><div className="w-1 h-1 bg-black rounded-full"/><div className="w-1 h-1 bg-black rounded-full"/></div>
                      </div>
                      <p className="text-[14.5px] font-[700] text-black tracking-tight" style={S}>{t('pwa.step1_android')}</p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex items-center gap-5 p-5.5 rounded-[26px] bg-[#F8F9FA] border border-[#EEEEEE] shadow-sm">
                      <div className="w-11 h-11 rounded-2xl bg-white border border-[#F0F0F0] flex items-center justify-center shrink-0 shadow-sm">
                        <PlusSquare className="w-5 h-5 text-black" />
                      </div>
                      <p className="text-[14.5px] font-[700] text-black tracking-tight" style={S}>{t('pwa.step2_android')}</p>
                    </motion.div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="w-full flex flex-col items-center">
                <motion.button 
                  variants={{ ...HAPTIC_SHAKE, initial: { opacity: 0 }, animate: { opacity: 1 } }}
                  whileTap="tap"
                  onClick={handleDismiss}
                  className="w-full py-6 rounded-[28px] bg-black text-white text-[16.5px] font-[800] flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(0,0,0,0.15)] mb-6" 
                  style={S}
                >
                  {t('pwa.button')} <ArrowRight className="w-5 h-5" strokeWidth={3} />
                </motion.button>
                
                <button onClick={handleDismiss} className="text-[11px] font-[800] text-[#D8D8D8] uppercase tracking-[0.25em] hover:text-black transition-colors mb-8" style={S}>
                  Later
                </button>

                <motion.div 
                  variants={itemVariants}
                  onClick={() => { handleDismiss(); navigate('/migration-guide'); }}
                  className="flex items-center gap-2 group cursor-pointer"
                >
                  <span className="text-[11.5px] font-[800] text-blue-500 uppercase tracking-widest border-b border-transparent group-hover:border-blue-500 transition-all">How to move my data?</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-500 group-hover:translate-x-1 transition-transform" />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Backdrop (Refined) */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={handleDismiss} 
            className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-[6px]" 
          />
        </>
      )}
    </AnimatePresence>
  )
}
