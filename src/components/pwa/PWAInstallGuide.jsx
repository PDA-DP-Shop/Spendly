import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share, PlusSquare, X, Smartphone } from 'lucide-react'
import { useSettingsStore } from '../../store/settingsStore'

export default function PWAInstallGuide() {
  const { settings, isLoaded } = useSettingsStore()
  const [isVisible, setIsVisible] = useState(false)
  const [platform, setPlatform] = useState(null) // 'ios' or 'android'

  useEffect(() => {
    if (!isLoaded || !settings?.onboardingDone) return

    // 1. Check if already dismissed
    const dismissed = localStorage.getItem('spendly-pwa-dismissed')
    if (dismissed) return

    // 2. Check if already standalone (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
    if (isStandalone) return

    // 3. Detect Platform
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
          {/* iOS Bottom Sheet */}
          {platform === 'ios' && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[1000] bg-white dark:bg-[#1A1A2E] rounded-t-[32px] shadow-[0_-8px|40px_rgba(0,0,0,0.15)] px-6 pt-8 pb-10"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-[22px] flex items-center justify-center mb-4">
                  <Smartphone className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-sora font-bold text-xl text-gray-900 dark:text-white mb-2">Use Spendly like an app!</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Install it on your home screen for the best experience.</p>
                
                <div className="w-full space-y-6 mb-10">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#242438] flex items-center justify-center shrink-0">
                      <Share className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      <span className="text-gray-400 mr-1">Step 1:</span> Tap the <span className="text-blue-500 font-bold">Share</span> button at the bottom of Safari
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-left">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#242438] flex items-center justify-center shrink-0">
                      <PlusSquare className="w-5 h-5 text-gray-900 dark:text-white" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      <span className="text-gray-400 mr-1">Step 2:</span> Scroll down and tap <span className="font-bold">"Add to Home Screen"</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-left">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                      <span className="text-purple-600 font-bold text-xs">ADD</span>
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      <span className="text-gray-400 mr-1">Step 3:</span> Tap <span className="text-purple-600 font-bold">"Add"</span> in the top right corner
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mb-6 italic">Then open Spendly from your home screen like a real app!</p>

                <button
                  onClick={handleDismiss}
                  className="w-full py-4 bg-purple-600 text-white rounded-[20px] font-bold text-[16px] shadow-lg shadow-purple-200 dark:shadow-none active:scale-[0.98] transition-all"
                >
                  Got It!
                </button>
              </div>
            </motion.div>
          )}

          {/* Android Bottom Banner */}
          {platform === 'android' && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-4 left-4 right-4 z-[1000] bg-gray-900 text-white rounded-[24px] p-5 shadow-2xl flex flex-col gap-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shrink-0 text-xl shadow-lg">📱</div>
                  <div>
                    <h3 className="font-sora font-bold text-[16px]">Install Spendly on your phone!</h3>
                    <p className="text-gray-400 text-[13px] mt-1">Tap <span className="text-white font-bold">⋮ menu</span> → <span className="text-white font-bold">"Add to Home Screen"</span> or wait for Chrome prompt.</p>
                  </div>
                </div>
                <button onClick={handleDismiss} className="p-1 text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={handleDismiss}
                className="w-full py-3 bg-white text-gray-900 rounded-xl font-bold text-[14px] active:scale-[0.98] transition-all"
              >
                Got It!
              </button>
            </motion.div>
          )}

          {/* Backdrop for iOS */}
          {platform === 'ios' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleDismiss}
              className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm"
            />
          )}
        </>
      )}
    </AnimatePresence>
  )
}
