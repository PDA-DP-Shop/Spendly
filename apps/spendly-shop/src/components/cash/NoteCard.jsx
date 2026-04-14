import React, { memo } from 'react';
import { motion } from 'framer-motion';
import CURRENCY_NOTES from '../../constants/currencyNotes';

const CURRENCIES = [
  { code: 'INR', symbol: '₹' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
];

const NOTE_THEMES = {
  INR: {
    2000: { 
      bg: 'linear-gradient(135deg, #A85A9B 0%, #C47DB5 50%, #A85A9B 100%)', 
      image: '/assets/notes/inr_2000_note.png',
      monument: 'MANGALYAAN', code: 'RS2000'
    },
    500: { 
      bg: 'linear-gradient(135deg, #7A8176 0%, #9EA59A 50%, #7A8176 100%)', 
      image: '/assets/notes/inr_500_note.png',
      monument: 'RED FORT', code: 'RS500'
    },
    200: { 
      bg: 'linear-gradient(135deg, #C97D3C 0%, #EA9F5E 50%, #C97D3C 100%)', 
      image: '/assets/notes/inr_200_note.png',
      monument: 'SANCHI STUPA', code: 'RS200'
    },
    100: { 
      bg: 'linear-gradient(135deg, #6C8CAF 0%, #8EAED1 50%, #6C8CAF 100%)', 
      image: '/assets/notes/inr_100_note.png',
      monument: 'RANI KI VAV', code: 'RS100'
    },
    50: { 
      bg: 'linear-gradient(135deg, #37A1BC 0%, #6CC7DA 50%, #37A1BC 100%)', 
      image: '/assets/notes/inr_50_note.png',
      monument: 'HAMPI', code: 'RS50'
    },
    20: { 
      bg: 'linear-gradient(135deg, #819842 0%, #A2BA5A 50%, #819842 100%)', 
      image: '/assets/notes/inr_20_note.png',
      monument: 'ELLORA CAVES', code: 'RS20'
    },
    10: { 
      bg: 'linear-gradient(135deg, #8B5A42 0%, #AF7E63 50%, #8B5A42 100%)', 
      image: '/assets/notes/inr_10_note.png',
      monument: 'SUN TEMPLE', code: 'RS10'
    },
    default: { bg: '#91A3B8', image: null, monument: 'BANKNOTE', code: 'RSXX' }
  },
  USD: {
    100: { bg: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)', image: '/assets/notes/usd_100_note.png', code: 'US100' },
    50: { bg: 'linear-gradient(135deg, #2E7D32 0%, #388E3C 100%)', image: '/assets/notes/usd_50_note.png', code: 'US50' },
    20: { bg: 'linear-gradient(135deg, #388E3C 0%, #43A047 100%)', image: '/assets/notes/usd_20_note.png', code: 'US20' },
    10: { bg: 'linear-gradient(135deg, #43A047 0%, #4CAF50 100%)', image: '/assets/notes/usd_10_note.png', code: 'US10' },
    5: { bg: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)', image: '/assets/notes/usd_5_note.png', code: 'US5' },
    2: { bg: 'linear-gradient(135deg, #66BB6A 0%, #81C784 100%)', image: '/assets/notes/usd_2_note.png', code: 'US2' },
    1: { bg: 'linear-gradient(135deg, #81C784 0%, #A5D6A7 100%)', image: '/assets/notes/usd_1_note.png', code: 'US1' },
    default: { bg: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)', image: null, code: 'USN' }
  }
};

const NoteCard = ({ 
  value, 
  currency = 'INR', 
  count = 0, 
  size = 'md', 
  showCount = true, 
  isHighlighted = false,
  onClick = null
}) => {
  const code = currency.toUpperCase();
  const currObj = CURRENCIES.find(c => c.code === code) || { symbol: '₹' };
  const currencyConfig = CURRENCY_NOTES[code] || CURRENCY_NOTES.INR;
  
  // Resolve note theme
  const valStr = String(value);
  const cleanValue = parseFloat(valStr.split('_')[0]);
  const isCoinKey = valStr.endsWith('_coin');
  
  // Only force coin if explicitly a coin key OR it's a small INR denomination
  const isActuallyCoin = isCoinKey || (code === 'INR' && cleanValue < 10);

  const theme = (NOTE_THEMES[code] && NOTE_THEMES[code][cleanValue]) 
    || (NOTE_THEMES[code]?.default) 
    || { 
      bg: code === 'USD' ? 'linear-gradient(135deg, #427B44 0%, #5B9B5E 100%)' : '#85BB65', 
      image: null, 
      monument: 'NOTE', 
      code: 'NOTE' 
    };

  const sizeStyles = {
    sm: { width: 'w-16', height: 'h-8', font: 'text-[10px]', badge: '-top-1 -right-1 w-4 h-4 text-[7px]' },
    md: { width: 'w-24', height: 'h-12', font: 'text-[14px]', badge: '-top-1.5 -right-1.5 w-5 h-5 text-[9px]' },
    lg: { width: 'w-[140px]', height: 'h-[70px]', font: 'text-[22px]', badge: '-top-2 -right-2 w-7 h-7 text-[11px]' }
  };

  const { width, height, font, badge } = sizeStyles[size] || sizeStyles.md;

  // Resolve Coin Image
  let coinImage = null;
  if (code === 'INR' && isActuallyCoin) {
    coinImage = `/assets/notes/inr_${cleanValue}_coin.png`;
  } else if (code === 'USD' && isActuallyCoin) {
    if (cleanValue === 1) coinImage = `/assets/notes/usd_1(dollar)_coin.png`;
    else if (cleanValue === 0.5) coinImage = `/assets/notes/usd_50(half_dollar)_coin.png`;
    else if (cleanValue === 0.25) coinImage = `/assets/notes/usd_25(quarter)_coin.png`;
    else if (cleanValue === 0.1) coinImage = `/assets/notes/usd_10(dime)_coin.png`;
    else if (cleanValue === 0.05) coinImage = `/assets/notes/usd_5(nickel)_coin.png`;
    else if (cleanValue === 0.01) coinImage = `/assets/notes/usd_1(penny)_coin.png`;
  }

  const content = isActuallyCoin ? (
    <motion.div
      layout
      style={{ 
        background: coinImage ? `url("${coinImage}") center/cover no-repeat` : 'none',
        backgroundColor: coinImage ? 'transparent' : (currencyConfig.noteColors?.[valStr] || '#D4AF37')
      }}
      className={`relative ${{ sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-16 h-16' }[size]} rounded-full shrink-0 ${coinImage ? '' : 'border-2 border-black/10 shadow-md'} flex items-center justify-center`}
    >
      {!coinImage && (
        <>
          <div className="absolute inset-x-0 top-0 bottom-0 bg-white/10 rounded-full z-0" />
          <span className="text-[14px] font-[900] text-black/50 z-10" style={{ fontFamily: 'Sora' }}>
             {cleanValue >= 1 ? cleanValue : (cleanValue * 100).toFixed(0)}
          </span>
        </>
      )}
      {showCount && count > 1 && (
        <div className={`absolute ${badge} bg-black text-white rounded-full flex items-center justify-center font-black border border-white z-20`}>
          {count}
        </div>
      )}
    </motion.div>
  ) : (
    <motion.div
      layout
      style={{ 
        backgroundImage: theme.image ? `url("${theme.image}")` : theme.bg,
        backgroundColor: theme.bg?.includes('gradient') ? 'transparent' : (theme.bg || '#4CAF50'),
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
      className={`relative ${width} ${height} rounded-lg overflow-hidden shrink-0 border border-white/30 shadow-xl`}
    >
      <div className="absolute inset-0 bg-black/5 z-0" />
      <div className="absolute left-[34%] top-0 bottom-0 w-[2.5px] bg-gradient-to-b from-transparent via-white/40 to-transparent border-x border-black/5 z-10 flex flex-col justify-around py-0.5">
         {[...Array(6)].map((_, i) => <div key={i} className="h-0.5 w-full bg-black/5" />)}
      </div>

      <div className="flex h-full text-white relative z-20">
        <div className="w-[18%] flex flex-col items-center justify-between py-1 bg-black/10 border-r border-white/10">
           <div className="flex flex-col gap-0.5 opacity-60">
              <div className="w-1 h-1 rounded-full bg-white" />
              <div className="w-1 h-1 rounded-full bg-white" />
           </div>
           <span className="text-[5px] font-black rotate-90 opacity-40 uppercase whitespace-nowrap mb-2">{theme.code || 'B-NOTE'}</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative px-1">
           <p className="absolute top-[3px] left-1 text-[3px] font-[900] uppercase opacity-30 tracking-[0.2em] leading-none">CENTRAL BANK ISSUED</p>
           {!theme.image && (
             <>
               <div className="absolute inset-0 flex items-center justify-center opacity-[0.08]">
                  <span className="text-[32px] font-black">{currObj.symbol}</span>
               </div>
               <span className="text-[14px] font-[900] tracking-tighter" style={{ fontFamily: 'Sora' }}>{cleanValue}</span>
             </>
           )}
        </div>

        <div className="w-[32%] flex flex-col items-center justify-center relative border-l border-white/10 bg-black/5">
           <div className="w-7 h-7 rounded-full border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
              <div className="w-5 h-5 rounded-t-full bg-white/20 transform translate-y-2" />
           </div>
        </div>
      </div>
      
      {showCount && count > 1 && (
        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          className={`absolute ${badge} bg-black text-white rounded-full flex items-center justify-center font-[950] shadow-lg border border-white/20 z-30`}
        >
          {count}
        </motion.div>
      )}

      {isHighlighted && (
        <motion.div 
          className="absolute inset-0 border-2 border-white rounded-lg pointer-events-none z-40"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      )}
    </motion.div>
  );

  return (
    <div className="flex flex-col items-center gap-1.5 min-w-fit cursor-pointer group" onClick={onClick}>
      {content}
      <span className="text-[10px] font-[900] text-slate-500 uppercase tracking-[0.15em] opacity-80 group-active:text-black transition-colors" style={{ fontFamily: "'Sora', sans-serif" }}>
        {currObj.symbol}{cleanValue}{isCoinKey ? ' (C)' : ''}
      </span>
    </div>
  );
};

export default memo(NoteCard);
