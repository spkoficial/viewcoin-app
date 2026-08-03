import { Info, Coins, ShieldAlert } from 'lucide-react';

export default function InstructionsScreen() {
  return (
    <>
      <div className="flex-1 w-full h-full flex flex-col pt-6 overflow-y-auto no-scrollbar">
        <div className="px-5 mb-6 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/20 mx-auto flex items-center justify-center mb-3">
            <Info className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold">Como Funciona</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Entenda o sistema de Viewcoins
          </p>
        </div>

        <div className="px-5 space-y-4">
          
          <div className="bg-card border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <span className="font-mono font-bold text-primary text-sm">1</span>
              </div>
              <h3 className="font-semibold text-sm">Verifique a Grade</h3>
            </div>
            <p className="text-xs text-muted-foreground pl-11">
              Acesse a aba Grade para ver qual membro está ao vivo agora. A contagem só funciona se houver um canal ativo registrado.
            </p>
          </div>

          <div className="bg-card border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <span className="font-mono font-bold text-primary text-sm">2</span>
              </div>
              <h3 className="font-semibold text-sm">Ligue o Sistema</h3>
            </div>
            <p className="text-xs text-muted-foreground pl-11">
              Na aba Home, clique no botão gigante "LIGAR". O aplicativo abrirá a live oficial em uma nova aba e iniciará seu timer interno.
            </p>
          </div>

          <div className="bg-card border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                <Coins className="w-4 h-4 text-secondary" />
              </div>
              <h3 className="font-semibold text-sm text-secondary">Ganhe Moedas</h3>
            </div>
            <p className="text-xs text-muted-foreground pl-11">
              A cada <strong className="text-white">5 minutos</strong> ininterruptos com o sistema ligado, você recebe 1 Viewcoin automaticamente.
            </p>
          </div>

          <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 mt-6">
            <div className="flex items-center gap-2 mb-2 text-destructive">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <h3 className="font-bold text-xs uppercase tracking-wider">Avisos Importantes</h3>
            </div>
            <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4">
              <li>A contagem pausa se você clicar no botão para Desligar.</li>
              <li>Sempre faça login na plataforma da live (ex: Kick) para também contabilizar viewer real para o criador.</li>
              <li>O rank é atualizado em tempo real. Não tente burlar o contador, o sistema verifica a sessão.</li>
            </ul>
          </div>

        </div>
      </div>
    </>
  );
}
