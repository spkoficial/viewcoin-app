import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coins, Radio, ExternalLink, Play, Square, Tv2, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useGetCurrentSlot, useEarnViewcoins, useGetMe } from '@workspace/api-client-react';
import { useTimer } from '@/hooks/use-timer';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function HomeScreen() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const { data: meData, refetch: refetchMe } = useGetMe();
  const { data: slotData } = useGetCurrentSlot();
  const earnMutation = useEarnViewcoins();

  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (meData && user && meData.viewcoins !== user.viewcoins) {
      updateUser(meData);
    }
  }, [meData]);

  const handleTick = () => {
    if (!slotData?.hasSlot || !slotData.slot) return;
    earnMutation.mutate(
      { data: { minutesWatched: 5, channelName: slotData.slot.memberName, slotId: slotData.slot.id } },
      {
        onSuccess: () => {
          toast({ title: '🪙 +1 Viewcoin!', description: `Ganhou assistindo ${slotData.slot?.memberName}.` });
          refetchMe();
        },
        onError: () => {
          setIsLive(false);
          toast({ title: 'Erro na contagem', description: 'A conexão falhou. Reinicie.', variant: 'destructive' });
        },
      }
    );
  };

  const { formattedRemaining, progress } = useTimer(isLive, handleTick);

  const toggleLive = () => {
    if (!slotData?.hasSlot) {
      toast({ title: 'Nenhum canal ativo agora', description: 'Veja a Grade para os próximos horários.', variant: 'destructive' });
      return;
    }

    if (!isLive) {
      const link = slotData.slot?.channelLink;
      if (link) window.open(link, '_blank', 'noopener,noreferrer');
    }

    setIsLive(prev => !prev);
  };

  const activeSlot = slotData?.slot;
  const currentCoins = meData?.viewcoins ?? user?.viewcoins ?? 0;

  return (
    <div className="flex-1 w-full flex flex-col pt-4 px-4 pb-4 gap-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-400 font-bold text-sm">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-[10px] text-white/40">Bem-vindo,</p>
            <p className="text-sm font-semibold text-white truncate max-w-[110px]">{user?.username}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-400/20 px-3 py-1.5 rounded-full">
          <Coins className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-400 font-mono font-bold text-sm">{currentCoins}</span>
        </div>
      </div>

      {/* Current channel card */}
      <div className={cn(
        "relative w-full rounded-2xl overflow-hidden border p-4 flex flex-col items-center text-center transition-all",
        activeSlot
          ? "bg-fuchsia-950/60 border-fuchsia-500/40"
          : "bg-zinc-800/50 border-white/10"
      )}>
        {activeSlot && (
          <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-600/10 to-transparent pointer-events-none" />
        )}
        {activeSlot ? (
          <>
            <div className="flex items-center gap-1.5 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-red-500/30 mb-2">
              <Radio className="w-3 h-3 animate-pulse" /> AO VIVO AGORA
            </div>
            <p className="text-xl font-black text-white">{activeSlot.memberName}</p>
            <a
              href={activeSlot.channelLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-fuchsia-400 flex items-center gap-1 mt-1 hover:underline"
            >
              {activeSlot.channelLink} <ExternalLink className="w-3 h-3" />
            </a>
          </>
        ) : (
          <div className="flex flex-col items-center py-2 gap-2">
            <Tv2 className="w-8 h-8 text-white/20" />
            <p className="text-sm text-white/40">Nenhum canal agora</p>
            <p className="text-[10px] text-white/25">Veja a Grade para os próximos horários</p>
          </div>
        )}
      </div>

      {/* LIGAR button */}
      <div className="flex flex-col items-center gap-3">

        {/* Progress ring */}
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="88" cy="88" r="82" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/5" />
            <circle
              cx="88" cy="88" r="82" fill="none" stroke="currentColor" strokeWidth="4"
              className={cn("transition-all duration-1000 ease-linear", isLive ? "text-fuchsia-500" : "text-transparent")}
              strokeDasharray="515"
              strokeDashoffset={515 - (515 * progress) / 100}
              strokeLinecap="round"
            />
          </svg>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={toggleLive}
            className={cn(
              "relative z-10 w-36 h-36 rounded-full flex flex-col items-center justify-center border-4 transition-all duration-500 shadow-2xl",
              isLive
                ? "bg-fuchsia-600/20 border-fuchsia-500 shadow-fuchsia-500/30"
                : activeSlot
                  ? "bg-zinc-800 border-fuchsia-500/60 hover:border-fuchsia-400"
                  : "bg-zinc-800 border-white/10"
            )}
          >
            {isLive ? (
              <>
                <Square className="w-8 h-8 text-fuchsia-400 mb-1 fill-fuchsia-400" />
                <p className="text-2xl font-mono font-bold text-white leading-none">{formattedRemaining}</p>
                <p className="text-[9px] uppercase tracking-widest text-fuchsia-400 font-bold mt-1">assistindo</p>
              </>
            ) : (
              <>
                <Play className="w-10 h-10 text-white/80 mb-1 fill-white/80" />
                <p className="text-sm font-bold text-white/80 uppercase tracking-widest">Ligar</p>
              </>
            )}
          </motion.button>
        </div>

        {/* Hint text */}
        <div className="text-center px-6">
          {isLive ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-fuchsia-400 font-medium flex items-center justify-center gap-1"
            >
              <Zap className="w-3 h-3" /> Ganhando 1 Viewcoin a cada 5 min
            </motion.p>
          ) : (
            <p className="text-[11px] text-white/30 leading-relaxed">
              {activeSlot
                ? 'Toque em Ligar — o canal Kick abrirá no seu navegador'
                : 'Sem transmissão no momento. Volte mais tarde.'}
            </p>
          )}
        </div>
      </div>

      <div className="flex-1" />
    </div>
  );
}
