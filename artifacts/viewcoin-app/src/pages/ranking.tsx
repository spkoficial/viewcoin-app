import { Trophy, Medal, Coins, Loader2 } from 'lucide-react';
import { useGetRanking } from '@workspace/api-client-react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function RankingScreen() {
  const { user } = useAuth();
  const { data: ranking, isLoading } = useGetRanking();

  return (
    <>
      <div className="flex-1 w-full h-full flex flex-col pt-6">
        <div className="px-5 mb-6 text-center">
          <div className="w-12 h-12 rounded-full bg-secondary/20 mx-auto flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Trophy className="w-6 h-6 text-secondary" />
          </div>
          <h1 className="text-xl font-bold">Hall da Fama</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Os maiores apoiadores da comunidade
          </p>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-secondary" />
          </div>
        ) : (
          <div className="flex-1 overflow-auto no-scrollbar px-4 flex flex-col gap-3">
            {ranking?.map((entry, index) => {
              const isMe = entry.userId === user?.id;
              
              // Top 3 colors
              let rankColor = "text-muted-foreground";
              let badgeColor = "bg-white/5 border-white/10";
              if (entry.position === 1) {
                rankColor = "text-yellow-400";
                badgeColor = "bg-yellow-400/20 border-yellow-400/50 shadow-[0_0_15px_rgba(250,204,21,0.3)]";
              } else if (entry.position === 2) {
                rankColor = "text-slate-300";
                badgeColor = "bg-slate-300/20 border-slate-300/50";
              } else if (entry.position === 3) {
                rankColor = "text-amber-600";
                badgeColor = "bg-amber-600/20 border-amber-600/50";
              }

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={entry.userId}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-2xl border transition-all",
                    isMe 
                      ? "bg-primary/10 border-primary/50" 
                      : "bg-card border-white/5"
                  )}
                >
                  <div className={cn("w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-xs border", badgeColor, rankColor)}>
                    {entry.position <= 3 ? <Medal className="w-4 h-4" /> : entry.position}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-bold truncate", isMe ? "text-primary" : "text-white")}>
                      {entry.username} {isMe && "(Você)"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {Math.floor(entry.totalMinutesWatched / 60)}h {(entry.totalMinutesWatched % 60)}m assistidos
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5 bg-secondary/10 px-2.5 py-1 rounded-full border border-secondary/20">
                    <span className="text-sm font-mono font-bold text-secondary">{entry.viewcoins}</span>
                    <Coins className="w-3.5 h-3.5 text-secondary" />
                  </div>
                </motion.div>
              );
            })}

            {(!ranking || ranking.length === 0) && (
              <div className="text-center py-10 text-muted-foreground text-sm">
                Nenhum dado no ranking ainda.
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
