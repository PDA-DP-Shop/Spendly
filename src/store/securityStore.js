import { create } from 'zustand'

export const useSecurityStore = create((set) => ({
  hideBalances: false,
  isBackgrounded: false,
  isRecording: false,
  
  toggleHideBalances: () => set(state => ({ hideBalances: !state.hideBalances })),
  setBackgrounded: (isBackgrounded) => set({ isBackgrounded }),
  setRecording: (isRecording) => set({ isRecording }),
}))
