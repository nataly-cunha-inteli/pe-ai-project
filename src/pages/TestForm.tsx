import React, { useState, useEffect } from 'react';
import { useToast } from '../hooks/use-toast';
import { getAllPEIs, getPEI, submitProfessionalResponse } from '../services/api';
import { PEI } from '../services/api';
import { Loader2, Send, CheckCircle } from 'lucide-react';

interface Professional {
  id: string;
  name: string;
  type: string;
  phone: string;
}

export const TestForm: React.FC = () => {
  const { toast } = useToast();
  const [peis, setPeis] = useState<PEI[]>([]);
  const [selectedPEI, setSelectedPEI] = useState<string>('');
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Campos do formulário
  const [formData, setFormData] = useState({
    role: '',
    contact_time: '',
    interaction_frequency: '',
    cognitive_strengths: '',
    cognitive_difficulties: '',
    social_strengths: '',
    behavioral_challenges: '',
    learning_style: '',
    effective_strategies: '',
    goals: '',
    recommendations: ''
  });

  useEffect(() => {
    loadPEIs();
  }, []);

  const loadPEIs = async () => {
    try {
      setLoading(true);
      const data = await getAllPEIs();
      // Filtrar apenas PEIs em coleta
      const inCollection = data.filter(pei => pei.status === 'in_collection');
      setPeis(inCollection);
    } catch (error) {
      console.error('Erro ao carregar PEIs:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os PEIs.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePEIChange = async (peiId: string) => {
    setSelectedPEI(peiId);
    setSelectedProfessional('');
    
    if (!peiId) {
      setProfessionals([]);
      return;
    }

    try {
      const pei = await getPEI(peiId);
      let profs = pei.professionals;
      
      if (typeof profs === 'string') {
        profs = JSON.parse(profs);
      }
      
      setProfessionals(profs || []);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os profissionais.",
        variant: "destructive"
      });
    }
  };

  const handleProfessionalChange = (profId: string) => {
    setSelectedProfessional(profId);
    const prof = professionals.find(p => p.id === profId);
    if (prof) {
      setFormData(prev => ({ ...prev, role: prof.type }));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPEI || !selectedProfessional) {
      toast({
        title: "Erro",
        description: "Selecione um PEI e um profissional.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      
      await submitProfessionalResponse(selectedPEI, selectedProfessional, formData);
      
      toast({
        title: "✅ Sucesso!",
        description: "Resposta enviada com sucesso. A IA vai processar automaticamente.",
      });
      
      // Limpar formulário
      setFormData({
        role: '',
        contact_time: '',
        interaction_frequency: '',
        cognitive_strengths: '',
        cognitive_difficulties: '',
        social_strengths: '',
        behavioral_challenges: '',
        learning_style: '',
        effective_strategies: '',
        goals: '',
        recommendations: ''
      });
      setSelectedProfessional('');
      
    } catch (error: unknown) {
      console.error('Erro ao enviar resposta:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível enviar a resposta.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const fillSampleData = () => {
    const prof = professionals.find(p => p.id === selectedProfessional);
    const profType = prof?.type.toLowerCase() || '';
    
    if (profType.includes('responsável') || profType.includes('pai') || profType.includes('mãe')) {
      setFormData({
        role: prof?.type || '',
        contact_time: '11 anos (desde o nascimento)',
        interaction_frequency: 'Convivência diária em tempo integral',
        cognitive_strengths: 'Criativo, boa memória visual, gosta de resolver quebra-cabeças',
        cognitive_difficulties: 'Dificuldade em leitura e escrita, perde foco com facilidade',
        social_strengths: 'Carinhoso, preocupado com outros, tem amigos próximos',
        behavioral_challenges: 'Crises de choro quando sobrecarregado, ansiedade antes da escola',
        learning_style: 'Aprende melhor com recursos visuais e atividades práticas',
        effective_strategies: 'Rotina visual, pausas frequentes, ambiente tranquilo',
        goals: 'Melhorar leitura, ganhar confiança, lidar melhor com frustração',
        recommendations: 'Continuar TO, iniciar acompanhamento psicológico, apoio individualizado na escola'
      });
    } else if (profType.includes('professor') || profType.includes('educador')) {
      setFormData({
        role: prof?.type || '',
        contact_time: '8 meses (desde início do ano letivo)',
        interaction_frequency: 'Diariamente, 4 horas por dia',
        cognitive_strengths: 'Se destaca em artes visuais, boa capacidade de seguir rotinas',
        cognitive_difficulties: 'Dificuldade em explicações orais longas, perde foco com barulho',
        social_strengths: 'Aluno querido, ajuda colegas, colaborativo',
        behavioral_challenges: 'Fica em silêncio quando não entende, às vezes se frustra e chora',
        learning_style: 'Aprende melhor com imagens, vídeos e demonstrações práticas',
        effective_strategies: 'Organizadores gráficos, agenda visual, permitir uso de fones',
        goals: 'Desenvolver autonomia para pedir ajuda, aumentar participação oral',
        recommendations: 'Manter recursos visuais disponíveis, instruções escritas e orais'
      });
    } else if (profType.includes('terapeuta')) {
      setFormData({
        role: prof?.type || '',
        contact_time: '1 ano e 3 meses',
        interaction_frequency: '2x por semana em sessões individuais',
        cognitive_strengths: 'Excelente memória visual, boa capacidade de resolução de problemas',
        cognitive_difficulties: 'Dificuldade em manter atenção sustentada, processamento auditivo lento',
        social_strengths: 'Gentil, educado, demonstra empatia',
        behavioral_challenges: 'Se isola quando frustrado, dificuldade em expressar emoções verbalmente',
        learning_style: 'Aprende melhor com recursos visuais e pausas frequentes',
        effective_strategies: 'Timer visual, checklist ilustrado, fones com cancelamento de ruído',
        goals: 'Aumentar tempo de concentração, desenvolver autorregulação emocional',
        recommendations: 'Continuar TO com foco em integração sensorial, mindfulness'
      });
    } else if (profType.includes('colega')) {
      setFormData({
        role: prof?.type || '',
        contact_time: '3 anos (desde o 3º ano)',
        interaction_frequency: 'Diariamente na escola, recreio e atividades',
        cognitive_strengths: 'Muito bom em desenhar e pintar, lembra de tudo que combinamos',
        cognitive_difficulties: 'Demora para ler, perde atenção quando tem muito barulho',
        social_strengths: 'Muito legal, sempre empresta as coisas, gentil, nunca briga',
        behavioral_challenges: 'Fica quietinho quando não entende, vai pro cantinho sozinho às vezes',
        learning_style: 'Gosta de vídeos e figuras, aprende melhor fazendo coisas com as mãos',
        effective_strategies: 'Explicar com desenhos, usar cores para marcar coisas importantes',
        goals: 'Que fique mais feliz na escola e consiga ler melhor',
        recommendations: 'Deixar desenhar mais, usar mais vídeos, lugar quieto para estudar'
      });
    } else {
      setFormData({
        role: prof?.type || '',
        contact_time: '6 meses',
        interaction_frequency: '1x por semana',
        cognitive_strengths: 'Exemplo de força cognitiva',
        cognitive_difficulties: 'Exemplo de dificuldade cognitiva',
        social_strengths: 'Exemplo de força social',
        behavioral_challenges: 'Exemplo de desafio comportamental',
        learning_style: 'Exemplo de estilo de aprendizagem',
        effective_strategies: 'Exemplo de estratégia eficaz',
        goals: 'Exemplo de objetivo',
        recommendations: 'Exemplo de recomendação'
      });
    }
    
    toast({
      title: "Dados preenchidos!",
      description: "Formulário preenchido com dados de exemplo.",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Testar Formulário Profissional
          </h1>
          <p className="text-gray-600 mb-6">
            Envie respostas de profissionais para testar o processamento de IA
          </p>

          {/* Seleção de PEI */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              1. Selecione o PEI
            </label>
            <select
              value={selectedPEI}
              onChange={(e) => handlePEIChange(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">-- Selecione um PEI em coleta --</option>
              {peis.map(pei => (
                <option key={pei.id} value={pei.id}>
                  {pei.id} - Aluno ID: {pei.student_id}
                </option>
              ))}
            </select>
          </div>

          {/* Seleção de Profissional */}
          {professionals.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                2. Selecione o Profissional
              </label>
              <select
                value={selectedProfessional}
                onChange={(e) => handleProfessionalChange(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">-- Selecione um profissional --</option>
                {professionals.map(prof => (
                  <option key={prof.id} value={prof.id}>
                    {prof.name} ({prof.type}) - {prof.phone}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Formulário */}
          {selectedProfessional && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  3. Preencha as Respostas
                </h2>
                <button
                  type="button"
                  onClick={fillSampleData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  📝 Preencher com Dados de Exemplo
                </button>
              </div>

              {Object.entries(formData).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {key.replace(/_/g, ' ')}
                  </label>
                  <textarea
                    value={value}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder={`Digite ${key.replace(/_/g, ' ')}`}
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Enviar Resposta
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};