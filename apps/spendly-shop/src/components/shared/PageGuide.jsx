import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function PageGuide({ steps, currentStep, onNext, onPrev, onSkip, show }) {
  const [targetRect, setTargetRect] = useState(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    if (!show || !steps[currentStep]) return;

    let lastRectStr = '';
    let animationFrameId;

    const updateRect = () => {
      const currentRef = steps[currentStep].targetRef;
      if (!currentRef || !currentRef.current) {
        animationFrameId = requestAnimationFrame(updateRect);
        return;
      }
      const el = currentRef.current;
      const rect = el.getBoundingClientRect();
      
      const rectStr = `${Math.round(rect.top)},${Math.round(rect.left)},${Math.round(rect.width)},${Math.round(rect.height)}`;
      
      if (rectStr !== lastRectStr) {
        lastRectStr = rectStr;

        const centerY = rect.top + rect.height / 2;
        const isVisible = (
          centerY >= 50 && 
          centerY <= (window.innerHeight || document.documentElement.clientHeight) - 50
        );

        if (!isVisible && !isScrollingRef.current) {
          isScrollingRef.current = true;
          setIsScrolling(true);
          try {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } catch(e) {}
          
          setTimeout(() => {
            isScrollingRef.current = false;
            setIsScrolling(false);
          }, 600); 
        } else if (!isScrollingRef.current) {
          setTargetRect(rect);
        }
      }
      
      animationFrameId = requestAnimationFrame(updateRect);
    };

    animationFrameId = requestAnimationFrame(updateRect);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentStep, show, steps]);

  if (!show || !steps[currentStep]) return null;

  const step = steps[currentStep];

  const calculateTooltipPosition = () => {
    if (!targetRect) return {};
    const winHeight = window.innerHeight;
    const winWidth = window.innerWidth;
    
    let position = step.position || 'auto';
    
    if (position === 'auto') {
      if (targetRect.top < winHeight / 2) {
        position = 'bottom';
      } else {
        position = 'top';
      }
    }

    if (position === 'bottom') {
      if (targetRect.bottom + 180 > winHeight && targetRect.top > 200) {
        position = 'top';
      }
    } else {
      if (targetRect.top - 180 < 0 && targetRect.bottom + 180 < winHeight) {
        position = 'bottom';
      }
    }

    let anchorX = targetRect.left + (targetRect.width / 2);
    // Tooltip max width is 270. Half is 135.
    const HALF_WIDTH = 135;
    const MIN_X = 16 + HALF_WIDTH;
    const MAX_X = winWidth - 16 - HALF_WIDTH;
    
    let tooltipX = anchorX;
    if (tooltipX < MIN_X) tooltipX = MIN_X;
    if (tooltipX > MAX_X) tooltipX = MAX_X;

    let tooltipY, arrowY, isArrowUp;
    const GAP = 14; 

    if (position === 'bottom') {
      tooltipY = targetRect.bottom + GAP;
      arrowY = targetRect.bottom + GAP - 6;
      isArrowUp = true;
    } else {
      tooltipY = targetRect.top - GAP;
      arrowY = targetRect.top - GAP;
      isArrowUp = false;
    }

    return { 
      position,
      tooltipX, // exact screen X for tooltip center to drop onto
      tooltipY,
      anchorX,  // true origin center of the highlighted rect
      arrowY,
      isArrowUp
    };
  };

  const { position, tooltipX, tooltipY, anchorX, arrowY, isArrowUp } = calculateTooltipPosition();
  const S = { fontFamily: "'Inter', sans-serif" };

  const baseTranslateY = position === 'top' ? '-100%' : '0px';
  const hiddenY = position === 'top' ? 'calc(-100% + 12px)' : '12px';
  const exitY = position === 'top' ? 'calc(-100% + 8px)' : '8px';

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {show && targetRect && !isScrolling && (
        <motion.div
          key="guide-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-0 z-[9998] touch-none"
          style={{ pointerEvents: 'auto' }}
        >
          {/* Base Overlay Box with Hole */}
          <motion.div
            initial={false}
            animate={{
              top: targetRect.top,
              left: targetRect.left,
              width: targetRect.width,
              height: targetRect.height,
              borderRadius: step.borderRadius || 16,
            }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            style={{
              position: 'absolute',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.82)',
              pointerEvents: 'none'
            }}
          />

          {/* Pulsing Outline */}
          <motion.div
            initial={false}
            animate={{
              top: targetRect.top,
              left: targetRect.left,
              width: targetRect.width,
              height: targetRect.height,
              borderRadius: step.borderRadius || 16,
            }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            style={{
              position: 'absolute',
              pointerEvents: 'none'
            }}
          >
            <motion.div 
               style={{ 
                  width: '100%', 
                  height: '100%', 
                  borderRadius: 'inherit', 
                  outline: '2.5px solid rgba(255,255,255,0.9)', 
                  outlineOffset: '4px' 
               }}
               animate={{ opacity: [1, 0.5, 1] }}
               transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>

          {/* Tooltip */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`tooltip-${currentStep}`}
              initial={{ opacity: 0, y: hiddenY, x: "-50%" }}
              animate={{ opacity: 1, y: baseTranslateY, x: "-50%" }}
              exit={{ opacity: 0, y: exitY, x: "-50%" }}
              transition={{ 
                opacity: { duration: 0.25, ease: 'easeOut' },
                y: { duration: 0.28, ease: 'easeOut' },
                x: { duration: 0.28, ease: 'easeOut' },
                exit: { duration: 0.18 }
              }}
              style={{
                position: 'absolute',
                top: tooltipY,
                left: tooltipX,
                background: '#000000',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '14px',
                padding: '16px 18px',
                width: '100%',
                maxWidth: '270px',
                minWidth: '200px',
                zIndex: 10000,
                boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                ...S
              }}
            >
              {/* Arrow */}
              <div 
                style={{
                  position: 'absolute',
                  top: isArrowUp ? -6 : '100%',
                  left: `calc(50% + ${anchorX - tooltipX}px - 5px)`,
                  width: 0,
                  height: 0,
                  borderLeft: '5px solid transparent',
                  borderRight: '5px solid transparent',
                  borderBottom: isArrowUp ? '6px solid #000000' : 'none',
                  borderTop: !isArrowUp ? '6px solid #000000' : 'none',
                }}
              />

              {/* Row 1 — Step counter and skip */}
              <div className="flex justify-between items-center w-full">
                <span className="text-[11px] text-[#888888]" style={S}>Step {currentStep + 1} of {steps.length}</span>
                <button onClick={onSkip} className="text-[11px] text-[#888888] active:opacity-70 transition-opacity" style={{ WebkitTapHighlightColor: 'transparent', ...S }}>Skip</button>
              </div>

              {/* Row 2 — Title */}
              <div className="mt-[10px] text-[16px] font-bold text-white flex gap-1.5 items-center leading-tight" style={S}>
                <span>{step.emoji}</span>
                <span>{step.title}</span>
              </div>

              {/* Row 3 — Description */}
              <div className="mt-[6px] text-[13px] text-[#CCCCCC] leading-[1.6]" style={S}>
                {step.description}
              </div>

              {/* Row 4 — Buttons */}
              <div className="mt-[14px] flex justify-between items-center w-full">
                {currentStep === steps.length - 1 ? (
                  <button 
                    onClick={() => onNext(steps.length)}
                    className="w-full bg-white text-black font-bold text-[13px] py-[10px] rounded-[10px] border mt-1 active:scale-[0.98] transition-transform"
                    style={{ WebkitTapHighlightColor: 'transparent', ...S }}
                  >
                    Got it! Let's go ✓
                  </button>
                ) : (
                  <>
                    <div className="flex-1">
                      {currentStep > 0 && (
                        <button 
                          onClick={onPrev}
                          className="text-[#888888] text-[13px] bg-transparent active:opacity-70 transition-opacity"
                          style={{ WebkitTapHighlightColor: 'transparent', ...S }}
                        >
                          ← Back
                        </button>
                      )}
                    </div>
                    <button 
                      onClick={() => onNext(steps.length)}
                      className="bg-white text-black font-bold text-[13px] px-[20px] py-[8px] rounded-[20px] active:scale-[0.96] transition-transform"
                      style={{ WebkitTapHighlightColor: 'transparent', ...S }}
                    >
                      Next →
                    </button>
                  </>
                )}
              </div>

            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
