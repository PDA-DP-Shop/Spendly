import React from 'react';
import { Smartphone, ShoppingBag } from 'lucide-react';

const DesktopBlockScreen = () => {
  return (
    <div className="h-screen w-full bg-white flex flex-col items-center justify-center p-12 text-center">
      <div className="relative mb-12">
        <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center">
          <ShoppingBag className="w-16 h-16 text-primary" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
          <Smartphone className="w-6 h-6 text-primary" />
        </div>
      </div>
      
      <h1 className="text-3xl font-black text-slate-900 mb-6 leading-tight">
        📱 Spendly Shop works on phones and tablets only
      </h1>
      
      <p className="text-slate-500 text-lg font-medium mb-12 max-w-sm">
        To manage your business privately and securely, please open this app on your mobile device.
      </p>

      <div className="px-8 py-3 bg-emerald-50 text-primary font-black text-sm rounded-full tracking-widest uppercase mb-4">
        Mobile First Experience
      </div>
      
      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
        Self-Hosted • Offline • Secure
      </p>
    </div>
  );
};

export default DesktopBlockScreen;
