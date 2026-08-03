import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Coins, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useLogin, useRegister } from '@workspace/api-client-react';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo de 6 caracteres'),
});

const registerSchema = z.object({
  username: z.string().min(3, 'Mínimo de 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo de 6 caracteres'),
  confirmPassword: z.string().min(6, 'Mínimo de 6 caracteres'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword']
});

export default function LoginScreen() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
  });

  const onLogin = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate({ data }, {
      onSuccess: (res) => {
        login(res.token, res.user);
        toast({ title: 'Acesso concedido', description: 'Bem-vindo ao ViewCoin!' });
        setLocation('/home');
      },
      onError: (err: any) => {
        toast({
          title: 'Erro no acesso',
          description: err?.response?.data?.error || 'E-mail ou senha incorretos',
          variant: 'destructive'
        });
      }
    });
  };

  const onRegister = (data: z.infer<typeof registerSchema>) => {
    registerMutation.mutate({ data }, {
      onSuccess: (res) => {
        login(res.token, res.user);
        toast({ title: 'Conta criada!', description: 'Bem-vindo ao ViewCoin!' });
        setLocation('/home');
      },
      onError: (err: any) => {
        toast({
          title: 'Erro ao criar conta',
          description: err?.response?.data?.error || 'Não foi possível registrar',
          variant: 'destructive'
        });
      }
    });
  };

  return (
    <div className="flex-1 w-full flex flex-col p-5 bg-black relative overflow-y-auto no-scrollbar">
      <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-primary/20 to-transparent pointer-events-none" />

      <div className="mt-8 mb-5 flex flex-col items-center">
        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(217,70,239,0.3)]">
          <Coins className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">Acesse o Clube</h1>
      </div>

      {/* Tab switcher */}
      <div className="flex bg-white/5 p-1 rounded-xl mb-5 border border-white/10 backdrop-blur-md shrink-0">
        <button
          onClick={() => setActiveTab('login')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'login' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground'}`}
        >
          Entrar
        </button>
        <button
          onClick={() => setActiveTab('register')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'register' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground'}`}
        >
          Criar Conta
        </button>
      </div>

      {/* Forms — normal flow, no absolute positioning */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {activeTab === 'login' && (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.18 }}
              onSubmit={loginForm.handleSubmit(onLogin)}
              className="flex flex-col gap-3"
            >
              <div className="space-y-1">
                <input
                  {...loginForm.register('email')}
                  type="email"
                  placeholder="E-mail"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
                {loginForm.formState.errors.email && (
                  <p className="text-xs text-destructive px-1">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <input
                  {...loginForm.register('password')}
                  type="password"
                  placeholder="Senha"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
                {loginForm.formState.errors.password && (
                  <p className="text-xs text-destructive px-1">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full mt-2 bg-primary hover:bg-primary/90 text-white rounded-xl py-3 font-semibold text-sm transition-colors flex items-center justify-center shadow-[0_0_20px_rgba(217,70,239,0.3)] disabled:opacity-50"
              >
                {loginMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar no Sistema'}
              </button>
            </motion.form>
          )}

          {activeTab === 'register' && (
            <motion.form
              key="register"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.18 }}
              onSubmit={registerForm.handleSubmit(onRegister)}
              className="flex flex-col gap-3"
            >
              <div className="space-y-1">
                <input
                  {...registerForm.register('username')}
                  type="text"
                  placeholder="Nome de usuário"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
                {registerForm.formState.errors.username && (
                  <p className="text-xs text-destructive px-1">{registerForm.formState.errors.username.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <input
                  {...registerForm.register('email')}
                  type="email"
                  placeholder="E-mail"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
                {registerForm.formState.errors.email && (
                  <p className="text-xs text-destructive px-1">{registerForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <input
                  {...registerForm.register('password')}
                  type="password"
                  placeholder="Senha"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
                {registerForm.formState.errors.password && (
                  <p className="text-xs text-destructive px-1">{registerForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <input
                  {...registerForm.register('confirmPassword')}
                  type="password"
                  placeholder="Confirmar Senha"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive px-1">{registerForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full mt-2 bg-primary hover:bg-primary/90 text-white rounded-xl py-3 font-semibold text-sm transition-colors flex items-center justify-center shadow-[0_0_20px_rgba(217,70,239,0.3)] disabled:opacity-50"
              >
                {registerMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Criar Conta'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
