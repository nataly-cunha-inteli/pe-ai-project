import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Upload, Edit, Trash2, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createPEI } from '@/services/api';

interface Professional {
  id: string;
  type: string;
  name: string;
  phone: string;
  email?: string;
  specialty?: string;
}

const CreatePEI = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state - Step 1
  const [formData, setFormData] = useState({
    studentName: '',
    birthDate: '',
    grade: '',
    specialNeeds: [] as string[],
    otherNeed: '',
    hasDiagnosis: '',
    attachedFiles: [] as File[],
    observations: '',
  });

  // Form state - Step 2
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [newProfessional, setNewProfessional] = useState<Partial<Professional>>({
    type: '',
    name: '',
    phone: '',
    email: '',
    specialty: '',
  });

  const specialNeedsOptions = [
    'Deficiência Intelectual',
    'Deficiência Física',
    'Deficiência Visual',
    'Deficiência Auditiva',
    'TEA (Transtorno do Espectro Autista)',
    'TDAH',
    'Dislexia',
  ];

  const professionalTypes = [
    'Psicólogo',
    'Professor',
    'Responsável (Pai/Mãe)',
    'Terapeuta',
    'Fonoaudiólogo',
    'Colega de Turma',
    'Outro',
  ];

  const gradeOptions = [
    '1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano',
    '6º Ano', '7º Ano', '8º Ano', '9º Ano',
    '1º Ano EM', '2º Ano EM', '3º Ano EM'
  ];

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      'Psicólogo': '🧠',
      'Professor': '👨‍🏫',
      'Responsável (Pai/Mãe)': '👪',
      'Terapeuta': '🩺',
      'Fonoaudiólogo': '👂',
      'Colega de Turma': '👥',
      'Outro': '👤',
    };
    return icons[type] || '👤';
  };

  const handleLogout = () => {
    console.log('Logging out...');
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/');
    }
  };

  const handleSpecialNeedToggle = (need: string) => {
    setFormData(prev => ({
      ...prev,
      specialNeeds: prev.specialNeeds.includes(need)
        ? prev.specialNeeds.filter(n => n !== need)
        : [...prev.specialNeeds, need]
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        attachedFiles: [...prev.attachedFiles, ...Array.from(e.target.files || [])]
      }));
    }
  };

  const handleAddProfessional = () => {
    if (!newProfessional.type || !newProfessional.name || !newProfessional.phone) {
      toast({
        title: "⚠️ Campos obrigatórios",
        description: "Por favor, preencha todos os campos marcados com *",
        variant: "destructive",
      });
      return;
    }

    const professional: Professional = {
      id: Math.random().toString(36).substr(2, 9),
      type: newProfessional.type!,
      name: newProfessional.name!,
      phone: newProfessional.phone!,
      email: newProfessional.email,
      specialty: newProfessional.specialty,
    };

    if (editingProfessional) {
      setProfessionals(prev => 
        prev.map(p => p.id === editingProfessional.id ? { ...professional, id: editingProfessional.id } : p)
      );
      setEditingProfessional(null);
    } else {
      setProfessionals(prev => [...prev, professional]);
    }

    setNewProfessional({ type: '', name: '', phone: '', email: '', specialty: '' });
    setShowAddModal(false);
  };

  const handleEditProfessional = (professional: Professional) => {
    setEditingProfessional(professional);
    setNewProfessional(professional);
    setShowAddModal(true);
  };

  const handleRemoveProfessional = (id: string) => {
    setProfessionals(prev => prev.filter(p => p.id !== id));
  };

  const handleNext = () => {
    // Validation for step 1
    if (step === 1) {
      if (!formData.studentName || !formData.birthDate || !formData.grade) {
        toast({
          title: "⚠️ Campos obrigatórios",
          description: "Por favor, preencha todos os campos marcados com *",
          variant: "destructive",
        });
        return;
      }
      if (formData.specialNeeds.length === 0 && !formData.otherNeed) {
        toast({
          title: "⚠️ Necessidade Educacional Especial",
          description: "Por favor, selecione ao menos uma NEE",
          variant: "destructive",
        });
        return;
      }
      if (!formData.hasDiagnosis) {
        toast({
          title: "⚠️ Diagnóstico",
          description: "Por favor, informe se o aluno possui laudo/diagnóstico",
          variant: "destructive",
        });
        return;
      }
    }

    // Validation for step 2
    if (step === 2) {
      if (professionals.length < 3) {
        toast({
          title: "⚠️ Profissionais insuficientes",
          description: "Adicione pelo menos 3 profissionais para uma avaliação completa",
          variant: "destructive",
        });
        return;
      }
    }

    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleConfirmAndSend = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare special needs array
      const allNeeds = [...formData.specialNeeds];
      if (formData.otherNeed) {
        allNeeds.push(formData.otherNeed);
      }
      
      // Create PEI via API
      await createPEI({
        student_name: formData.studentName,
        special_needs: allNeeds,
        has_diagnosis: formData.hasDiagnosis,
        initial_observations: formData.observations || undefined,
        professionals: professionals,
      });
      
      toast({
        title: "✅ PEI Criado com Sucesso!",
        description: `SMS enviado para ${professionals.length} profissionais`,
        variant: "default",
      });
      
      // Navigate to success page (step 4)
      setStep(4);
    } catch (error) {
      toast({
        title: "❌ Erro ao criar PEI",
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  const progressPercentage = (step / totalSteps) * 100;

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
      <Navbar onLogout={handleLogout} />
      
      <main className="flex flex-col w-full max-w-[900px] mx-auto px-4 mt-[60px] pb-20">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleBack}
            className="flex items-center text-[#3A3D5B] hover:text-[#E65100] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </button>
          <h1 className="text-[#E65100] text-[32px] font-bold flex-1 text-center">
            Criar Novo PEI
          </h1>
        </div>

        {/* Progress Bar */}
        {step < 4 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#3A3D5B] text-sm font-medium">
                Passo {step} de {totalSteps - 1}
              </span>
              <span className="text-[#3A3D5B] text-sm">
                {Math.round((step / (totalSteps - 1)) * 100)}% completo
              </span>
            </div>
            <div className="w-full bg-[#DEE2E6] rounded-full h-2">
              <div
                className="bg-[#E65100] h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / (totalSteps - 1)) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Step 1: Student Information */}
        {step === 1 && (
          <div className="bg-white rounded-[10px] border border-[#DEE2E6] p-8">
            <h2 className="text-[#3A3D5B] text-2xl font-semibold mb-6 flex items-center gap-2">
              📝 Passo 1: Informações do Aluno
            </h2>

            <div className="space-y-6">
              {/* Student Name */}
              <div>
                <label className="block text-[#3A3D5B] text-sm font-medium mb-2">
                  Nome Completo do Aluno <span className="text-[#E65100]">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Digite o nome completo..."
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="w-full"
                />
              </div>

              {/* Birth Date and Grade */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#3A3D5B] text-sm font-medium mb-2">
                    Data de Nascimento <span className="text-[#E65100]">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-[#3A3D5B] text-sm font-medium mb-2">
                    Série/Ano <span className="text-[#E65100]">*</span>
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-[#DEE2E6] bg-white text-[#3A3D5B]"
                  >
                    <option value="">Selecione...</option>
                    {gradeOptions.map((grade) => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Special Needs */}
              <div>
                <label className="block text-[#3A3D5B] text-sm font-medium mb-3">
                  Necessidade Educacional Especial <span className="text-[#E65100]">*</span>
                </label>
                <div className="space-y-2">
                  {specialNeedsOptions.map((need) => (
                    <label key={need} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.specialNeeds.includes(need)}
                        onChange={() => handleSpecialNeedToggle(need)}
                        className="w-4 h-4 text-[#E65100] border-gray-300 rounded focus:ring-[#E65100]"
                      />
                      <span className="text-[#3A3D5B]">{need}</span>
                    </label>
                  ))}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!formData.otherNeed}
                      onChange={(e) => {
                        if (!e.target.checked) {
                          setFormData({ ...formData, otherNeed: '' });
                        }
                      }}
                      className="w-4 h-4 text-[#E65100] border-gray-300 rounded focus:ring-[#E65100]"
                    />
                    <span className="text-[#3A3D5B] mr-2">Outro:</span>
                    <Input
                      type="text"
                      placeholder="Especifique..."
                      value={formData.otherNeed}
                      onChange={(e) => setFormData({ ...formData, otherNeed: e.target.value })}
                      className="flex-1"
                      disabled={!formData.otherNeed && formData.otherNeed === ''}
                    />
                  </div>
                </div>
              </div>

              {/* Diagnosis */}
              <div>
                <label className="block text-[#3A3D5B] text-sm font-medium mb-3">
                  Já possui laudo/diagnóstico? <span className="text-[#E65100]">*</span>
                </label>
                <div className="flex gap-6">
                  {['Sim', 'Não', 'Em avaliação'].map((option) => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="diagnosis"
                        value={option}
                        checked={formData.hasDiagnosis === option}
                        onChange={(e) => setFormData({ ...formData, hasDiagnosis: e.target.value })}
                        className="w-4 h-4 text-[#E65100] border-gray-300 focus:ring-[#E65100]"
                      />
                      <span className="text-[#3A3D5B]">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-[#3A3D5B] text-sm font-medium mb-2">
                  Anexar Laudo/Documentos
                </label>
                <label className="flex items-center gap-2 px-4 py-2 bg-[#ECECEC] border border-[#E65100] rounded cursor-pointer hover:bg-[#E0E0E0] transition-colors w-fit">
                  <Upload className="w-4 h-4" />
                  <span className="text-[#1D1D1D] text-sm">📎 Anexar Laudo/Documentos</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </label>
                {formData.attachedFiles.length > 0 && (
                  <div className="mt-2">
                    <p className="text-[#3A3D5B] text-sm">
                      {formData.attachedFiles.length} arquivo(s) anexado(s)
                    </p>
                  </div>
                )}
              </div>

              {/* Observations */}
              <div>
                <label className="block text-[#3A3D5B] text-sm font-medium mb-2">
                  Observações Iniciais (opcional)
                </label>
                <Textarea
                  placeholder="Adicione observações relevantes sobre o aluno..."
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  className="w-full min-h-[100px]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Add Professionals */}
        {step === 2 && (
          <div className="bg-white rounded-[10px] border border-[#DEE2E6] p-8">
            <h2 className="text-[#3A3D5B] text-2xl font-semibold mb-4 flex items-center gap-2">
              👥 Passo 2: Profissionais Respondentes
            </h2>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <p className="text-[#3A3D5B] text-sm">
                ℹ️ Adicione os profissionais que fornecerão informações sobre o aluno. 
                Eles receberão um SMS com link para responder a pesquisa.
              </p>
            </div>

            <Button
              onClick={() => {
                setEditingProfessional(null);
                setNewProfessional({ type: '', name: '', phone: '', email: '', specialty: '' });
                setShowAddModal(true);
              }}
              className="mb-6 bg-[#E65100] hover:bg-[#D14900] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Profissional
            </Button>

            {professionals.length > 0 && (
              <div className="space-y-4 mb-6">
                <h3 className="text-[#3A3D5B] font-medium">
                  Profissionais Adicionados ({professionals.length}):
                </h3>
                {professionals.map((prof) => (
                  <div key={prof.id} className="border border-[#DEE2E6] rounded-md p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{getTypeIcon(prof.type)}</span>
                          <span className="text-[#3A3D5B] font-medium">
                            {prof.type}
                            {prof.specialty && ` (${prof.specialty})`}
                          </span>
                        </div>
                        <p className="text-[#3A3D5B]">{prof.name}</p>
                        <p className="text-[#6C757D] text-sm">📱 {prof.phone}</p>
                        {prof.email && (
                          <p className="text-[#6C757D] text-sm">✉️ {prof.email}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditProfessional(prof)}
                          className="p-2 text-[#3A3D5B] hover:text-[#E65100] transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveProfessional(prof.id)}
                          className="p-2 text-[#3A3D5B] hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {professionals.length < 3 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-[#3A3D5B] text-sm">
                  💡 Sugestão: Adicione pelo menos 3 profissionais de áreas diferentes para uma avaliação completa.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Review and Confirm */}
        {step === 3 && (
          <div className="bg-white rounded-[10px] border border-[#DEE2E6] p-8">
            <h2 className="text-[#3A3D5B] text-2xl font-semibold mb-6 flex items-center gap-2">
              ✓ Passo 3: Revisar e Confirmar
            </h2>

            {/* Student Information */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#3A3D5B] font-semibold text-lg">📋 Informações do Aluno</h3>
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 text-[#E65100] hover:text-[#D14900] text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Editar Info
                </button>
              </div>
              <div className="border-t border-[#DEE2E6] pt-4 space-y-2">
                <p className="text-[#3A3D5B]"><strong>Nome:</strong> {formData.studentName}</p>
                <p className="text-[#3A3D5B]"><strong>Data Nasc:</strong> {formData.birthDate}</p>
                <p className="text-[#3A3D5B]"><strong>Série:</strong> {formData.grade}</p>
                <p className="text-[#3A3D5B]">
                  <strong>NEE:</strong> {[...formData.specialNeeds, formData.otherNeed].filter(Boolean).join(', ')}
                </p>
                <p className="text-[#3A3D5B]">
                  <strong>Laudo:</strong> {formData.attachedFiles.length > 0 ? '✓ Anexado' : 'Não anexado'}
                </p>
              </div>
            </div>

            {/* Professionals */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#3A3D5B] font-semibold text-lg">
                  👥 Profissionais que Receberão SMS ({professionals.length})
                </h3>
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1 text-[#E65100] hover:text-[#D14900] text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
              </div>
              <div className="border-t border-[#DEE2E6] pt-4 space-y-2">
                {professionals.map((prof, index) => (
                  <p key={prof.id} className="text-[#3A3D5B]">
                    {index + 1}. {getTypeIcon(prof.type)} {prof.name} ({prof.type}) - {prof.phone}
                  </p>
                ))}
              </div>
            </div>

            {/* SMS Preview */}
            <div className="mb-6">
              <h3 className="text-[#3A3D5B] font-semibold text-lg mb-4">📱 Mensagem que Será Enviada</h3>
              <div className="border-t border-[#DEE2E6] pt-4">
                <div className="bg-[#F8F9FA] border border-[#DEE2E6] rounded-md p-4 text-sm text-[#3A3D5B]">
                  <p className="mb-2">Olá {professionals[0]?.name || '[Nome]'}!</p>
                  <p className="mb-2">
                    Você foi convidado(a) a participar da elaboração do PEI do aluno {formData.studentName}.
                  </p>
                  <p className="mb-2">Acesse: https://peai.edu.br/p/abc123</p>
                  <p className="mb-2">Válido por 7 dias.</p>
                  <p className="font-medium">PE.AI - Educação Inclusiva</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-[#3A3D5B] text-sm">
                ⚠️ Ao confirmar, os SMS serão enviados imediatamente.
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="bg-white rounded-[10px] border border-[#DEE2E6] p-12 text-center">
            <div className="text-6xl mb-6">✅</div>
            <h2 className="text-[#3A3D5B] text-3xl font-bold mb-6">
              PEI Criado com Sucesso!
            </h2>

            <div className="border-t border-[#DEE2E6] pt-6 mb-6">
              <p className="text-[#3A3D5B] text-lg mb-4">
                📱 SMS enviado para {professionals.length} profissionais
              </p>
              <div className="space-y-2 max-w-md mx-auto text-left">
                {professionals.map((prof) => (
                  <p key={prof.id} className="text-[#3A3D5B]">
                    ✓ {prof.name} ({prof.type})
                  </p>
                ))}
              </div>
            </div>

            <div className="border-t border-[#DEE2E6] pt-6 mb-8">
              <h3 className="text-[#3A3D5B] font-semibold text-lg mb-4">📋 Próximos Passos:</h3>
              <ol className="text-left max-w-2xl mx-auto space-y-2 text-[#3A3D5B]">
                <li>1. Os profissionais têm 7 dias para responder</li>
                <li>2. Você pode acompanhar as respostas no dashboard</li>
                <li>3. Quando todas as respostas chegarem, a IA gerará o PEI provisório</li>
                <li>4. Você será notificado para revisão</li>
              </ol>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => navigate('/')}
                className="bg-[#E65100] hover:bg-[#D14900] text-white"
              >
                🏠 Voltar ao Dashboard
              </Button>
              <Button
                onClick={() => navigate(`/pei/1`)}
                variant="outline"
                className="border-[#E65100] text-[#E65100] hover:bg-[#FFD8C3]"
              >
                👁️ Ver Detalhes
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {step < 4 && (
          <div className="flex justify-between mt-8">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="border-[#DEE2E6] text-[#3A3D5B]"
            >
              Cancelar
            </Button>
            {step < 3 ? (
              <Button
                onClick={handleNext}
                className="bg-[#E65100] hover:bg-[#D14900] text-white"
              >
                Próximo Passo →
              </Button>
            ) : (
              <Button
                onClick={handleConfirmAndSend}
                className="bg-[#E65100] hover:bg-[#D14900] text-white"
              >
                ✓ Confirmar e Enviar SMS
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Add Professional Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#3A3D5B] text-lg font-semibold">
                {editingProfessional ? '✏️ Editar' : '➕ Adicionar'} Profissional
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProfessional(null);
                  setNewProfessional({ type: '', name: '', phone: '', email: '', specialty: '' });
                }}
                className="text-[#3A3D5B] hover:text-[#E65100]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Type */}
              <div>
                <label className="block text-[#3A3D5B] text-sm font-medium mb-2">
                  Tipo de Profissional <span className="text-[#E65100]">*</span>
                </label>
                <select
                  value={newProfessional.type}
                  onChange={(e) => setNewProfessional({ ...newProfessional, type: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-[#DEE2E6] bg-white text-[#3A3D5B]"
                >
                  <option value="">Selecione...</option>
                  {professionalTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[#3A3D5B] text-sm font-medium mb-2">
                  Nome Completo <span className="text-[#E65100]">*</span>
                </label>
                <Input
                  type="text"
                  value={newProfessional.name}
                  onChange={(e) => setNewProfessional({ ...newProfessional, name: e.target.value })}
                  className="w-full"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[#3A3D5B] text-sm font-medium mb-2">
                  Telefone (com DDD) <span className="text-[#E65100]">*</span>
                </label>
                <Input
                  type="tel"
                  placeholder="(11) 9____-____"
                  value={newProfessional.phone}
                  onChange={(e) => setNewProfessional({ ...newProfessional, phone: e.target.value })}
                  className="w-full"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[#3A3D5B] text-sm font-medium mb-2">
                  E-mail (opcional)
                </label>
                <Input
                  type="email"
                  value={newProfessional.email}
                  onChange={(e) => setNewProfessional({ ...newProfessional, email: e.target.value })}
                  className="w-full"
                />
              </div>

              {/* Specialty (conditional) */}
              {newProfessional.type === 'Professor' && (
                <div>
                  <label className="block text-[#3A3D5B] text-sm font-medium mb-2">
                    Especialidade (se professor)
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: Matemática"
                    value={newProfessional.specialty}
                    onChange={(e) => setNewProfessional({ ...newProfessional, specialty: e.target.value })}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProfessional(null);
                  setNewProfessional({ type: '', name: '', phone: '', email: '', specialty: '' });
                }}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddProfessional}
                className="flex-1 bg-[#E65100] hover:bg-[#D14900] text-white"
              >
                {editingProfessional ? 'Salvar' : 'Adicionar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePEI;
