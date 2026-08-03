import { Link, useLocation } from 'wouter';
import { Home, Calendar, Trophy, User, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: '/home', icon: Home, label: 'Home' },
    { href: '/grade', icon: Calendar, label: 'Grade' },
    { href: '/ranking', icon: Trophy, label: 'Ranking' },
    { href: '/perfil', icon: User, label: 'Perfil' },
    { href: '/instrucoes', icon: Info, label: 'Info' },
  ];

  return (
    <div className="absolute bottom-0 left-0 w-full bg-background/80 backdrop-blur-xl border-t border-white/5 pb-5 pt-3 px-4 flex items-center justify-between z-40 rounded-b-[2rem]">
      {navItems.map((item) => {
        const isActive = location === item.href;
        const Icon = item.icon;

        return (
          <Link key={item.href} href={item.href}>
            <div className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300",
              isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}>
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-primary mt-0.5 animate-pulse" />
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
