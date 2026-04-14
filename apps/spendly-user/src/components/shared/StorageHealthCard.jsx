/**
 * Storage Health Card — Premium Indigo Aura Design
 * Standardized to "3-Day Local Cache" terminology
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, ShieldAlert, Database, Info, RefreshCcw, Lock, Zap } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'

const S = { fontFamily: "'Inter', sans-serif" }

export default function StorageHealthCard() {
  const { storageHealth, setStorageHealth } = useUIStore()
  const { isPersisted, usedMB, totalMB } = storageHealth
  const [requesting, setRequesting] = useState(false)

  const handleRequestPersistence = async () => {
    if (!navigator.storage || !navigator.storage.persist) return
    setRequesting(true)
    try {
      const granted = await navigator.storage.persist()
      setStorageHealth({ ...storageHealth, isPersisted: granted })
    } catch (e) {
      console.error('Persistence request failed', e)
    } finally {
      setRequesting(false)
    }
  }

  const usagePercent = Math.max(4, (usedMB / totalMB) * 100)

  return (
    <div className="mx-6 mb-12">
      <div className="relative overflow-hidden bg-white rounded-[40px] border border-[#F1F5F9] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border-b-[6px] border-b-black/5">
        {/* Premium Aura Glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-[60px] -ml-24 -mb-24" />
        
        <div className="p-10 relative z-10">
          <div className="flex items-start justify-between mb-10">
             <div className="flex items-center gap-5">
               <div className="w-14 h-14 rounded-[24px] bg-black shadow-2xl flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Database className="w-6 h-6 text-white" strokeWidth={2.5} />
               </div>
               <div>
                  <h4 className="text-[20px] font-[900] text-black tracking-tight" style={S}>Health Check</h4>
                  <p className="text-[11px] font-[802] text-[#94A3B8] uppercase tracking-[0.2em] mt-1">Status: {isPersisted ? 'Permanent' : 'Temporary'}</p>
               </div>
             </div>
             
             <AnimatePresence mode="wait">
               {isPersisted ? (
                 <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 px-5 py-2 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm"
                 >
                   <ShieldCheck className="w-4 h-4 text-emerald-600" />
                   <span className="text-[11px] font-[900] text-emerald-600 uppercase tracking-widest" style={S}>Persisted</span>
                 </motion.div>
               ) : (
                 <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    className="relative"
                 >
                    <div className="absolute inset-0 bg-orange-500/10 rounded-2xl blur-md animate-pulse" />
                    <div className="relative flex items-center gap-2 px-5 py-2 bg-orange-50 rounded-2xl border border-orange-100">
                      <ShieldAlert className="w-4 h-4 text-orange-600" />
                      <span className="text-[11px] font-[900] text-orange-600 uppercase tracking-widest" style={S}>Not Secure</span>
                    </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

          <div className="space-y-8">
             {/* Dual Vault Progress Gauge */}
             <div className="bg-[#F8FAFC]/50 rounded-[36px] p-8 border border-[#F1F5F9]">
                {/* Main Vault */}
                <div className="mb-6">
                  <div className="flex justify-between items-end mb-3 px-1">
                      <div className="flex items-center gap-2.5">
                         <Zap className="w-4 h-4 text-black fill-black" />
                         <span className="text-[14px] font-[902] text-black uppercase tracking-tight" style={S}>Main Asset Vault</span>
                      </div>
                      <span className="text-[12px] font-[800] text-black/30 uppercase tracking-widest" style={S}>{usedMB}MB</span>
                  </div>
                  <div className="h-3 w-full bg-white rounded-full p-0.5 border border-[#F1F5F8] overflow-hidden">
                     <motion.div 
                       className="h-full rounded-full bg-black relative" 
                       initial={{ width: 0 }}
                       animate={{ width: `${Math.max(5, usagePercent)}%` }}
                       transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                     />
                  </div>
                </div>

                {/* 3-Day Local Cache */}
                <div>
                  <div className="flex justify-between items-end mb-3 px-1">
                      <div className="flex items-center gap-2.5">
                         <RefreshCcw className="w-4 h-4 text-orange-500" />
                         <span className="text-[14px] font-[902] text-orange-600 uppercase tracking-tight" style={S}>3-Day Local Cache</span>
                      </div>
                      <span className="text-[10px] font-[802] text-orange-400 uppercase tracking-[0.2em]" style={S}>Auto-Purge</span>
                  </div>
                  <div className="h-3 w-full bg-white rounded-full p-0.5 border border-[#F1F5F8] overflow-hidden">
                     <motion.div 
                       className="h-full rounded-full bg-orange-500 relative opacity-40" 
                       initial={{ width: 0 }}
                       animate={{ width: `12%` }}
                       transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                     />
                  </div>
                </div>
             </div>

             {/* Guidance & Actions */}
             {!isPersisted && (
                <div className="pt-2">
                   <div className="space-y-5">
                      <div className="flex gap-5 px-2">
                         <div className="w-12 h-12 rounded-[20px] bg-indigo-50/50 flex items-center justify-center flex-shrink-0">
                            <Info className="w-5 h-5 text-indigo-600" />
                         </div>
                         <p className="text-[13px] font-[500] text-slate-500 leading-relaxed" style={S}>
                           Your storage is currently <span className="text-black font-[800]">Volatile</span>. To ensure your <span className="text-indigo-600 font-[802]">3-Day Local Cache</span> never disappears, please enable persistence.
                         </p>
                      </div>
                      
                      <motion.button 
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleRequestPersistence}
                        disabled={requesting}
                        className="w-full h-18 bg-black text-white rounded-[24px] font-[900] text-[15px] tracking-tight shadow-2xl shadow-black/10 flex items-center justify-center gap-3 active:bg-slate-900 transition-colors"
                        style={S}
                      >
                        {requesting ? (
                          <RefreshCcw className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Lock className="w-5 h-5" strokeWidth={2.5} /> Secure My Offline Data
                          </>
                        )}
                      </motion.button>
                   </div>
                </div>
             )}
             
             {isPersisted && (
                <div className="flex items-center gap-3 bg-emerald-50/50 p-5 rounded-[24px] border border-emerald-100/50">
                   <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                   </div>
                   <p className="text-[12px] font-[800] text-emerald-700/80 uppercase tracking-widest" style={S}>Storage is Fortified & Safe</p>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  )
}
