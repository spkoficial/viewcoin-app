import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, Redirect } from 'wouter';

// Layout & Hooks
import { PhoneLayout } from '@/components/phone-layout';
import { useAuth } from '@/hooks/use-auth';

// Pages
import BootScreen from '@/pages/boot';
import LoginScreen from '@/pages/login';
import HomeScreen from '@/pages/home';
import ScheduleScreen from '@/pages/schedule';
import RankingScreen from '@/pages/ranking';
import ProfileScreen from '@/pages/profile';
import InstructionsScreen from '@/pages/instructions';
import AdminScreen from '@/pages/admin';


import { setAuthTokenGetter } from '@workspace/api-client-react';

// Configure api client auth token
setAuthTokenGetter(() => {
  return localStorage.getItem('viewcoin_token');
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected Route Wrapper
function ProtectedRoute({ component: Component, ...rest }: any) {
  const { isLoggedIn } = useAuth();
  
  if (!isLoggedIn) {
    return <Redirect to="/login" />;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={BootScreen} />
      <Route path="/login" component={LoginScreen} />
      <Route path="/home">
        {() => <ProtectedRoute component={HomeScreen} />}
      </Route>
      <Route path="/grade">
        {() => <ProtectedRoute component={ScheduleScreen} />}
      </Route>
      <Route path="/ranking">
        {() => <ProtectedRoute component={RankingScreen} />}
      </Route>
      <Route path="/perfil">
        {() => <ProtectedRoute component={ProfileScreen} />}
      </Route>
      <Route path="/instrucoes">
        {() => <ProtectedRoute component={InstructionsScreen} />}
      </Route>
      <Route path="/admin">
        {() => <ProtectedRoute component={AdminScreen} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <PhoneLayout>
            <Router />
          </PhoneLayout>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
