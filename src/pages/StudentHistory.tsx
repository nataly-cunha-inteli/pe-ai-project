import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { ArrowLeft, FolderOpen, RefreshCw, Mail, CheckCircle, Download, Upload, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getStudent, getStudentRespondents, getStudentPEI, getStudentMaterials, uploadMaterial, getMaterialDetails, type Student, type Respondent, type PEI, type AdaptedMaterial } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const StudentHistory = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [respondents, setRespondents] = useState<Respondent[]>([]);
  const [pei, setPei] = useState<PEI | null>(null);
  const [materials, setMaterials] = useState<AdaptedMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  console.log('StudentHistory carregado para aluno:', studentId);

  // Fetch student data, respondents, PEI, and materials from API
  useEffect(() => {
    const fetchData = async () => {
      if (!studentId) {
        setError('ID do aluno não fornecido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch student and respondents in parallel
        const [studentData, respondentsData] = await Promise.all([
          getStudent(studentId),
          getStudentRespondents(studentId)
        ]);
        
        setStudent(studentData);
        setRespondents(respondentsData);

        // Try to fetch PEI if exists
        try {
          const peiData = await getStudentPEI(studentId);
          setPei(peiData);
        } catch (peiErr) {
          // PEI might not exist yet, that's okay
          console.log('No PEI found for student:', studentId);
          setPei(null);
        }

        // Try to fetch materials
        try {
          const materialsData = await getStudentMaterials(studentId);
          setMaterials(materialsData);
        } catch (materialsErr) {
          console.log('No materials found for student:', studentId);
          setMaterials([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  const handleLogout = () => {
    console.log('Logging out...');
  };

  const handleBack = () => {
    navigate('/students');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.pdf')) {
        toast({
          title: 'Erro',
          description: 'Apenas arquivos PDF são permitidos',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadMaterial = async () => {
    if (!selectedFile || !studentId) return;

    // Check if PEI is approved
    if (pei?.status !== 'concluido') {
      toast({
        title: 'PEI não aprovado',
        description: 'O PEI do aluno precisa estar aprovado antes de adaptar materiais',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploadingFile(true);
      
      // Extract title from filename (remove .pdf extension)
      const title = selectedFile.name.replace('.pdf', '');
      
      await uploadMaterial(studentId, selectedFile, title);
      
      toast({
        title: '✅ Material enviado!',
        description: 'A IA está processando o material. Isso pode levar alguns minutos.',
      });

      // Clear selection
      setSelectedFile(null);
      
      // Refresh materials list
      const materialsData = await getStudentMaterials(studentId);
      setMaterials(materialsData);

    } catch (error) {
      toast({
        title: 'Erro ao enviar material',
        description: error instanceof Error ? error.message : 'Ocorreu um erro',
        variant: 'destructive',
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDownloadMaterial = async (materialId: string, filename: string) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/api/materials/${materialId}/download-pdf`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Erro ao baixar PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename.replace('.pdf', '')}_adaptado.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: '✅ Download iniciado',
        description: 'Material adaptado baixado com sucesso',
      });

    } catch (error) {
      toast({
        title: 'Erro ao baixar material',
        description: error instanceof Error ? error.message : 'Ocorreu um erro',
        variant: 'destructive',
      });
    }
  };

  const handleRefreshMaterials = async () => {
    if (!studentId) return;
    
    try {
      const materialsData = await getStudentMaterials(studentId);
      setMaterials(materialsData);
      toast({
        title: '🔄 Lista atualizada',
        description: 'Materiais recarregados',
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar',
        description: error instanceof Error ? error.message : 'Ocorreu um erro',
        variant: 'destructive',
      });
    }
  };

  const handleOpenFile = (fileName: string) => {
    console.log(`Opening file: ${fileName}`);
  };

  const handleRegisterRespondent = () => {
    console.log('Registering new respondent...');
  };

  const handleResendSMS = (role: string) => {
    toast({
      title: "📨 Formulário PEI reenviado",
      description: `Formulário enviado com sucesso para ${role}`,
      variant: "default",
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
        <Navbar onLogout={handleLogout} />
        <main className="flex flex-col items-center justify-center w-full max-w-[1200px] mx-auto px-4 mt-[60px] pb-20">
          <div className="text-[#3A3D5B] text-xl">Carregando dados do aluno...</div>
        </main>
      </div>
    );
  }

  // Show error state
  if (error || !student) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
        <Navbar onLogout={handleLogout} />
        <main className="flex flex-col items-center justify-center w-full max-w-[1200px] mx-auto px-4 mt-[60px] pb-20">
          <div className="text-red-600 text-xl">❌ Erro: {error || 'Aluno não encontrado'}</div>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-[#E65100] text-white rounded hover:bg-[#D14900] transition-colors"
          >
            Voltar para lista de alunos
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
      <Navbar onLogout={handleLogout} />
      
      <main className="flex flex-col w-full max-w-[1200px] mx-auto px-4 mt-[60px] pb-20">
        {/* Back Button and Title */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-6 h-6 text-[#3A3D5B]" />
          </button>
          <h1 className="text-[#E65100] text-[32px] font-bold">Histórico de aluno</h1>
        </div>

        {/* Student Info Card */}
        <div className="bg-white rounded-[10px] border border-[#DEE2E6] p-6 mb-8">
          <h2 className="text-black text-[24px] font-bold mb-4">{student?.name || 'Carregando...'}</h2>
          <div className="space-y-2 text-[#3A3D5B] text-base">
            <p>ID: {student?.id}</p>
            <p>Status: {student?.status}</p>
            {pei && (
              <>
                <p>Necessidades Especiais: {typeof pei.special_needs === 'string' ? pei.special_needs : JSON.parse(pei.special_needs || '[]').join(', ')}</p>
                <p>Diagnóstico: {pei.has_diagnosis ? 'Sim' : 'Não'}</p>
                {pei.initial_observations && <p>Observações: {pei.initial_observations}</p>}
              </>
            )}
          </div>
        </div>

        {/* Upload Section */}
        {pei?.status === 'concluido' && (
          <div className="bg-white rounded-[10px] border border-[#DEE2E6] p-6 mb-8">
            <h3 className="text-black text-[20px] font-bold mb-4">📤 Upload de Material Didático</h3>
            <p className="text-[#3A3D5B] text-sm mb-4">
              Envie materiais em PDF para serem adaptados pela IA de acordo com o PEI do aluno
            </p>
            
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="flex-1 text-sm text-[#3A3D5B] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#E65100] file:text-white hover:file:bg-[#D14900] cursor-pointer"
                disabled={uploadingFile}
              />
              <Button
                onClick={handleUploadMaterial}
                disabled={!selectedFile || uploadingFile}
                className="bg-[#E65100] hover:bg-[#D14900] text-white"
              >
                {uploadingFile ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Enviar
                  </>
                )}
              </Button>
            </div>
            {selectedFile && (
              <p className="text-sm text-green-600 mt-2">
                ✓ Arquivo selecionado: {selectedFile.name}
              </p>
            )}
          </div>
        )}

        {/* Materials Section */}
        <div className="bg-white rounded-[10px] border border-[#DEE2E6] overflow-hidden mb-8">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-[#DEE2E6]">
            <h3 className="text-black text-[20px] font-bold">📚 Materiais Adaptados</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshMaterials}
              className="text-[#E65100] hover:text-[#D14900]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>

          {materials.length === 0 ? (
            <div className="px-6 py-8 text-center text-[#3A3D5B]">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum material adaptado ainda</p>
              {pei?.status === 'concluido' ? (
                <p className="text-sm mt-2">Envie um PDF acima para começar</p>
              ) : (
                <p className="text-sm mt-2">Aprove o PEI primeiro para adaptar materiais</p>
              )}
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="grid grid-cols-[1fr_150px_150px_150px_120px] gap-4 px-6 py-3 bg-gray-50 border-b border-[#DEE2E6]">
                <div className="text-black text-sm font-semibold">Título</div>
                <div className="text-black text-sm font-semibold">Disciplina</div>
                <div className="text-black text-sm font-semibold">Data Upload</div>
                <div className="text-black text-sm font-semibold">Status</div>
                <div className="text-black text-sm font-semibold text-center">Ações</div>
              </div>

              {/* Rows */}
              {materials.map((material) => {
                const statusConfig = {
                  processing: { label: '⏳ Processando', color: 'bg-yellow-100 text-yellow-700' },
                  completed: { label: '✅ Concluído', color: 'bg-green-100 text-green-700' },
                  error: { label: '❌ Erro', color: 'bg-red-100 text-red-700' },
                };
                const status = statusConfig[material.status] || statusConfig.processing;

                return (
                  <div
                    key={material.id}
                    className="grid grid-cols-[1fr_150px_150px_150px_120px] gap-4 px-6 py-4 bg-white border-b border-[#DEE2E6] hover:bg-[#F8F9FA] transition-colors items-center"
                  >
                    <div className="text-[#3A3D5B] text-sm font-medium">
                      {material.title}
                      <p className="text-xs text-gray-500 mt-1">{material.original_filename}</p>
                    </div>
                    <div className="text-[#3A3D5B] text-sm">
                      {material.subject || '-'}
                    </div>
                    <div className="text-[#3A3D5B] text-sm">
                      {material.uploaded_at
                        ? new Date(material.uploaded_at).toLocaleDateString('pt-BR')
                        : '-'}
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex justify-center gap-2">
                      {material.status === 'processing' && (
                        <Loader2 className="w-5 h-5 text-[#E65100] animate-spin" />
                      )}
                      {material.status === 'completed' && (
                        <button
                          onClick={() => handleDownloadMaterial(material.id, material.original_filename)}
                          className="hover:opacity-70 transition-opacity"
                          aria-label="Baixar material adaptado"
                          title="Baixar material adaptado"
                        >
                          <Download className="w-5 h-5 text-[#E65100]" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* PEI Section */}
        <div className="bg-white rounded-[10px] border border-[#DEE2E6] p-6">
          <h3 className="text-black text-[20px] font-bold mb-4">
            Plano Educacional Individualizado
          </h3>

          {pei ? (
            <>
              {/* PEI EXISTS - Show full information */}
              
              {/* Status */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-black text-base font-semibold">Status:</span>
                <div className={`flex items-center gap-2 px-3 py-1 rounded ${
                  pei.status === 'completed' || pei.status === 'concluido' ? 'bg-[#D4EDDA]' :
                  pei.status === 'in_review' ? 'bg-[#FFF3CD]' :
                  pei.status === 'in_collection' ? 'bg-[#FFF4E6]' :
                  'bg-[#F8F9FA]'
                }`}>
                  {pei.status === 'completed' || pei.status === 'concluido' ? (
                    <CheckCircle className="w-5 h-5 text-[#155724]" />
                  ) : (
                    <RefreshCw className="w-5 h-5 text-[#9F8D46]" />
                  )}
                  <span className={`text-base font-medium ${
                    pei.status === 'completed' || pei.status === 'concluido' ? 'text-[#155724]' :
                    pei.status === 'in_review' ? 'text-[#856404]' :
                    pei.status === 'in_collection' ? 'text-[#9F8D46]' :
                    'text-[#3A3D5B]'
                  }`}>
                    {pei.status === 'completed' || pei.status === 'concluido'
                      ? 'Completo'
                      : pei.status === 'in_review' 
                      ? 'Em revisão'
                      : pei.status === 'in_collection'
                      ? 'PEI em coleta'
                      : 'Em desenvolvimento'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-[#3A3D5B] text-base mb-2">
                {pei.status === 'completed' || pei.status === 'concluido'
                  ? `O PEI de ${student?.name || 'este aluno'} está completo e validado.`
                  : pei.status === 'in_review'
                  ? `O PEI de ${student?.name || 'este aluno'} está em revisão pelo auditor.`
                  : `O PEI de ${student?.name || 'este aluno'} está sendo desenvolvido e possui alguns respondentes pendentes.`
                }
              </p>
              <p className="text-[#3A3D5B] text-base mb-2">
                <strong>NEE:</strong> {pei.special_needs || 'Não especificado'}
              </p>
              <p className="text-[#3A3D5B] text-base mb-6">
                <strong>Criado em:</strong> {new Date(pei.created_at).toLocaleDateString('pt-BR')}
              </p>

              {/* Register Button */}
              <Button
                onClick={handleRegisterRespondent}
                className="mb-6 bg-[#FFD8C3] text-[#1D1D1D] hover:bg-[#FFB899] border-none"
              >
                <Mail className="w-5 h-5 mr-2" />
                Cadastrar novo respondente
              </Button>

              {/* Professionals List from PEI */}
              {pei.professionals && pei.professionals.length > 0 ? (
                <div className="space-y-4">
                  <h4 className="text-[#3A3D5B] font-semibold text-lg mb-3">
                    Profissionais Respondentes ({pei.professionals.length})
                  </h4>
                  {pei.professionals.map((prof) => {
                    // Find matching respondent to get status
                    const matchingRespondent = respondents.find(r => r.phone === prof.phone);
                    const status = matchingRespondent?.status || 'pending';
                    
                    return (
                      <div
                        key={prof.id}
                        className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-[10px] border border-[#DEE2E6]"
                      >
                        <div className="flex-1">
                          <div className="text-[#3A3D5B] text-base mb-2">
                            <span className="font-semibold">{prof.type}</span>
                            {prof.specialty && <span className="text-sm"> ({prof.specialty})</span>}
                            {' - '}
                            <span className={`${
                              status === 'completed' ? 'text-green-600' :
                              status === 'access' ? 'text-blue-600' :
                              'text-[#E65100]'
                            }`}>
                              {status === 'link' && '<Link do formulário>'}
                              {status === 'access' && '<Acessar formulário>'}
                              {status === 'completed' && '✓ Completo'}
                              {status === 'pending' && '<Pendente>'}
                            </span>
                          </div>
                          <p className="text-[#3A3D5B] text-sm">Nome: {prof.name}</p>
                          {prof.email && (
                            <p className="text-[#3A3D5B] text-sm">Email: {prof.email}</p>
                          )}
                          <p className="text-[#3A3D5B] text-sm">Telefone: {prof.phone}</p>
                        </div>
                        {status === 'link' && (
                          <Button
                            onClick={() => handleResendSMS(prof.type)}
                            variant="ghost"
                            className="text-[#3A3D5B] hover:text-[#E65100]"
                          >
                            <Mail className="w-5 h-5 mr-2" />
                            Reenviar SMS
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Fallback to respondents if no professionals in PEI */
                respondents.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-[#3A3D5B] font-semibold text-lg mb-3">
                      Respondentes ({respondents.length})
                    </h4>
                    {respondents.map((respondent) => (
                      <div
                        key={respondent.id}
                        className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-[10px] border border-[#DEE2E6]"
                      >
                        <div className="flex-1">
                          <div className="text-[#3A3D5B] text-base mb-2">
                            <span className="font-semibold">{respondent.role}</span> -{' '}
                            <span className={`${
                              respondent.status === 'completed' ? 'text-green-600' :
                              respondent.status === 'access' ? 'text-blue-600' :
                              'text-[#E65100]'
                            }`}>
                              {respondent.status === 'link' && '<Link do formulário>'}
                              {respondent.status === 'access' && '<Acessar formulário>'}
                              {respondent.status === 'completed' && '✓ Completo'}
                            </span>
                          </div>
                          <p className="text-[#3A3D5B] text-sm">Nome: {respondent.name}</p>
                          {respondent.email && (
                            <p className="text-[#3A3D5B] text-sm">Email: {respondent.email}</p>
                          )}
                          <p className="text-[#3A3D5B] text-sm">Telefone: {respondent.phone}</p>
                        </div>
                        {respondent.status === 'link' && (
                          <Button
                            onClick={() => handleResendSMS(respondent.role)}
                            variant="ghost"
                            className="text-[#3A3D5B] hover:text-[#E65100]"
                          >
                            <Mail className="w-5 h-5 mr-2" />
                            Reenviar SMS
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}
            </>
          ) : (
            <>
              {/* NO PEI EXISTS - Show only "Create PEI" button */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-black text-base font-semibold">Status:</span>
                <div className="flex items-center gap-2 bg-[#F8F9FA] px-3 py-1 rounded">
                  <span className="text-[#6C757D] text-base font-medium">PEI não criado</span>
                </div>
              </div>

              <p className="text-[#3A3D5B] text-base mb-6">
                Ainda não há PEI criado para {student?.name || 'este aluno'}. Clique no botão abaixo para iniciar o processo de criação do Plano Educacional Individualizado.
              </p>

              {/* Create PEI Button */}
              <Button
                onClick={() => navigate('/pei/create')}
                className="bg-[#E65100] hover:bg-[#D14900] text-white"
              >
                <FolderOpen className="w-5 h-5 mr-2" />
                Criar novo PEI
              </Button>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentHistory;
