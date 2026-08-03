import { ReactNode } from 'react';
import { Battery, Signal, Wifi } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

// User asset path resolution
import phoneFrameSrc from '@assets/image_1785729593271.png';

export function PhoneLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { isLoggedIn } = useAuth();
  
  // Is this a fullscreen layout (no bottom nav)?
  const isFullscreen = location === '/' || location === '/login';

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-black/95 relative overflow-hidden">
      
      {/* Decorative background blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Phone Container */}
      <div className="relative w-full max-w-[400px] aspect-[1/2.1] max-h-[95dvh] flex items-center justify-center">
        
        {/* The Frame Image — sits behind content so the bezel frames it visually */}
        <img 
          src={phoneFrameSrc} 
          alt="Phone Frame" 
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10 drop-shadow-2xl"
        />

        {/* The Inner Screen - positioned above the frame image, aligned to the white screen area */}
        <div 
          className="absolute z-20 bg-background overflow-hidden flex flex-col shadow-inner"
          style={{
            top: '11.5%',
            left: '8%',
            width: '84%',
            height: '77.5%',
            borderRadius: '2.5rem',
          }}
        >
          {/* Status Bar */}
          <div className="w-full h-8 flex items-center justify-between px-6 pt-1 text-[10px] font-medium text-foreground/80 z-50 bg-background/80 backdrop-blur-md sticky top-0 shrink-0">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4" />
            </div>
          </div>

          {/* Dynamic Notch Area Padding - Since we scroll beneath it, we add padding to the top of the scrolling container if needed */}

          {/* Main Content Area */}
          <main className="flex-1 w-full overflow-y-auto no-scrollbar relative flex flex-col pb-24">
            {children}
          </main>

          {/* Bottom Home Indicator */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-white/20 rounded-full z-50 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
