import { useState, useEffect } from 'react';

export function usePageGuide(pageName) {
  const [showGuide, setShowGuide] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    const key = `guide_seen_${pageName}`;
    const hasSeen = localStorage.getItem(key);
    
    if (!hasSeen) {
      setIsFirstTime(true);
      // Wait 600ms after page loads fully
      const timer = setTimeout(() => {
        setShowGuide(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [pageName]);

  const startGuide = () => {
    setCurrentStep(0);
    setShowGuide(true);
  };

  const nextStep = (totalSteps) => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeGuide();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const skipGuide = () => {
    completeGuide();
  };

  const completeGuide = () => {
    setShowGuide(false);
    localStorage.setItem(`guide_seen_${pageName}`, 'true');
    setIsFirstTime(false);
  };

  return {
    showGuide,
    currentStep,
    isFirstTime,
    startGuide,
    nextStep,
    prevStep,
    skipGuide
  };
}
