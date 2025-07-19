import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Profile from "@/pages/profile";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen orlev-gradient flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <div className="orlev-card p-8">
            <h1 className="text-4xl font-bold text-[#257b82] orlev-logo mb-2">OrLev</h1>
            <p className="text-[#6ea1a7]">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/register" component={Register} />
          <Route path="/login" component={Login} />
          <Route component={Login} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/profile/:userId" component={Profile} />
          <Route path="/login" component={Home} />
          <Route path="/register" component={Home} />
          <Route component={Home} />
        </>
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
