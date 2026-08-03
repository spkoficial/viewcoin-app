import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { Coins } from 'lucide-react';

export default function BootScreen() {
  const [, setLocation] = useLocation();
  const { isLoggedIn } = useAuth();

  // Auto-navigate after the splash animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setLocation(isLoggedIn ? '/home' : '/login');
    }, 2200);
    return () => clearTimeout(timer);
  }, [isLoggedIn, setLocation]);

  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-6 bg-zinc-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center"
      >
        <motion.div
          animate={{ boxShadow: ['0 0 20px rgba(217,70,239,0.3)', '0 0 60px rgba(217,70,239,0.6)', '0 0 20px rgba(217,70,239,0.3)'] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 to-fuchsia-500 flex items-center justify-center mb-6"
        >
          <Coins className="w-12 h-12 text-white" />
        </motion.div>

        <h1 className="text-4xl font-black tracking-tight text-white mb-2">ViewCoin</h1>
        <p className="text-sm text-white/40 font-mono tracking-widest uppercase">Carregando…</p>
      </motion.div>

      {/* Loading dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-16 flex gap-2"
      >
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            className="w-2 h-2 rounded-full bg-purple-500"
          />
        ))}
      </motion.div>
    </div>
  );
}
