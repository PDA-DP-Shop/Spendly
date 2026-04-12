import { motion, AnimatePresence } from 'framer-motion'

export function UpdateBanner({
  updateReady,
  isUpdating,
  onUpdate,
  onDismiss
}) {
  return (
    <AnimatePresence>
      {updateReady && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 35
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 99999,
            padding: '12px 16px',
            paddingTop: 'calc(12px + env(safe-area-inset-top))',
            background: 'linear-gradient(135deg,#7C6FF7,#9B6FE4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            boxShadow: '0 4px 20px rgba(124,111,247,0.4)'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flex: 1
          }}>
            <span style={{ fontSize: 18 }}>✨</span>
            <div>
              <p style={{
                color: 'white',
                fontSize: 13,
                fontWeight: 700,
                margin: 0
              }}>
                New update ready!
              </p>
              <p style={{
                color: 'rgba(255,255,255,0.75)',
                fontSize: 11,
                margin: 0
              }}>
                Spendly just got better
              </p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: 8,
            flexShrink: 0
          }}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onUpdate}
              disabled={isUpdating}
              style={{
                background: 'white',
                color: '#7C6FF7',
                border: 'none',
                borderRadius: 20,
                padding: '7px 16px',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                minWidth: 70
              }}
            >
              {isUpdating ? 'Updating...' : 'Update'}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onDismiss}
              style={{
                background: 'transparent',
                color: 'rgba(255,255,255,0.85)',
                border: '1.5px solid rgba(255,255,255,0.4)',
                borderRadius: 20,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Later
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
