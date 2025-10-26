import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Download, Edit, Send, CheckCircle } from 'lucide-react';
import { getStudentPEI, getPEI, getStudent, approvePEI, type PEI, type Student } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const ViewPEI = () => {
  const { peiId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [expandedSections, setExpandedSections] = useState<string[]>(['identification']);
  const [pei, setPei] = useState<PEI | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    const fetchPEI = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let peiData: PEI;
        
        // Try to fetch as PEI ID first
        try {
          peiData = await getPEI(peiId!);
        } catch (peiError) {
          // If that fails, try as student ID
          peiData = await getStudentPEI(peiId!);
        }
        
        setPei(peiData);
        
        // Fetch student data
        const studentData = await getStudent(peiData.student_id);
        setStudent(studentData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch PEI');
        console.error('Error fetching PEI:', err);
      } finally {
        setLoading(false);
      }
    };

    if (peiId) {
      fetchPEI();
    }
  }, [peiId]);

  const handleLogout = () => {
    console.log('Logging out...');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleApprovePEI = async () => {
    if (!peiId) return;
    
    try {
      setApproving(true);
      await approvePEI(peiId);
      
      toast({
        title: 'PEI Aprovado!',
        description: 'O PEI foi aprovado com sucesso. Status atualizado para "Concluído".',
      });
      
      // Reload PEI data
      const updatedPEI = await getPEI(peiId);
      setPei(updatedPEI);
      
    } catch (error) {
      toast({
        title: 'Erro ao aprovar PEI',
        description: error instanceof Error ? error.message : 'Ocorreu um erro',
        variant: 'destructive',
      });
    } finally {
      setApproving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!peiId) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/pei/${peiId}/download-pdf`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao baixar PDF');
      }

      // Converte a resposta em blob
      const blob = await response.blob();
      
      // Cria URL temporária para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `PEI_${student?.name.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Dispara o download
      document.body.appendChild(link);
      link.click();
      
      // Limpa
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'PDF baixado com sucesso!',
        description: 'O arquivo foi salvo no seu computador.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao baixar PDF',
        description: error instanceof Error ? error.message : 'Ocorreu um erro',
        variant: 'destructive',
      });
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: '📝 Rascunho', color: 'bg-gray-100 text-gray-700' },
      review: { label: '⏳ Em Revisão', color: 'bg-yellow-100 text-yellow-700' },
      completed: { label: '✅ Processado pela IA', color: 'bg-green-100 text-green-700' },
      concluido: { label: '✅ Concluído', color: 'bg-green-100 text-green-700' },
      active: { label: '🎯 Ativo', color: 'bg-blue-100 text-blue-700' },
      expired: { label: '⌛ Expirado', color: 'bg-red-100 text-red-700' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
        <Navbar onLogout={handleLogout} />
        <main className="flex flex-col items-center justify-center w-full max-w-[1000px] mx-auto px-4 mt-[60px] pb-20">
          <div className="text-[#3A3D5B] text-xl">Carregando PEI...</div>
        </main>
      </div>
    );
  }

  // Show error state
  if (error || !pei || !student) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
        <Navbar onLogout={handleLogout} />
        <main className="flex flex-col items-center justify-center w-full max-w-[1000px] mx-auto px-4 mt-[60px] pb-20">
          <div className="text-red-600 text-xl">❌ Erro: {error || 'PEI não encontrado'}</div>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-[#E65100] text-white rounded hover:bg-[#D14900] transition-colors"
          >
            Voltar
          </button>
        </main>
      </div>
    );
  }

  // Adicione este dicionário no início do componente, antes do return
  const translateKey = (key: string): string => {
    const translations: { [key: string]: string } = {
      // Estratégias Pedagógicas
      'content_presentation': 'Apresentação de Conteúdo',
      'content presentation': 'Apresentação de Conteúdo',
      'activities': 'Atividades',
      'environment': 'Ambiente',
      
      // Métodos de Avaliação
      'adaptations': 'Adaptações',
      'diversified_instruments': 'Instrumentos Diversificados',
      'diversified instruments': 'Instrumentos Diversificados',
      'evaluation_focus': 'Foco da Avaliação',
      'evaluation focus': 'Foco da Avaliação',
      
      // Instrumentos Diversificados (sub-itens)
      'practical_projects': 'Projetos Práticos',
      'practical projects': 'Projetos Práticos',
      'visual_presentations': 'Apresentações Visuais',
      'visual presentations': 'Apresentações Visuais',
      'classroom_activities': 'Atividades em Sala',
      'classroom activities': 'Atividades em Sala',
      'adapted_tests': 'Testes Adaptados',
      'adapted tests': 'Testes Adaptados',
    };
    
    return translations[key.toLowerCase()] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
      <Navbar onLogout={handleLogout} />
      
      <main className="flex flex-col w-full max-w-[1000px] mx-auto px-4 mt-[60px] pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center text-[#3A3D5B] hover:text-[#E65100] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </button>
            <h1 className="text-[#E65100] text-[28px] font-bold">
              PEI - {student.name}
            </h1>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            PDF
          </Button>
        </div>

        {/* Status */}
        <div className="bg-white rounded-[10px] border border-[#DEE2E6] p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-2">
                {getStatusBadge(pei.status)}
              </div>
              <p className="text-[#3A3D5B] text-sm">
                Gerado em: {formatDate(pei.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-[10px] border border-blue-200 p-6 mb-6">
          <h3 className="text-[#3A3D5B] text-lg font-semibold mb-3 flex items-center gap-2">
            🤖 Análise da IA
          </h3>
          <p className="text-[#3A3D5B] text-sm leading-relaxed">
            Este PEI foi gerado automaticamente analisando as contribuições de 5 profissionais 
            (psicóloga, 2 professores, mãe e neurologista). A IA identificou padrões e 
            sintetizou as informações seguindo as diretrizes da LBI (Lei 13.146/2015).
          </p>
        </div>

        {/* PEI Content */}
        <div className="space-y-4">
          {/* Section 1: Identification */}
          <div className="bg-white rounded-[10px] border border-[#DEE2E6] overflow-hidden">
            <button
              onClick={() => toggleSection('identification')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#F8F9FA] transition-colors"
            >
              <h3 className="text-[#3A3D5B] text-lg font-semibold">
                1. IDENTIFICAÇÃO DO ESTUDANTE
              </h3>
              <span className="text-[#E65100]">
                {expandedSections.includes('identification') ? '▼' : '▶'}
              </span>
            </button>
            {expandedSections.includes('identification') && (
              <div className="px-6 pb-6 border-t border-[#DEE2E6]">
                <div className="space-y-3 mt-4">
                  <p className="text-[#3A3D5B]"><strong>Nome:</strong> {student.name}</p>
                  <div>
                    <strong className="text-[#3A3D5B]">Necessidades Educacionais Especiais:</strong>
                    <p className="text-[#3A3D5B] mt-2">{pei.special_needs}</p>
                  </div>
                  {pei.initial_observations && (
                    <div>
                      <strong className="text-[#3A3D5B]">Observações Iniciais:</strong>
                      <p className="text-[#3A3D5B] mt-2">{pei.initial_observations}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Report */}
          <div className="bg-white rounded-[10px] border border-[#DEE2E6] overflow-hidden">
            <button
              onClick={() => toggleSection('report')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#F8F9FA] transition-colors"
            >
              <h3 className="text-[#3A3D5B] text-lg font-semibold">
                2. RELATÓRIO CIRCUNSTANCIADO
              </h3>
              <span className="text-[#E65100]">
                {expandedSections.includes('report') ? '▼' : '▶'}
              </span>
            </button>
            {expandedSections.includes('report') && (
              <div className="px-6 pb-6 border-t border-[#DEE2E6]">
                <div className="space-y-4 mt-4">
                  {pei.cognitive_report && (
                    <div>
                      <h4 className="text-[#3A3D5B] font-semibold mb-2">Relatório Cognitivo:</h4>
                      <p className="text-[#3A3D5B] leading-relaxed whitespace-pre-line">{pei.cognitive_report}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Strengths */}
          <div className="bg-white rounded-[10px] border border-[#DEE2E6] overflow-hidden">
            <button
              onClick={() => toggleSection('strengths')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#F8F9FA] transition-colors"
            >
              <h3 className="text-[#3A3D5B] text-lg font-semibold">
                3. HABILIDADES E PONTOS FORTES
              </h3>
              <span className="text-[#E65100]">
                {expandedSections.includes('strengths') ? '▼' : '▶'}
              </span>
            </button>
            {expandedSections.includes('strengths') && (
              <div className="px-6 pb-6 border-t border-[#DEE2E6]">
                <ul className="space-y-2 mt-4">
                  {pei.strengths && pei.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-green-600 mt-1">✓</span>
                      <span className="text-[#3A3D5B]">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Section 4: Difficulties */}
          <div className="bg-white rounded-[10px] border border-[#DEE2E6] overflow-hidden">
            <button
              onClick={() => toggleSection('difficulties')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#F8F9FA] transition-colors"
            >
              <h3 className="text-[#3A3D5B] text-lg font-semibold">
                4. DIFICULDADES E NECESSIDADES
              </h3>
              <span className="text-[#E65100]">
                {expandedSections.includes('difficulties') ? '▼' : '▶'}
              </span>
            </button>
            {expandedSections.includes('difficulties') && (
              <div className="px-6 pb-6 border-t border-[#DEE2E6]">
                <ul className="space-y-2 mt-4">
                  {pei.difficulties && pei.difficulties.map((difficulty, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-orange-600 mt-1">!</span>
                      <span className="text-[#3A3D5B]">{difficulty}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Section 5: Goals */}
          <div className="bg-white rounded-[10px] border border-[#DEE2E6] overflow-hidden">
            <button
              onClick={() => toggleSection('goals')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#F8F9FA] transition-colors"
            >
              <h3 className="text-[#3A3D5B] text-lg font-semibold">
                5. OBJETIVOS EDUCACIONAIS
              </h3>
              <span className="text-[#E65100]">
                {expandedSections.includes('goals') ? '▼' : '▶'}
              </span>
            </button>
            {expandedSections.includes('goals') && (
              <div className="px-6 pb-6 border-t border-[#DEE2E6]">
                <div className="space-y-4 mt-4">
                  {pei.short_term_goals && pei.short_term_goals.length > 0 && (
                    <div>
                      <h4 className="text-[#3A3D5B] font-semibold mb-2">Curto Prazo:</h4>
                      <ul className="space-y-1">
                        {pei.short_term_goals.map((goal, idx) => (
                          <li key={idx} className="text-[#3A3D5B] ml-4">• {goal}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {pei.medium_term_goals && pei.medium_term_goals.length > 0 && (
                    <div>
                      <h4 className="text-[#3A3D5B] font-semibold mb-2">Médio Prazo:</h4>
                      <ul className="space-y-1">
                        {pei.medium_term_goals.map((goal, idx) => (
                          <li key={idx} className="text-[#3A3D5B] ml-4">• {goal}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {pei.long_term_goals && pei.long_term_goals.length > 0 && (
                    <div>
                      <h4 className="text-[#3A3D5B] font-semibold mb-2">Longo Prazo:</h4>
                      <ul className="space-y-1">
                        {pei.long_term_goals.map((goal, idx) => (
                          <li key={idx} className="text-[#3A3D5B] ml-4">• {goal}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 6: Teaching Strategies */}
          {pei.teaching_strategies && (
            <div className="bg-white rounded-[10px] border border-[#DEE2E6] overflow-hidden">
              <button
                onClick={() => toggleSection('strategies')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#F8F9FA] transition-colors"
              >
                <h3 className="text-[#3A3D5B] text-lg font-semibold">
                  6. ESTRATÉGIAS PEDAGÓGICAS
                </h3>
                <span className="text-[#E65100]">
                  {expandedSections.includes('strategies') ? '▼' : '▶'}
                </span>
              </button>
              {expandedSections.includes('strategies') && (
                <div className="px-6 pb-6 border-t border-[#DEE2E6]">
                  <div className="mt-4 space-y-4">
                    {(() => {
                      try {
                        const strategies = typeof pei.teaching_strategies === 'string' 
                          ? JSON.parse(pei.teaching_strategies) 
                          : pei.teaching_strategies;
                        
                        if (typeof strategies === 'object' && strategies !== null) {
                          return Object.entries(strategies).map(([key, value]) => (
                            <div key={key}>
                              <h4 className="text-[#3A3D5B] font-semibold mb-2">
                                {translateKey(key)}:
                              </h4>
                              {Array.isArray(value) ? (
                                <ul className="space-y-2">
                                  {value.map((item: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-3">
                                      <span className="text-blue-600 mt-1">📚</span>
                                      <span className="text-[#3A3D5B]">{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-[#3A3D5B]">{String(value)}</p>
                              )}
                            </div>
                          ));
                        } else {
                          return <p className="text-[#3A3D5B] leading-relaxed whitespace-pre-line">{pei.teaching_strategies}</p>;
                        }
                      } catch (e) {
                        return <p className="text-[#3A3D5B] leading-relaxed whitespace-pre-line">{pei.teaching_strategies}</p>;
                      }
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 7: Assistive Resources */}
          {pei.assistive_resources && pei.assistive_resources.length > 0 && (
            <div className="bg-white rounded-[10px] border border-[#DEE2E6] overflow-hidden">
              <button
                onClick={() => toggleSection('resources')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#F8F9FA] transition-colors"
              >
                <h3 className="text-[#3A3D5B] text-lg font-semibold">
                  7. RECURSOS DE APOIO
                </h3>
                <span className="text-[#E65100]">
                  {expandedSections.includes('resources') ? '▼' : '▶'}
                </span>
              </button>
              {expandedSections.includes('resources') && (
                <div className="px-6 pb-6 border-t border-[#DEE2E6]">
                  <ul className="space-y-2 mt-4">
                    {pei.assistive_resources.map((resource, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-blue-600 mt-1">🔧</span>
                        <span className="text-[#3A3D5B]">{resource}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Section 8: Evaluation Methods */}
          {pei.evaluation_methods && (
            <div className="bg-white rounded-[10px] border border-[#DEE2E6] overflow-hidden">
              <button
                onClick={() => toggleSection('evaluation')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#F8F9FA] transition-colors"
              >
                <h3 className="text-[#3A3D5B] text-lg font-semibold">
                  8. MÉTODOS DE AVALIAÇÃO
                </h3>
                <span className="text-[#E65100]">
                  {expandedSections.includes('evaluation') ? '▼' : '▶'}
                </span>
              </button>
              {expandedSections.includes('evaluation') && (
                <div className="px-6 pb-6 border-t border-[#DEE2E6]">
                  <div className="mt-4 space-y-4">
                    {(() => {
                      try {
                        const methods = typeof pei.evaluation_methods === 'string' 
                          ? JSON.parse(pei.evaluation_methods) 
                          : pei.evaluation_methods;
                        
                        if (typeof methods === 'object' && methods !== null) {
                          return Object.entries(methods).map(([key, value]) => (
                            <div key={key}>
                              <h4 className="text-[#3A3D5B] font-semibold mb-2">
                                {translateKey(key)}:
                              </h4>
                              {Array.isArray(value) ? (
                                <ul className="space-y-2">
                                  {value.map((item: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-3">
                                      <span className="text-orange-600 mt-1">✓</span>
                                      <span className="text-[#3A3D5B]">{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : typeof value === 'object' && value !== null ? (
                                <div className="pl-4 space-y-2">
                                  {Object.entries(value).map(([subKey, subValue]) => (
                                    <div key={subKey} className="flex items-start gap-3">
                                      <span className="text-purple-600 font-medium min-w-[200px]">
                                        {translateKey(subKey)}:
                                      </span>
                                      <span className="text-[#3A3D5B]">{String(subValue)}%</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[#3A3D5B]">{String(value)}</p>
                              )}
                            </div>
                          ));
                        } else {
                          return <p className="text-[#3A3D5B] leading-relaxed whitespace-pre-line">{pei.evaluation_methods}</p>;
                        }
                      } catch (e) {
                        return <p className="text-[#3A3D5B] leading-relaxed whitespace-pre-line">{pei.evaluation_methods}</p>;
                      }
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleDownloadPDF}
          >
            <Download className="w-4 h-4" />
            Baixar PDF
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Solicitar Ajustes
          </Button>
          {pei?.status === 'concluido' ? (
            <Button 
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
              disabled
            >
              <CheckCircle className="w-4 h-4" />
              PEI Aprovado
            </Button>
          ) : (
            <Button 
              className="flex items-center gap-2 bg-[#E65100] hover:bg-[#D14900] text-white"
              onClick={handleApprovePEI}
              disabled={approving || pei?.ai_processing_status !== 'completed'}
            >
              <Send className="w-4 h-4" />
              {approving ? 'Aprovando...' : 'Enviar para Auditor'}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default ViewPEI;
