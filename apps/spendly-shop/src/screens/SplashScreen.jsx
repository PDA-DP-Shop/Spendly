import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import { useShopStore } from '../store/shopStore';

const shopAnimation = {}; // Placeholder animation data

const SplashScreen = () => {
  const navigate = useNavigate();
  const { loadShop, shop } = useShopStore();

  useEffect(() => {
    const init = async () => {
      await loadShop();
      
      setTimeout(() => {
        if (useShopStore.getState().shop) {
          navigate('/lock');
        } else {
          navigate('/onboarding');
        }
      }, 2000);
    };

    init();
  }, [loadShop, navigate]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
      <div className="w-64 h-64 mb-8">
        {/* Placeholder for Lottie - using a colorful shop opening animation structure */}
        <Lottie 
          animationData={shopAnimation}
          loop={true}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      
      <h1 className="text-3xl font-black text-slate-900 mb-2">Spendly Shop</h1>
      <p className="text-slate-500 font-medium tracking-wide mb-12">Fast billing for your shop</p>

      <div className="fixed bottom-12 w-full px-12 space-y-3">
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary animate-count-up w-full origin-left"></div>
        </div>
        <p className="text-center text-xs font-bold text-primary tracking-widest uppercase">Setting up...</p>
      </div>
    </div>
  );
};

export default SplashScreen;
