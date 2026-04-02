import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share, PlusSquare, X, Smartphone } from 'lucide-react'
import { useSettingsStore } from '../../store/settingsStore'

const S = { fontFamily: "'Nunito', sans-serif" }

export default function PWAInstallGuide() {
  const { settings, isLoaded } = useSettingsStore()
  const [isVisible, setIsVisible] = useState(false)
  const [platform, setPlatform] = useState(null) // 'ios' or 'android'

  useEffect(() => {
    if (!isLoaded || !settings?.onboardingDone) return
    const dismissed = localStorage.getItem('spendly-pwa-dismissed')
    if (dismissed) return
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
    if (isStandalone) return

    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIOS = /iphone|ipad|ipod/.test(userAgent)
    const isAndroid = /android/.test(userAgent)

    if (isIOS) {
      setPlatform('ios')
      setIsVisible(true)
    } else if (isAndroid) {
      setPlatform('android')
      setIsVisible(true)
    }
  }, [isLoaded, settings?.onboardingDone])

  const handleDismiss = () => {
    localStorage.setItem('spendly-pwa-dismissed', 'true')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {platform === 'ios' && (
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 350 }}
              className="fixed bottom-0 left-0 right-0 z-[1000] bg-white rounded-t-[40px] shadow-[0_-20px_60px_rgba(15,23,42,0.15)] px-8 pt-8 pb-12"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[#EEF2FF] rounded-[24px] flex items-center justify-center mb-6">
                  <Smartphone className="w-8 h-8 text-[#7C6FF7]" />
                </div>
                <h3 className="text-[22px] font-[800] text-[#0F172A] mb-2 tracking-tight" style={S}>Native Experience</h3>
                <p className="text-[#94A3B8] font-[700] text-[15px] mb-8 leading-relaxed" style={S}>Install Spendly on your home screen for full fintech capabilities.</p>
                
                <div className="w-full space-y-6 mb-10 text-left">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-[14px] bg-[#F8F7FF] border border-[#F0F0F8] flex items-center justify-center shrink-0">
                      <Share className="w-5 h-5 text-[#3B82F6]" />
                    </div>
                    <p className="text-[14px] font-[800] text-[#475569]" style={S}>
                      <span className="text-[#94A3B8] mr-1">01.</span> Tap <span className="text-[#3B82F6]">Share</span> in Safari bottom menu
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-[14px] bg-[#F8F7FF] border border-[#F0F0F8] flex items-center justify-center shrink-0">
                      <PlusSquare className="w-5 h-5 text-[#0F172A]" />
                    </div>
                    <p className="text-[14px] font-[800] text-[#475569]" style={S}>
                      <span className="text-[#94A3B8] mr-1">02.</span> Scroll & tap <span className="text-[#0F172A]">"Add to Home Screen"</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-[14px] bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center shrink-0">
                      <span className="text-[#7C6FF7] font-[900] text-[10px]">ADD</span>
                    </div>
                    <p className="text-[14px] font-[800] text-[#475569]" style={S}>
                      <span className="text-[#94A3B8] mr-1">03.</span> Tap <span className="text-[#7C6FF7]">"Add"</span> to finalize setup
                    </p>
                  </div>
                </div>

                <button onClick={handleDismiss}
                  className="w-full py-5 text-white rounded-[22px] font-[800] text-[16px] shadow-lg shadow-[#7C6FF730]"
                  style={{ background: 'var(--gradient-primary)', ...S }}>
                  Initialize Application
                </button>
              </div>
            </motion.div>
          )}

          {platform === 'android' && (
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="fixed bottom-6 left-6 right-6 z-[1000] bg-[#0F172A] text-white rounded-[32px] p-6 shadow-2xl flex flex-col gap-5 border border-white/10"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-[#7C6FF7] rounded-[16px] flex items-center justify-center shrink-0 text-2xl shadow-lg ring-4 ring-[#7C6FF7]/20">📱</div>
                  <div>
                    <h3 className="text-[17px] font-[800] tracking-tight" style={S}>Install Neural Spendly</h3>
                    <p className="text-[#94A3B8] font-[700] text-[13px] mt-1 leading-snug" style={S}>Tap <span className="text-white">⋮ menu</span> → <span className="text-white">"Add to Home Screen"</span></p>
                  </div>
                </div>
                <button onClick={handleDismiss} className="p-1 text-[#94A3B8] hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <button onClick={handleDismiss}
                className="w-full py-4 bg-white text-[#0F172A] rounded-[18px] font-[800] text-[14px] active:scale-[0.98] transition-all" style={S}>
                Understood
              </button>
            </motion.div>
          )}

          {platform === 'ios' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={handleDismiss} className="fixed inset-0 z-[999] bg-[#0F172A]/40 backdrop-blur-sm" />
          )}
        </>
      )}
    </AnimatePresence>
  )
}
