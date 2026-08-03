import { useState, useMemo } from 'react';
import { Shield, Clock, Plus, Loader2, X, Trash2, Save } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { useListSchedule, useCreateSlot, useUpsertSlot, useDeleteSlot } from '@workspace/api-client-react';
import { BottomNav } from '@/components/bottom-nav';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function AdminScreen() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect non-admins
  if (!user?.isAdmin) {
    setLocation('/home');
    return null;
  }

  const { data: slots, isLoading, refetch } = useListSchedule();
  const createMutation = useCreateSlot();
  const updateMutation = useUpsertSlot();
  const deleteMutation = useDeleteSlot();

  const [selectedCell, setSelectedCell] = useState<{ day: number; hour: number } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [channelLink, setChannelLink] = useState('');

  const grid = useMemo(() => {
    const mat: Record<string, any> = {};
    slots?.forEach(slot => {
      for (let h = slot.hourStart; h < slot.hourEnd; h++) {
        mat[`${slot.dayOfWeek}-${h}`] = slot;
      }
    });
    return mat;
  }, [slots]);

  const now = new Date();
  const currentDay = now.getDay();
  const currentHour = now.getHours();

  const openModal = (day: number, hour: number) => {
    const existing = grid[`${day}-${hour}`];
    setSelectedCell({ day, hour });
    setMemberName(existing?.memberName || '');
    setChannelLink(existing?.channelLink || '');
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!selectedCell || !memberName.trim() || !channelLink.trim()) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }
    const existing = grid[`${selectedCell.day}-${selectedCell.hour}`];
    const payload = {
      data: {
        dayOfWeek: selectedCell.day,
        hourStart: selectedCell.hour,
        hourEnd: selectedCell.hour + 1,
        memberName: memberName.trim(),
        channelLink: channelLink.trim(),
      },
    };
    const onSuccess = () => {
      toast({ title: 'Salvo!', description: `${memberName} — ${DAYS[selectedCell.day]} ${selectedCell.hour}h` });
      setModalOpen(false);
      refetch();
    };
    if (existing) {
      updateMutation.mutate({ id: existing.id, ...payload }, { onSuccess });
    } else {
      createMutation.mutate(payload, { onSuccess });
    }
  };

  const handleDelete = () => {
    if (!selectedCell) return;
    const existing = grid[`${selectedCell.day}-${selectedCell.hour}`];
    if (!existing) return;
    deleteMutation.mutate({ id: existing.id }, {
      onSuccess: () => {
        toast({ title: 'Horário removido' });
        setModalOpen(false);
        refetch();
      },
    });
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <div className="flex-1 w-full flex flex-col pt-4 pb-4">
        {/* Header */}
        <div className="px-4 mb-3">
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-fuchsia-400" /> Painel Admin
          </h1>
          <p className="text-[11px] text-white/40 mt-0.5">
            Toque num horário para adicionar ou editar o streamer
          </p>
        </div>

        {/* Legend */}
        <div className="px-4 mb-2 flex items-center gap-3 text-[10px] text-white/40">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-fuchsia-600/50 inline-block" /> Com live</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-400/30 inline-block" /> Agora</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-white/5 inline-block" /> Livre</span>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-fuchsia-400" />
          </div>
        ) : (
          <div className="flex-1 overflow-auto no-scrollbar px-2">
            <div className="bg-zinc-800/50 border border-white/5 rounded-2xl overflow-hidden">
              {/* Header Row */}
              <div className="flex sticky top-0 bg-zinc-900/95 backdrop-blur-sm z-20 border-b border-white/5">
                <div className="w-10 shrink-0 border-r border-white/5" />
                {DAYS.map((day, i) => (
                  <div key={day} className={cn(
                    "flex-1 text-center py-1.5 text-[9px] font-bold uppercase tracking-wider",
                    currentDay === i ? "text-fuchsia-400 bg-fuchsia-500/10" : "text-white/30"
                  )}>
                    {day}
                  </div>
                ))}
              </div>

              {/* Grid */}
              {HOURS.map(hour => (
                <div key={hour} className="flex border-b border-white/5 last:border-0">
                  <div className="w-10 shrink-0 border-r border-white/5 flex items-center justify-center py-1 text-[9px] text-white/25 bg-zinc-900/30">
                    {hour.toString().padStart(2, '0')}h
                  </div>
                  {DAYS.map((_, dayIndex) => {
                    const slot = grid[`${dayIndex}-${hour}`];
                    const isCurrent = currentDay === dayIndex && currentHour === hour;
                    return (
                      <div
                        key={dayIndex}
                        onClick={() => openModal(dayIndex, hour)}
                        className={cn(
                          "flex-1 min-h-[36px] border-r border-white/5 last:border-0 p-0.5 flex items-center justify-center text-[8px] font-medium text-center cursor-pointer transition-all active:scale-95",
                          slot ? "bg-fuchsia-600/25 text-fuchsia-300" : "hover:bg-white/5 text-white/20",
                          isCurrent && slot && "bg-yellow-400/25 text-yellow-300 font-bold",
                          isCurrent && !slot && "bg-yellow-400/10"
                        )}
                      >
                        {slot ? (
                          <span className="block truncate w-full px-0.5 leading-tight">{slot.memberName}</span>
                        ) : (
                          <Plus className="w-2.5 h-2.5 opacity-20 mx-auto" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />

      {/* Edit Modal */}
      <AnimatePresence>
        {modalOpen && selectedCell && (
          <div className="absolute inset-0 z-50 flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              className="relative w-full bg-zinc-900 border-t border-white/10 rounded-t-3xl p-5 flex flex-col gap-4 shadow-2xl"
              style={{ maxHeight: '70%' }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-fuchsia-400" />
                    {DAYS[selectedCell.day]} — {selectedCell.hour.toString().padStart(2, '0')}:00h
                  </h2>
                  <p className="text-[10px] text-white/30 mt-0.5">
                    {grid[`${selectedCell.day}-${selectedCell.hour}`] ? 'Editar horário' : 'Adicionar streamer'}
                  </p>
                </div>
                <button onClick={() => setModalOpen(false)} className="p-2 rounded-full hover:bg-white/10">
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>

              {/* Fields */}
              <div className="flex flex-col gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-white/50 font-medium uppercase tracking-wider">Nome do streamer</label>
                  <input
                    value={memberName}
                    onChange={e => setMemberName(e.target.value)}
                    placeholder="Ex: Alanzoka"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-white/50 font-medium uppercase tracking-wider">Link da Kick</label>
                  <input
                    value={channelLink}
                    onChange={e => setChannelLink(e.target.value)}
                    placeholder="https://kick.com/nomedostreamer"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                {grid[`${selectedCell.day}-${selectedCell.hour}`] && (
                  <button
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="flex items-center gap-1.5 bg-red-900/30 hover:bg-red-900/50 border border-red-500/30 text-red-400 py-3 px-4 rounded-2xl text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" /> Remover
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-500 text-white py-3 rounded-2xl text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-lg shadow-fuchsia-600/20"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Salvar</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
