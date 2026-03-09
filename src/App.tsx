import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import CRM from "./pages/CRM";
import Propostas from "./pages/Propostas";
import NovaPropostaPage from "./pages/NovaPropostaPage";
import Contratos from "./pages/Contratos";
import Etapas from "./pages/Etapas";
import Financeiro from "./pages/Financeiro";
import Integracoes from "./pages/Integracoes";
import Configuracoes from "./pages/Configuracoes";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
