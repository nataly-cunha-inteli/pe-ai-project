import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkle, Users, CheckCircle, Clock, ArrowRight, Eye } from '@phosphor-icons/react';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import { getAllPEIs, getPEIResponses, triggerAIProcessing, type PEI, type ProfessionalResponse } from '../services/api';

export default function AIProcessing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [peis, setPeis] = useState<PEI[]>([]);
  const [responses, setResponses] = useState<Record<string, ProfessionalResponse[]>>({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<Record<string, boolean>>({});

  const loadData = useCallback(async () => {
    try {
      const allPEIs = await getAllPEIs();
      setPeis(allPEIs);

      // Load responses for each PEI
      const responsesData: Record<string, ProfessionalResponse[]> = {};
      for (const pei of allPEIs) {
        try {
          const peiResponses = await getPEIResponses(pei.id);
          responsesData[pei.id] = peiResponses;
        } catch (error) {
          responsesData[pei.id] = [];
        }
      }
      setResponses(responsesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleProcessAI = async (peiId: string) => {
    setProcessing({ ...processing, [peiId]: true });
    
    try {
      await triggerAIProcessing(peiId);
      
      toast({
        title: 'Processamento Iniciado!',
        description: 'A IA está processando o PEI. Aguarde alguns segundos...',
      });

      // Reload data after 5 seconds to see results
      setTimeout(async () => {
        await loadData();
        setProcessing({ ...processing, [peiId]: false });
        
        toast({
          title: 'Processamento Concluído!',
          description: 'O PEI foi gerado com sucesso pela IA.',
        });
      }, 5000);
      
    } catch (error) {
      console.error('Error processing AI:', error);
      setProcessing({ ...processing, [peiId]: false });
      toast({
        title: 'Erro',
        description: 'Não foi possível processar o PEI com a IA.',
        variant: 'destructive',
      });
    }
  };

  const getProcessingStatus = (pei: PEI) => {
    const responsesCount = responses[pei.id]?.length || 0;
    const totalProfessionals = pei.professionals?.length || 0;
    
    if (pei.ai_processing_status === 'completed') {
      return {
        label: 'Processado',
        icon: <CheckCircle className="w-5 h-5 text-green-600" weight="fill" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        canProcess: false,
      };
    }
    
    if (pei.ai_processing_status === 'processing') {
      return {
        label: 'Processando...',
        icon: <Clock className="w-5 h-5 text-blue-600 animate-pulse" weight="fill" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        canProcess: false,
      };
    }
    
    if (responsesCount >= totalProfessionals && totalProfessionals > 0) {
      return {
        label: 'Pronto para Processar',
        icon: <Sparkle className="w-5 h-5 text-orange-600" weight="fill" />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        canProcess: true,
      };
    }
    
    return {
      label: `Aguardando Respostas (${responsesCount}/${totalProfessionals})`,
      icon: <Clock className="w-5 h-5 text-gray-400" weight="fill" />,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      canProcess: false,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-12 h-12 text-[#FF6B35] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <Sparkle className="w-8 h-8 text-[#FF6B35]" weight="fill" />
            Processamento de IA
          </h1>
          <p className="text-gray-600">
            Acompanhe o status das respostas dos profissionais e processe os PEIs com inteligência artificial.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de PEIs</p>
                <p className="text-2xl font-bold text-gray-800">{peis.length}</p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aguardando Respostas</p>
                <p className="text-2xl font-bold text-gray-800">
                  {peis.filter(p => !p.ai_processing_status || p.ai_processing_status === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Prontos para Processar</p>
                <p className="text-2xl font-bold text-orange-600">
                  {peis.filter(p => {
                    const responsesCount = responses[p.id]?.length || 0;
                    const totalProfessionals = p.professionals?.length || 0;
                    return responsesCount >= totalProfessionals && totalProfessionals > 0 && !p.ai_processing_status;
                  }).length}
                </p>
              </div>
              <Sparkle className="w-8 h-8 text-orange-400" weight="fill" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Processados</p>
                <p className="text-2xl font-bold text-green-600">
                  {peis.filter(p => p.ai_processing_status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" weight="fill" />
            </div>
          </div>
        </div>

        {/* PEIs List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Lista de PEIs</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {peis.map((pei) => {
              const status = getProcessingStatus(pei);
              const responsesCount = responses[pei.id]?.length || 0;
              const totalProfessionals = pei.professionals?.length || 0;
              const isProcessing = processing[pei.id];
              
              return (
                <div key={pei.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">PEI #{pei.id}</h3>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${status.bgColor} ${status.color}`}>
                          {status.icon}
                          {status.label}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span>
                          <strong>Necessidades:</strong> {pei.special_needs || 'Não especificado'}
                        </span>
                        <span>
                          <strong>Profissionais:</strong> {responsesCount}/{totalProfessionals} responderam
                        </span>
                        {pei.ai_confidence_score && (
                          <span>
                            <strong>Confiança:</strong> {pei.ai_confidence_score}%
                          </span>
                        )}
                      </div>
                      
                      {pei.ai_processed_at && (
                        <p className="text-xs text-gray-500 mt-1">
                          Processado em: {new Date(pei.ai_processed_at).toLocaleString('pt-BR')}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/pei/${pei.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver PEI
                      </Button>
                      
                      {status.canProcess && (
                        <Button
                          size="sm"
                          className="bg-[#FF6B35] hover:bg-[#E55A2B]"
                          onClick={() => handleProcessAI(pei.id)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <Clock className="w-4 h-4 mr-2 animate-spin" />
                              Processando...
                            </>
                          ) : (
                            <>
                              <Sparkle className="w-4 h-4 mr-2" weight="fill" />
                              Processar com IA
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Professional Responses Details */}
                  {responses[pei.id] && responses[pei.id].length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm font-medium text-gray-700 mb-2">Respostas Recebidas:</p>
                      <div className="flex flex-wrap gap-2">
                        {responses[pei.id].map((response) => (
                          <span
                            key={response.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium"
                          >
                            <CheckCircle className="w-3.5 h-3.5" weight="fill" />
                            {response.professional_name} ({response.professional_type})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {peis.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhum PEI encontrado</h3>
            <p className="text-gray-500">Crie um PEI para começar.</p>
            <Button
              onClick={() => navigate('/pei/create')}
              className="mt-4 bg-[#FF6B35] hover:bg-[#E55A2B]"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Criar Novo PEI
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
