import { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, Loader2, X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useListSchedule, useCreateSlot, useUpsertSlot, useDeleteSlot } from '@workspace/api-client-react';
import { BottomNav } from '@/components/bottom-nav';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function ScheduleScreen() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: slots, isLoading, refetch } = useListSchedule();
  
  const createMutation = useCreateSlot();
  const updateMutation = useUpsertSlot();
  const deleteMutation = useDeleteSlot();

  const [selectedCell, setSelectedCell] = useState<{day: number, hour: number} | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [memberName, setMemberName] = useState('');
  const [channelLink, setChannelLink] = useState('');

  // Matrix to quickly look up slots by day and hour
  const grid = useMemo(() => {
    const mat: Record<string, any> = {};
    slots?.forEach(slot => {
      for(let h = slot.hourStart; h < slot.hourEnd; h++) {
        mat[`${slot.dayOfWeek}-${h}`] = slot;
      }
    });
    return mat;
  }, [slots]);

  const handleCellClick = (day: number, hour: number) => {
    if (!user?.isAdmin) return; // Only admin can edit

    const existingSlot = grid[`${day}-${hour}`];
    setSelectedCell({ day, hour });
    
    if (existingSlot) {
      setMemberName(existingSlot.memberName);
      setChannelLink(existingSlot.channelLink);
    } else {
      setMemberName('');
      setChannelLink('');
    }
    
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!selectedCell || !memberName || !channelLink) return;
    
    const existingSlot = grid[`${selectedCell.day}-${selectedCell.hour}`];
    const payload = {
      data: {
        dayOfWeek: selectedCell.day,
        hourStart: selectedCell.hour,
        hourEnd: selectedCell.hour + 1, // Default to 1 hour slot for simplicity in UI, can be expanded
        memberName,
        channelLink
      }
    };

    const onSuccess = () => {
      toast({ title: 'Grade atualizada' });
      setModalOpen(false);
      refetch();
    };

    if (existingSlot) {
      // Upsert/Update existing
      // Technically, if they just clicked a block that covers multiple hours, we overwrite the whole block
      updateMutation.mutate({ id: existingSlot.id, ...payload }, { onSuccess });
    } else {
      createMutation.mutate(payload, { onSuccess });
    }
  };

  const handleDelete = () => {
    if (!selectedCell) return;
    const existingSlot = grid[`${selectedCell.day}-${selectedCell.hour}`];
    if (existingSlot) {
      deleteMutation.mutate({ id: existingSlot.id }, {
        onSuccess: () => {
          toast({ title: 'Horário liberado' });
          setModalOpen(false);
          refetch();
        }
      });
    }
  };

  // Current time highlighting
  const now = new Date();
  const currentDay = now.getDay();
  const currentHour = now.getHours();

  return (
    <>
      <div className="flex-1 w-full h-full flex flex-col pt-6 pb-20">
        <div className="px-5 mb-4">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" /> Grade de Lives
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {user?.isAdmin ? "Toque num bloco para editar." : "Confira quem está ao vivo em cada horário."}
          </p>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex-1 overflow-auto no-scrollbar px-3">
            <div className="bg-card border border-white/5 rounded-2xl overflow-hidden relative">
              {/* Header Row */}
              <div className="flex sticky top-0 bg-card/90 backdrop-blur-sm z-20 border-b border-white/5">
                <div className="w-12 shrink-0 border-r border-white/5 bg-card/50" />
                {DAYS.map((day, i) => (
                  <div key={day} className={cn(
                    "flex-1 text-center py-2 text-[10px] font-bold uppercase tracking-wider",
                    currentDay === i ? "text-primary bg-primary/10" : "text-muted-foreground"
                  )}>
                    {day}
                  </div>
                ))}
              </div>

              {/* Grid Body */}
              <div className="flex flex-col">
                {HOURS.map(hour => (
                  <div key={hour} className="flex border-b border-white/5 last:border-0 relative">
                    <div className="w-12 shrink-0 border-r border-white/5 flex items-center justify-center py-2 text-[10px] text-muted-foreground bg-card/30">
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    {DAYS.map((_, dayIndex) => {
                      const slot = grid[`${dayIndex}-${hour}`];
                      const isCurrent = currentDay === dayIndex && currentHour === hour;
                      
                      return (
                        <div 
                          key={dayIndex} 
                          onClick={() => handleCellClick(dayIndex, hour)}
                          className={cn(
                            "flex-1 min-h-[40px] border-r border-white/5 last:border-0 p-1 flex items-center justify-center text-[9px] font-medium text-center truncate transition-colors",
                            user?.isAdmin && "cursor-pointer hover:bg-white/5",
                            slot ? "bg-primary/20 text-primary-foreground border border-primary/30" : "",
                            isCurrent && !slot && "bg-white/5",
                            isCurrent && slot && "bg-primary text-white font-bold shadow-[0_0_10px_rgba(217,70,239,0.5)] z-10"
                          )}
                        >
                          {slot ? (
                            <span className="block truncate w-full px-1">{slot.memberName}</span>
                          ) : (
                            user?.isAdmin ? <span className="opacity-0 hover:opacity-100"><Plus className="w-3 h-3 text-muted-foreground mx-auto" /></span> : null
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav />

      <AnimatePresence>
        {modalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-5">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-[320px] rounded-2xl bg-card border border-white/10 p-5 shadow-2xl flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">
                  {DAYS[selectedCell?.day || 0]}, {selectedCell?.hour?.toString().padStart(2, '0')}:00
                </h2>
                <button onClick={() => setModalOpen(false)} className="p-1 rounded-full hover:bg-white/10">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Membro / Canal</label>
                  <input 
                    value={memberName}
                    onChange={e => setMemberName(e.target.value)}
                    placeholder="Ex: Alanzoka" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Link da Live</label>
                  <input 
                    value={channelLink}
                    onChange={e => setChannelLink(e.target.value)}
                    placeholder="https://kick.com/..." 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {grid[`${selectedCell?.day}-${selectedCell?.hour}`] && (
                    <button 
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className="flex-1 bg-destructive/20 hover:bg-destructive/30 text-destructive py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      Remover
                    </button>
                  )}
                  <button 
                    onClick={handleSave}
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
