import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Spinner, FloppyDisk } from '@phosphor-icons/react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../hooks/use-toast';
import { getPEI, getStudent, submitProfessionalResponse } from '../services/api';

interface Professional {
  id: string;
  type: string;
  name: string;
  phone: string;
  email?: string;
  specialty?: string;
}

interface Question {
  key: string;
  label: string;
  placeholder: string;
  maxLength?: number;
}

export default function ProfessionalForm() {
  const { peiId, professionalId } = useParams<{ peiId: string; professionalId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [studentName, setStudentName] = useState('');
  const [currentSection, setCurrentSection] = useState(0);
  const [autoSaved, setAutoSaved] = useState(false);
  
  // Form responses
  const [responses, setResponses] = useState<Record<string, string>>({
    cognitive_development: '',
    attention_concentration: '',
    socioemotional: '',
    communication: '',
    learning_style: '',
    classroom_performance: '',
    social_interaction: '',
    strategies_that_work: '',
    home_behavior: '',
    interests: '',
    challenges: '',
    strengths: '',
    difficulties: '',
    observations: ''
  });

  const loadPEIData = useCallback(async () => {
    try {
      if (!peiId || !professionalId) return;
      
      const pei = await getPEI(peiId);
      
      // Find professional in the professionals array
      const prof = pei.professionals?.find((p) => p.id === professionalId);
      if (prof) {
        setProfessional(prof);
      }
      
      // Get student info
      if (pei.student_id) {
        try {
          const student = await getStudent(pei.student_id);
          setStudentName(student.name);
        } catch {
          setStudentName('Aluno');
        }
      }
      
    } catch (error) {
      console.error('Error loading PEI:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do formulário.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [peiId, professionalId, toast]);

  useEffect(() => {
    loadPEIData();
  }, [loadPEIData]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!loading && Object.values(responses).some(v => v.trim())) {
      const timer = setTimeout(() => {
        localStorage.setItem(`pei_${peiId}_${professionalId}`, JSON.stringify(responses));
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 2000);
      }, 30000);
      
      return () => clearTimeout(timer);
    }
  }, [responses, peiId, professionalId, loading]);

  // Load saved responses
  useEffect(() => {
    const saved = localStorage.getItem(`pei_${peiId}_${professionalId}`);
    if (saved) {
      try {
        setResponses(JSON.parse(saved));
      } catch {
        // Ignore parse errors
      }
    }
  }, [peiId, professionalId]);

  // Get questions organized by sections
  const getQuestions = (): Question[][] => {
    // Section 1: Informações Gerais
    const section1: Question[] = [
      {
        key: 'role',
        label: 'Qual é o seu papel na vida do(a) estudante?',
        placeholder: 'Ex: Professor(a) de Matemática, Coordenador(a) Pedagógico(a)...',
        maxLength: 200,
      },
      {
        key: 'contact_time',
        label: 'Há quanto tempo você trabalha ou convive com este(a) estudante?',
        placeholder: 'Ex: 2 anos, 6 meses...',
        maxLength: 200,
      },
      {
        key: 'interaction_frequency',
        label: 'Com que frequência você interage com o(a) estudante?',
        placeholder: 'Ex: Diariamente, 3x por semana...',
        maxLength: 200,
      },
    ];

    // Section 2: Desenvolvimento Cognitivo
    const section2: Question[] = [
      {
        key: 'cognitive_strengths',
        label: 'Quais são os principais pontos fortes cognitivos do(a) estudante?',
        placeholder: 'Descreva habilidades como raciocínio lógico, memória, atenção, resolução de problemas...',
        maxLength: 500,
      },
      {
        key: 'cognitive_difficulties',
        label: 'Quais dificuldades cognitivas você observa?',
        placeholder: 'Descreva desafios em áreas como concentração, processamento de informação, memória...',
        maxLength: 500,
      },
    ];

    // Section 3: Comportamento e Interação Social
    const section3: Question[] = [
      {
        key: 'social_strengths',
        label: 'Como o(a) estudante se relaciona com colegas e professores?',
        placeholder: 'Descreva interações sociais, habilidades de comunicação, colaboração...',
        maxLength: 500,
      },
      {
        key: 'behavioral_challenges',
        label: 'Quais desafios comportamentais você observa?',
        placeholder: 'Descreva comportamentos que impactam a aprendizagem ou convivência...',
        maxLength: 500,
      },
    ];

    // Section 4: Aprendizagem e Estratégias
    const section4: Question[] = [
      {
        key: 'learning_style',
        label: 'Como o(a) estudante aprende melhor?',
        placeholder: 'Descreva estratégias que funcionam: visual, auditivo, prático, com apoio...',
        maxLength: 500,
      },
      {
        key: 'effective_strategies',
        label: 'Quais estratégias ou recursos têm sido eficazes?',
        placeholder: 'Descreva materiais, métodos, adaptações que ajudam na aprendizagem...',
        maxLength: 500,
      },
    ];

    // Section 5: Objetivos e Recomendações
    const section5: Question[] = [
      {
        key: 'goals',
        label: 'Quais objetivos educacionais você considera prioritários para este(a) estudante?',
        placeholder: 'Descreva metas de curto e médio prazo para o desenvolvimento...',
        maxLength: 1000,
      },
      {
        key: 'recommendations',
        label: 'Que recomendações você daria para apoiar o desenvolvimento do(a) estudante?',
        placeholder: 'Sugira intervenções, recursos, adaptações, acompanhamentos...',
        maxLength: 1000,
      },
    ];

    return [section1, section2, section3, section4, section5];
  };

  const sections = getQuestions();
  const sectionTitles = [
    'Informações Gerais',
    'Desenvolvimento Cognitivo',
    'Comportamento e Interação Social',
    'Aprendizagem e Estratégias',
    'Objetivos e Recomendações'
  ];
  const totalSections = sections.length;
  const progressPercentage = Math.round(((currentSection + 1) / totalSections) * 100);
  const currentQuestions = sections[currentSection] || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!peiId || !professionalId) return;
    
    // Filter out empty responses
    const filteredResponses = Object.fromEntries(
      Object.entries(responses).filter(([_, value]) => value.trim() !== '')
    );
    
    if (Object.keys(filteredResponses).length === 0) {
      toast({
        title: 'Atenção',
        description: 'Por favor, preencha pelo menos um campo antes de enviar.',
        variant: 'destructive',
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      await submitProfessionalResponse(peiId, professionalId, filteredResponses);
      
      toast({
        title: 'Sucesso!',
        description: 'Sua resposta foi enviada com sucesso. Obrigado pela sua contribuição!',
      });
      
      // Redirect to success page after 2 seconds
      setTimeout(() => {
        navigate('/form-success');
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting response:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: 'Erro',
        description: errorMessage || 'Não foi possível enviar sua resposta. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-8 h-8 animate-spin text-[#FF6B35]" />
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Formulário não encontrado</h2>
          <p className="text-gray-600">O link pode estar inválido ou expirado.</p>
        </div>
      </div>
    );
  }

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleNext = () => {
    if (currentSection < totalSections - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handleSaveAndExit = () => {
    localStorage.setItem(`pei_${peiId}_${professionalId}`, JSON.stringify(responses));
    toast({
      title: 'Progresso salvo',
      description: 'Você pode continuar mais tarde usando o mesmo link.',
    });
    setTimeout(() => navigate('/'), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-[#FF6B35] rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">PE.AI</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Formulário de Avaliação - PEI</h1>
              <p className="text-gray-600">Aluno(a): {studentName}</p>
            </div>
          </div>
          
          <div className="bg-orange-50 border-l-4 border-[#FF6B35] p-4 rounded">
            <p className="text-sm text-gray-700">
              <strong>Profissional:</strong> {professional.name} ({professional.type})
            </p>
            {professional.specialty && (
              <p className="text-sm text-gray-700 mt-1">
                <strong>Especialidade:</strong> {professional.specialty}
              </p>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Seção {currentSection + 1} de {totalSections}: {sectionTitles[currentSection]}
              </span>
              <span className="text-sm font-medium text-[#FF6B35]">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#FF6B35] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Auto-save indicator */}
          {autoSaved && (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
              <FloppyDisk className="w-4 h-4" />
              <span>Salvo automaticamente</span>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-xl font-semibold text-gray-800">{sectionTitles[currentSection]}</h2>
              <p className="text-sm text-gray-600 mt-1">
                Preencha as informações com base na sua experiência e observação do aluno.
                Quanto mais detalhadas suas respostas, melhor será o PEI gerado.
              </p>
            </div>

            {currentQuestions.map((question, index) => (
              <div key={question.key} className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#FF6B35] text-white rounded-full flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                  {question.label}
                </label>
                <Textarea
                  value={responses[question.key] || ''}
                  onChange={(e) => setResponses({ ...responses, [question.key]: e.target.value })}
                  placeholder={question.placeholder}
                  className="min-h-[120px]"
                  maxLength={question.maxLength}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{(responses[question.key] || '').length}/{question.maxLength} caracteres</span>
                </div>
              </div>
            ))}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentSection === 0}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleSaveAndExit}
                className="flex-1"
              >
                <FloppyDisk className="w-4 h-4 mr-2" />
                Salvar e Sair
              </Button>

              {currentSection < totalSections - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-[#FF6B35] hover:bg-[#E55A2B]"
                >
                  Próximo
                  <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#FF6B35] hover:bg-[#E55A2B]"
                >
                  {submitting ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Enviar Respostas
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>

        {/* Info Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Suas informações são confidenciais e serão utilizadas exclusivamente para a elaboração do PEI.</p>
          <p className="mt-2">Dúvidas? Entre em contato: suporte@pe-ai.com.br</p>
        </div>
      </div>
    </div>
  );
}
