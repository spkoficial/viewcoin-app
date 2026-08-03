import { Link, useLocation } from 'wouter';
import { Home, Calendar, Trophy, User, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

export function BottomNav() {
  const [location] = useLocation();
  const { user } = useAuth();

  const navItems = [
    { href: '/home',    icon: Home,     label: 'Início'  },
    { href: '/grade',   icon: Calendar, label: 'Grade'   },
    { href: '/ranking', icon: Trophy,   label: 'Ranking' },
    { href: '/perfil',  icon: User,     label: 'Perfil'  },
    ...(user?.isAdmin ? [{ href: '/admin', icon: Shield, label: 'Admin' }] : []),
  ];

  return (
    /* shrink-0 so it never gets squeezed; rounded-b matches the phone frame */
    <div className="shrink-0 w-full bg-zinc-900/95 backdrop-blur-xl border-t border-white/10 pb-4 pt-1.5 px-2 flex items-center justify-around rounded-b-[2.5rem]">
      {navItems.map((item) => {
        const isActive = location === item.href;
        const Icon = item.icon;

        return (
          <Link key={item.href} href={item.href}>
            <div className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200",
              isActive
                ? "text-fuchsia-400"
                : "text-white/40 hover:text-white/70"
            )}>
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn("text-[9px] font-semibold uppercase tracking-wider", isActive ? "text-fuchsia-400" : "text-white/30")}>
                {item.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-fuchsia-400 animate-pulse" />
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
