import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { Coins, Power } from 'lucide-react';

export default function BootScreen() {
  const [, setLocation] = useLocation();
  const { isLoggedIn } = useAuth();
  const [isBooting, setIsBooting] = useState(false);

  const handlePowerOn = () => {
    setIsBooting(true);
    setTimeout(() => {
      if (isLoggedIn) {
        setLocation('/home');
      } else {
        setLocation('/login');
      }
    }, 1500);
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-6 bg-black">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center mb-16"
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(217,70,239,0.4)] animate-coin-shine">
          <Coins className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">ViewCoin</h1>
        <p className="text-muted-foreground text-sm font-mono tracking-widest uppercase">System Ready</p>
      </motion.div>

      <motion.button
        onClick={handlePowerOn}
        disabled={isBooting}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="group relative w-32 h-32 rounded-full flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl group-hover:bg-primary/40 transition-colors" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/5 to-transparent border border-white/10" />
        <div className={`relative z-10 w-24 h-24 rounded-full bg-card border border-white/10 flex items-center justify-center shadow-2xl transition-all duration-500 ${isBooting ? 'shadow-[0_0_50px_rgba(217,70,239,0.8)] border-primary' : ''}`}>
          <Power className={`w-10 h-10 ${isBooting ? 'text-primary animate-pulse' : 'text-white/50'}`} />
        </div>
      </motion.button>
      
      <div className="mt-8 h-6 flex items-center">
        {isBooting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-primary font-mono tracking-widest animate-pulse"
          >
            INICIALIZANDO...
          </motion.div>
        )}
      </div>
    </div>
  );
}
