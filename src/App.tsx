import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy loaded pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CRM = lazy(() => import("./pages/CRM"));
const Propostas = lazy(() => import("./pages/Propostas"));
const NovaPropostaPage = lazy(() => import("./pages/NovaPropostaPage"));
const Contratos = lazy(() => import("./pages/Contratos"));
const Etapas = lazy(() => import("./pages/Etapas"));
const Financeiro = lazy(() => import("./pages/Financeiro"));
const Integracoes = lazy(() => import("./pages/Integracoes"));
const Configuracoes = lazy(() => import("./pages/Configuracoes"));
const Login = lazy(() => import("./pages/Login"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AcompanhamentoPublico = lazy(() => import("./pages/AcompanhamentoPublico"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-32" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
      <Skeleton className="h-64 rounded-xl mt-4" />
    </div>
  );
}

function ProtectedPage({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
                <Route path="/crm" element={<ProtectedPage><CRM /></ProtectedPage>} />
                <Route path="/propostas" element={<ProtectedPage><Propostas /></ProtectedPage>} />
                <Route path="/propostas/nova" element={<ProtectedPage><NovaPropostaPage /></ProtectedPage>} />
                <Route path="/propostas/:id" element={<ProtectedPage><Propostas /></ProtectedPage>} />
                <Route path="/contratos" element={<ProtectedPage><Contratos /></ProtectedPage>} />
                <Route path="/etapas" element={<ProtectedPage><Etapas /></ProtectedPage>} />
                <Route path="/financeiro" element={<ProtectedPage><Financeiro /></ProtectedPage>} />
                <Route path="/integracoes" element={<ProtectedPage><Integracoes /></ProtectedPage>} />
                <Route path="/configuracoes" element={<ProtectedPage><Configuracoes /></ProtectedPage>} />
                <Route path="/acompanhamento/:token" element={<AcompanhamentoPublico />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
