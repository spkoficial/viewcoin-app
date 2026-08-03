import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Power, Coins, Radio, ExternalLink, Play, SquareSquare } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useGetCurrentSlot, useEarnViewcoins, useGetMe } from '@workspace/api-client-react';
import { useTimer } from '@/hooks/use-timer';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { BottomNav } from '@/components/bottom-nav';

export default function HomeScreen() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  // Real-time data from API
  const { data: meData, refetch: refetchMe } = useGetMe();
  const { data: slotData } = useGetCurrentSlot();
  const earnMutation = useEarnViewcoins();

  const [isLive, setIsLive] = useState(false);

  // Sync user data if updated from server
  useEffect(() => {
    if (meData && user) {
      if (meData.viewcoins !== user.viewcoins) {
        updateUser(meData);
      }
    }
  }, [meData]);

  const handleTick = () => {
    if (!slotData?.hasSlot || !slotData.slot) return;

    earnMutation.mutate({
      data: {
        minutesWatched: 5,
        channelName: slotData.slot.memberName,
        slotId: slotData.slot.id
      }
    }, {
      onSuccess: (res) => {
        toast({
          title: "Moeda Adquirida!",
          description: `Você ganhou ${res.viewcoinsEarned} Viewcoin assistindo ${slotData.slot?.memberName}.`,
        });
        refetchMe();
      },
      onError: () => {
        setIsLive(false);
        toast({
          title: "Erro na contagem",
          description: "A conexão falhou. Reinicie a contagem.",
          variant: "destructive"
        });
      }
    });
  };

  const { formattedRemaining, progress } = useTimer(isLive, handleTick);

  const toggleLive = () => {
    if (!slotData?.hasSlot) {
      toast({
        title: "Nenhum canal ativo",
        description: "Não há transmissão na grade neste momento.",
        variant: "destructive"
      });
      return;
    }

    if (!isLive && slotData.slot?.channelLink) {
      // Open channel in new tab when starting
      window.open(slotData.slot.channelLink, '_blank', 'noopener,noreferrer');
    }

    setIsLive(!isLive);
  };

  const activeSlot = slotData?.slot;
  const currentCoins = meData?.viewcoins ?? user?.viewcoins ?? 0;

  return (
    <>
      <div className="flex-1 w-full h-full flex flex-col pt-4 px-5 pb-6">
        
        {/* Top Banner - Profile summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary font-bold shadow-[0_0_15px_rgba(217,70,239,0.2)]">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Bem-vindo,</p>
              <p className="text-sm font-semibold truncate max-w-[120px]">{user?.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-secondary/10 border border-secondary/20 px-3 py-1.5 rounded-full">
            <Coins className="w-4 h-4 text-secondary animate-coin-shine" />
            <span className="text-secondary font-mono font-bold">{currentCoins}</span>
          </div>
        </div>

        {/* Current Live Card */}
        <div className="relative w-full rounded-2xl overflow-hidden bg-card border border-white/10 p-5 mb-8 flex flex-col justify-center min-h-[140px]">
          {/* Animated gradient bg */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 animate-gradient-x opacity-50",
            slotData?.hasSlot ? 'opacity-100' : 'opacity-0'
          )} />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            {slotData?.hasSlot && activeSlot ? (
              <>
                <div className="flex items-center gap-2 mb-2 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-red-500/30">
                  <Radio className="w-3 h-3 animate-pulse" />
                  AO VIVO AGORA
                </div>
                <h2 className="text-2xl font-black text-white mb-1">{activeSlot.memberName}</h2>
                <a 
                  href={activeSlot.channelLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary flex items-center gap-1 hover:underline"
                >
                  Abrir Canal <ExternalLink className="w-3 h-3" />
                </a>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                  <SquareSquare className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Nenhum canal na grade agora</p>
              </>
            )}
          </div>
        </div>

        {/* The Core Interaction Area */}
        <div className="flex-1 flex flex-col items-center justify-center relative -mt-4">
          
          {/* Circular Progress Ring */}
          <div className="relative w-56 h-56 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle 
                cx="112" cy="112" r="106" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="4" 
                className="text-white/5" 
              />
              <circle 
                cx="112" cy="112" r="106" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="4" 
                className={cn(
                  "transition-all duration-1000 ease-linear",
                  isLive ? "text-primary" : "text-transparent"
                )}
                strokeDasharray="666" 
                strokeDashoffset={666 - (666 * progress) / 100}
                strokeLinecap="round"
              />
            </svg>

            {/* Giant Power Button inside the ring */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleLive}
              className={cn(
                "relative z-10 w-44 h-44 rounded-full flex flex-col items-center justify-center border-4 transition-all duration-500 shadow-2xl",
                isLive 
                  ? "bg-primary/10 border-primary shadow-[0_0_60px_rgba(217,70,239,0.3)] animate-active-pulse" 
                  : "bg-card border-white/10 hover:border-white/20"
              )}
            >
              {isLive ? (
                <>
                  <div className="text-4xl font-mono font-bold text-white mb-1 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                    {formattedRemaining}
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-primary font-bold">LIGADO</p>
                </>
              ) : (
                <>
                  <Power className="w-12 h-12 text-white/50 mb-2" />
                  <span className="text-sm font-bold text-white/50 uppercase tracking-widest">Ligar</span>
                </>
              )}
            </motion.button>
          </div>

          <div className="mt-8 text-center px-4">
            {isLive ? (
              <p className="text-xs text-primary font-medium animate-pulse">
                Ganhando 1 Viewcoin a cada 5 minutos.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Clique em Ligar para abrir a live e iniciar o contador.
              </p>
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
