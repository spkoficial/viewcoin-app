import { ReactNode } from 'react';
import { Battery, Signal, Wifi } from 'lucide-react';
import { useLocation } from 'wouter';
import { BottomNav } from './bottom-nav';

// User asset path resolution
import phoneFrameSrc from '@assets/image_1785729593271.png';

const ROUTES_WITH_NAV = ['/home', '/grade', '/ranking', '/perfil', '/instrucoes', '/admin'];

export function PhoneLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const isBootScreen = location === '/';
  const showNav = ROUTES_WITH_NAV.includes(location);

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-zinc-950 relative overflow-hidden">

      {/* Decorative background blurs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-fuchsia-600/15 rounded-full blur-[150px] pointer-events-none" />

      {/* Phone Container */}
      <div className="relative w-full max-w-[520px] aspect-[1/2.1] max-h-[96dvh] flex items-center justify-center">

        {/* The Frame Image */}
        <img
          src={phoneFrameSrc}
          alt="Phone Frame"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10 drop-shadow-2xl"
          style={{ mixBlendMode: 'multiply' }}
        />

        {/* The Inner Screen */}
        <div
          className="absolute z-20 bg-zinc-900 flex flex-col overflow-hidden"
          style={{
            top: '11.5%',
            left: '8%',
            width: '84%',
            height: '77.5%',
            borderRadius: '2.5rem',
          }}
        >
          {/* Status Bar — sticky, never scrolls away */}
          {!isBootScreen && (
            <div className="w-full h-8 flex items-center justify-between px-6 pt-1 text-[10px] font-medium text-white/70 shrink-0 bg-zinc-900/80 backdrop-blur-md border-b border-white/5">
              <span>9:41</span>
              <div className="flex items-center gap-1.5">
                <Signal className="w-3.5 h-3.5" />
                <Wifi className="w-3.5 h-3.5" />
                <Battery className="w-4 h-4" />
              </div>
            </div>
          )}

          {/* Scrollable content — no bottom padding since nav is outside */}
          <main className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col">
            {children}
          </main>

          {/* Bottom Navigation — outside the scroll area so it never overlaps content */}
          {showNav && <BottomNav />}

          {/* Home indicator bar — only when there's no nav */}
          {!showNav && (
            <div className="shrink-0 pb-1 flex justify-center">
              <div className="w-1/3 h-1 bg-white/20 rounded-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
