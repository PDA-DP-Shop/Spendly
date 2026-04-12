import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export function useAppUpdate() {
  const [updateReady, setUpdateReady] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isOfflineReady, setOfflineReady] = useState(false)

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady],
    updateServiceWorker
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      if (!registration) return

      // Check for updates every hour
      // Detects new dist/ you uploaded to Cloudflare Pages
      setInterval(async () => {
        if (!navigator.onLine) return
        try {
          await registration.update()
        } catch {
          // Silent fail always
        }
      }, 60 * 60 * 1000)
    },
    onRegisterError(error) {
      console.warn('SW:', error)
    }
  })

  useEffect(() => {
    if (offlineReady) {
      setOfflineReady(true)
    }
  }, [offlineReady])

  useEffect(() => {
    if (needRefresh) {
      // Wait 3s before showing banner
      // User finishes current action
      const t = setTimeout(() => {
        setUpdateReady(true)
      }, 3000)
      return () => clearTimeout(t)
    }
  }, [needRefresh])

  const applyUpdate = async () => {
    if (isUpdating) return
    setIsUpdating(true)
    try {
      await new Promise(r => setTimeout(r, 400))
      await updateServiceWorker(true)
      setNeedRefresh(false)
      setUpdateReady(false)
    } catch {
      setIsUpdating(false)
    }
  }

  const dismissUpdate = () => {
    setUpdateReady(false)
    updateServiceWorker(true)
    setNeedRefresh(false)
  }

  return {
    updateReady,
    isUpdating,
    isOfflineReady,
    applyUpdate,
    dismissUpdate
  }
}
