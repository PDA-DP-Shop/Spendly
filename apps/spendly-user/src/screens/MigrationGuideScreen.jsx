import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, Download, Smartphone, Upload, ShieldCheck, ArrowRight, Info, Share, MoreVertical, PlusSquare, Apple, Globe } from 'lucide-react'
import PageGuide from '../components/shared/PageGuide'
import { usePageGuide } from '../hooks/usePageGuide'

const S = { fontFamily: "'Inter', sans-serif" }

const HAPTIC_SHAKE = {
  tap: { 
    x: [0, -3, 3, -3, 3, 0],
    transition: { duration: 0.35, ease: "easeInOut" }
  }
}

export default function MigrationGuideScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('ios')

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase()
    if (/android/.test(userAgent)) setActiveTab('android')
    else setActiveTab('ios')
  }, [])

  const platformRef = useRef(null)
  const step1Ref = useRef(null)
  const securityRef = useRef(null)

  const { showGuide, currentStep, startGuide, nextStep, prevStep, skipGuide } = usePageGuide('migration_guide_page')

  const guideSteps = [
    { targetRef: platformRef, emoji: '📱', title: 'Pick Your Device', description: 'The steps for installing Spendly vary between iPhone and Android. Choose yours first.', borderRadius: 22 },
    { targetRef: step1Ref, emoji: '📦', title: 'Data Backup', description: 'Your data is local. To move it, you must export it as an encrypted file from your old device.', borderRadius: 24 },
    { targetRef: securityRef, emoji: '🔒', title: 'Privacy Guaranteed', description: 'Only your personal backup file contains your data. No cloud sync means no data leaks.', borderRadius: 16 }
  ]

  const StepCard = ({ icon: Icon, title, desc, children, color = 'blue' }) => (
    <div ref={title === t('migration.step1_title') ? step1Ref : null} className="flex gap-5 mb-11 relative">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${color === 'blue' ? 'bg-blue-600 text-white shadow-blue-500/20' : 'bg-black text-white shadow-black/20'}`}>
        <Icon className="w-5 h-5" strokeWidth={2.5} />
      </div>
      <div className="flex-1">
        <h4 className="text-[17px] font-[800] text-black mb-1.5 tracking-tight" style={S}>{title}</h4>
        {desc && <p className="text-[14px] font-[500] text-[#666666] leading-relaxed mb-4" style={S}>{desc}</p>}
        {children}
      </div>
    </div>
  )

  const PlatformSwitcher = () => (
    <div ref={platformRef} className="flex p-1.5 bg-[#F6F6F6] rounded-[22px] border border-[#EEEEEE] mb-6">
      <button 
        onClick={() => setActiveTab('ios')}
        className={`flex-1 flex items-center justify-center gap-2.5 py-3 rounded-[18px] transition-all duration-300 ${activeTab === 'ios' ? 'bg-white shadow-sm text-black' : 'text-[#AFAFAF] opacity-60'}`}
      >
        <Apple className={`w-4 h-4 ${activeTab === 'ios' ? 'text-black' : 'text-[#AFAFAF]'}`} />
        <span className="text-[13px] font-[800] uppercase tracking-wider" style={S}>iOS</span>
      </button>
      <button 
        onClick={() => setActiveTab('android')}
        className={`flex-1 flex items-center justify-center gap-2.5 py-3 rounded-[18px] transition-all duration-300 ${activeTab === 'android' ? 'bg-white shadow-sm text-black' : 'text-[#AFAFAF] opacity-60'}`}
      >
        <Globe className={`w-4 h-4 ${activeTab === 'android' ? 'text-black' : 'text-[#AFAFAF]'}`} />
        <span className="text-[13px] font-[800] uppercase tracking-wider" style={S}>Android</span>
      </button>
    </div>
  )

  const steps = activeTab === 'ios' ? t('migration.ios_steps', { returnObjects: true }) : t('migration.android_steps', { returnObjects: true })
  const step2Icon = activeTab === 'ios' ? Share : MoreVertical

  return (
    <div className="min-h-dvh bg-white safe-top relative overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-50/50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-slate-50 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2" />

      {/* Header */}
      <div className="px-7 pt-12 pb-6 flex items-center justify-between bg-white border-b border-[#F6F6F6] sticky top-0 z-30">
        <div className="flex items-center gap-5">
          <motion.button 
            variants={HAPTIC_SHAKE} whileTap="tap"
            onClick={() => navigate(-1)}
            className="w-11 h-11 rounded-full bg-[#F6F6F6] border border-[#EEEEEE] flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
          </motion.button>
          <h1 className="text-[22px] font-[800] text-black tracking-tight" style={S}>{t('migration.title')}</h1>
        </div>
        <button 
           onClick={startGuide}
           className="w-[34px] h-[34px] rounded-full bg-black text-white flex items-center justify-center font-bold text-[16px] leading-none active:scale-95 transition-transform"
           style={{ fontFamily: "'DM Sans', sans-serif" }}
           title="How to use this page"
        >
           ?
        </button>
      </div>

      <div className="px-8 pt-8 pb-32">
        <p className="text-[15px] font-[500] text-[#AFAFAF] mb-12 leading-relaxed" style={S}>
          {t('migration.subtitle')}
        </p>

        {/* Steps */}
        <StepCard 
          icon={Download} 
          title={t('migration.step1_title')} 
          desc={t('migration.step1_desc')} 
        />

        <StepCard 
          icon={step2Icon} 
          title={t('migration.step2_title')} 
        >
          <PlatformSwitcher />
          <div className="space-y-4 bg-white/50 p-4 rounded-[24px] border border-[#F0F0F0]">
            {Array.isArray(steps) && steps.map((s, idx) => (
              <motion.div 
                key={activeTab + idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3"
              >
                <span className="text-[13px] font-[800] text-blue-600 shrink-0 mt-0.5">•</span>
                <p className="text-[14px] font-[600] text-[#444444]" style={S}>{s}</p>
              </motion.div>
            ))}
          </div>
        </StepCard>

        <StepCard 
          icon={Upload} 
          title={t('migration.step3_title')} 
          desc={t('migration.step3_desc')} 
        />

        {/* Comparison Section */}
        <div className="mt-12 p-8 rounded-[32px] bg-[#F6F6F6] border border-[#EEEEEE]">
          <div className="flex items-center gap-3 mb-6">
            <Info className="w-5 h-5 text-blue-600" strokeWidth={2.5} />
            <h3 className="text-[18px] font-[800] text-black tracking-tight" style={S}>{t('migration.compare_title')}</h3>
          </div>

          <div className="space-y-8">
            <div>
              <h5 className="text-[14px] font-[800] text-black mb-2 flex items-center gap-2" style={S}>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                {t('migration.replace_title')}
              </h5>
              <p className="text-[13px] font-[500] text-[#666666] leading-relaxed ml-3.5" style={S}>
                {t('migration.replace_desc')}
              </p>
            </div>

            <div>
              <h5 className="text-[14px] font-[800] text-black mb-2 flex items-center gap-2" style={S}>
                <span className="w-1.5 h-1.5 rounded-full bg-black" />
                {t('migration.merge_title')}
              </h5>
              <p className="text-[13px] font-[500] text-[#666666] leading-relaxed ml-3.5" style={S}>
                {t('migration.merge_desc')}
              </p>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div ref={securityRef} className="mt-10 flex items-start gap-4 px-2">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" strokeWidth={2.5} />
          <p className="text-[11px] font-[600] text-[#AFAFAF] leading-relaxed uppercase tracking-wider" style={S}>
            {t('migration.footer')}
          </p>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white to-transparent pt-12 z-20">
        <motion.button
          variants={HAPTIC_SHAKE} whileTap="tap"
          onClick={() => navigate('/settings')}
          className="w-full py-6 rounded-[28px] bg-black text-white text-[16px] font-[800] flex items-center justify-center gap-3 shadow-2xl"
          style={S}
        >
          {t('migration.action_button')} <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
      <PageGuide 
        show={showGuide} 
        steps={guideSteps} 
        currentStep={currentStep} 
        onNext={nextStep} 
        onPrev={prevStep} 
        onSkip={skipGuide} 
      />
    </div>
  )
}
