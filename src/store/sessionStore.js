// Session store to keep the encryption key in memory only (never saved to disk)
import { create } from 'zustand'

import { secureWipeBuffer } from '../utils/crypto'

export const useSessionStore = create((set, get) => ({
  encryptionKeyBits: null,
  
  setEncryptionKey: (bits) => set({ encryptionKeyBits: bits }),
  
  clearEncryptionKey: () => {
    const bits = get().encryptionKeyBits
    if (bits) {
      secureWipeBuffer(bits)
    }
    set({ encryptionKeyBits: null })
  },
  
  hasKey: () => !!get().encryptionKeyBits,
}))
