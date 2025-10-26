import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Students from "./pages/Students";
import PEIs from "./pages/PEIs";
import StudentHistory from "./pages/StudentHistory";
import GenerateClass from "./pages/GenerateClass";
import CreatePEI from "./pages/CreatePEI";
import ViewPEI from "./pages/ViewPEI";
import ProfessionalForm from "./pages/ProfessionalForm";
import FormSuccess from "./pages/FormSuccess";
import AIProcessing from "./pages/AIProcessing";
import NotFound from "./pages/NotFound";
import { TestForm } from './pages/TestForm';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/students" element={<Students />} />
          <Route path="/peis" element={<PEIs />} />
          <Route path="/students/:studentId/history" element={<StudentHistory />} />
          <Route path="/students/:studentId/generate-class" element={<GenerateClass />} />
          <Route path="/pei/create" element={<CreatePEI />} />
          <Route path="/pei/:peiId" element={<ViewPEI />} />
          <Route path="/form/:peiId/:professionalId" element={<ProfessionalForm />} />
          <Route path="/form-success" element={<FormSuccess />} />
          <Route path="/ai-processing" element={<AIProcessing />} />
          <Route path="/test-form" element={<TestForm />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
