import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
            <Route path="/crm" element={<AppLayout><CRM /></AppLayout>} />
            <Route path="/propostas" element={<AppLayout><Propostas /></AppLayout>} />
            <Route path="/propostas/nova" element={<AppLayout><NovaPropostaPage /></AppLayout>} />
            <Route path="/propostas/:id" element={<AppLayout><Propostas /></AppLayout>} />
            <Route path="/contratos" element={<AppLayout><Contratos /></AppLayout>} />
            <Route path="/etapas" element={<AppLayout><Etapas /></AppLayout>} />
            <Route path="/financeiro" element={<AppLayout><Financeiro /></AppLayout>} />
            <Route path="/integracoes" element={<AppLayout><Integracoes /></AppLayout>} />
            <Route path="/configuracoes" element={<AppLayout><Configuracoes /></AppLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
