import { useState } from 'react';
import { useLocation } from 'wouter';
import { User as UserIcon, Coins, Clock, LogOut, Calendar, Loader2, History } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useGetUser, useLogout } from '@workspace/api-client-react';
import { BottomNav } from '@/components/bottom-nav';

export default function ProfileScreen() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  
  // Guard the hook in case user is not fully loaded (though ProtectedRoute ensures it)
  const userId = user?.id || 0;
  
  const { data: profile, isLoading } = useGetUser(userId, {
    query: {
      enabled: !!user?.id
    }
  });

  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        logout();
        setLocation('/login');
      }
    });
  };

  return (
    <>
      <div className="flex-1 w-full h-full flex flex-col pt-8 pb-20">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="px-5">
            {/* Header */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-accent p-1 mb-4">
                <div className="w-full h-full bg-card rounded-full flex items-center justify-center border-2 border-transparent">
                  <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-primary to-accent">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">{profile?.username || user?.username}</h2>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              
              {user?.isAdmin && (
                <span className="mt-2 px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 text-[10px] uppercase font-bold tracking-wider">
                  Admin
                </span>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="bg-card border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center">
                <Coins className="w-6 h-6 text-secondary mb-2" />
                <span className="text-2xl font-mono font-bold text-white">{profile?.viewcoins || 0}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Viewcoins</span>
              </div>
              <div className="bg-card border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center">
                <Clock className="w-6 h-6 text-primary mb-2" />
                <span className="text-xl font-mono font-bold text-white mt-1">
                  {Math.floor((profile?.totalMinutesWatched || 0) / 60)}h {(profile?.totalMinutesWatched || 0) % 60}m
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Assistidos</span>
              </div>
            </div>

            {/* History & Menu */}
            <div className="space-y-4 mb-6">
              <h3 className="text-sm font-bold flex items-center gap-2 text-white">
                <History className="w-4 h-4 text-primary" /> Histórico Recente
              </h3>
              
              <div className="space-y-2">
                {profile?.recentTransactions?.length ? (
                  profile.recentTransactions.map((tx) => (
                    <div key={tx.id} className="bg-card border border-white/5 rounded-2xl p-3 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-white">{tx.channelName}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(tx.earnedAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-secondary/10 px-2 py-1 rounded-full border border-secondary/20">
                        <span className="text-xs font-bold text-secondary">+{tx.amount}</span>
                        <Coins className="w-3 h-3 text-secondary" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 bg-white/5 rounded-2xl text-xs text-muted-foreground">
                    Nenhuma viewcoin ganha ainda.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="bg-card border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Membro desde</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'Hoje'}
                  </p>
                </div>
              </div>

              <button 
                onClick={handleLogout}
                className="w-full bg-card border border-destructive/20 hover:bg-destructive/10 rounded-2xl p-4 flex items-center gap-3 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                  <LogOut className="w-4 h-4 text-destructive" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">Sair da conta</p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </>
  );
}
