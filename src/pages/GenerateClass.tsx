import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { ArrowLeft, FolderOpen, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getStudent, getStudentPEI, getStudentMaterials, uploadMaterial, type Student, type PEI, type AdaptedMaterial } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const GenerateClass = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialSubject, setMaterialSubject] = useState('');
  const [materialGrade, setMaterialGrade] = useState('');
  const [uploading, setUploading] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [pei, setPei] = useState<PEI | null>(null);
  const [materials, setMaterials] = useState<AdaptedMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!studentId) {
        toast({
          title: 'Erro',
          description: 'ID do aluno não fornecido',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const studentData = await getStudent(studentId);
        setStudent(studentData);

        try {
          const peiData = await getStudentPEI(studentId);
          setPei(peiData);
        } catch (err) {
          console.log('No PEI found for student:', studentId);
          setPei(null);
        }

        try {
          const materialsData = await getStudentMaterials(studentId);
          setMaterials(materialsData);
        } catch (err) {
          console.log('No materials found for student:', studentId);
          setMaterials([]);
        }
      } catch (err) {
        toast({
          title: 'Erro',
          description: err instanceof Error ? err.message : 'Erro ao carregar dados',
          variant: 'destructive',
        });
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, toast]);

  const handleLogout = () => {
    console.log('Logging out...');
  };

  const handleBack = () => {
    navigate('/students');
  };

  const handleViewPEI = () => {
    navigate(`/students/${studentId}/history`);
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
      // Auto-fill title from filename
      if (!materialTitle) {
        const titleFromFile = file.name.replace('.pdf', '');
        setMaterialTitle(titleFromFile);
      }
    }
  };

  const handleUploadMaterial = async () => {
    if (!selectedFile || !studentId) {
      toast({
        title: 'Erro',
        description: 'Selecione um arquivo PDF',
        variant: 'destructive',
      });
      return;
    }

    if (!materialTitle.trim()) {
      toast({
        title: 'Erro',
        description: 'Digite um título para o material',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);
      
      const result = await uploadMaterial(
        studentId,
        selectedFile,
        materialTitle,
        materialSubject || undefined,
        materialGrade || undefined
      );

      toast({
        title: 'Sucesso!',
        description: 'Material enviado para adaptação. A IA está processando...',
      });

      // Clear form
      setSelectedFile(null);
      setMaterialTitle('');
      setMaterialSubject('');
      setMaterialGrade('');

      // Refresh materials list
      setTimeout(async () => {
        try {
          const materialsData = await getStudentMaterials(studentId);
          setMaterials(materialsData);
        } catch (err) {
          console.error('Error refreshing materials:', err);
        }
      }, 1000);

    } catch (err) {
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Erro ao fazer upload do material',
        variant: 'destructive',
      });
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadPDF = async (materialId: string, materialTitle: string) => {
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
      a.download = `${materialTitle}_adaptado.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Sucesso!',
        description: 'PDF baixado com sucesso',
      });
    } catch (err) {
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Erro ao baixar PDF',
        variant: 'destructive',
      });
      console.error('Download error:', err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
      <Navbar onLogout={handleLogout} />
      
      <main className="flex flex-col w-full max-w-[1200px] mx-auto px-4 mt-[60px] pb-20">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-[#3A3D5B] text-lg font-normal mb-6 hover:text-[#E65100] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Histórico de aluno</span>
        </button>

        {loading ? (
          <div className="text-center py-8">Carregando...</div>
        ) : (
          <>
            {/* Student Information */}
            <div className="bg-white rounded-[10px] border border-[#DEE2E6] p-6 mb-6">
              <h1 className="text-[#E65100] text-[32px] font-bold mb-4">{student?.name || 'Carregando...'}</h1>
              <div className="flex flex-col gap-2 text-[#3A3D5B] text-lg">
                <p>ID: {student?.id}</p>
                <p>Status: {student?.status}</p>
                {pei && (
                  <>
                    <p>Necessidades Especiais: {typeof pei.special_needs === 'string' ? pei.special_needs : JSON.parse(pei.special_needs || '[]').join(', ')}</p>
                    <p>Diagnóstico: {pei.has_diagnosis ? 'Sim' : 'Não'}</p>
                  </>
                )}
              </div>
            </div>

            {/* Adapted Materials */}
            <div className="bg-white rounded-[10px] border border-[#DEE2E6] p-6 mb-6">
              <h2 className="text-black text-[28px] font-normal mb-6">Materiais adaptados</h2>
              
              {materials.length > 0 ? (
                <div className="border border-[#DEE2E6] rounded-[10px] overflow-hidden">
                  {/* Table Header */}
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-3 bg-white border-b border-[#DEE2E6]">
                    <div className="text-black text-base font-semibold">Arquivo</div>
                    <div className="text-black text-base font-semibold">Status</div>
                    <div className="text-black text-base font-semibold">Data</div>
                    <div className="text-black text-base font-semibold">Ações</div>
                  </div>

                  {/* Table Rows */}
                  {materials.map((material, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-4 bg-white border-b border-[#DEE2E6] hover:bg-[#F8F9FA] transition-colors items-center"
                    >
                      <div className="flex items-center gap-3">
                        <FolderOpen className="w-6 h-6 text-[#3A3D5B]" />
                        <div className="flex flex-col">
                          <span className="text-[#3A3D5B] text-base font-normal">{material.title}</span>
                          <span className="text-[#6C757D] text-sm">{material.original_filename}</span>
                        </div>
                      </div>
                      <div>
                        {material.status === 'completed' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                            ✓ Concluído
                          </span>
                        )}
                        {material.status === 'processing' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm font-medium">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Processando
                          </span>
                        )}
                        {material.status === 'error' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-sm font-medium">
                            ✗ Erro
                          </span>
                        )}
                      </div>
                      <div className="text-[#3A3D5B] text-base font-normal">
                        {new Date(material.uploaded_at).toLocaleDateString('pt-BR')}
                      </div>
                      <div>
                        {material.status === 'completed' ? (
                          <Button
                            onClick={() => handleDownloadPDF(material.id, material.title)}
                            size="sm"
                            className="bg-[#E65100] hover:bg-[#D14900] text-white"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Baixar PDF
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            disabled
                            className="bg-gray-300 text-gray-500 cursor-not-allowed"
                          >
                            Aguardando
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#3A3D5B] text-base">Nenhum material adaptado ainda.</p>
              )}
            </div>
          </>
        )}

        {/* PEI Section */}
        {pei ? (
          <div className="bg-white rounded-[10px] border border-[#DEE2E6] p-6 mb-6">
            <h2 className="text-black text-[28px] font-normal mb-4">Plano Educacional Individualizado</h2>
            
            <div className="flex items-center gap-4 mb-4">
              <span className="text-black text-lg font-normal">Status:</span>
              <span className={`text-lg font-bold ${pei.status === 'concluido' ? 'text-[#079D61]' : 'text-[#FFA500]'}`}>
                {pei.status === 'concluido' ? 'Disponível' : 'Em processamento'}
              </span>
              <Button
                onClick={handleViewPEI}
                className="ml-auto bg-[#FFD8C3] text-[#1D1D1D] text-base font-medium hover:bg-[#FFB899] border-none"
              >
                Visualizar
              </Button>
            </div>

            <div className="bg-[#F8F9FA] rounded-[10px] p-4">
              <p className="text-[#3A3D5B] text-base mb-2">
                O PEI de {student?.name || 'este aluno'} está {pei.status === 'concluido' ? 'completo e validado' : 'em processamento'}.
              </p>
              <p className="text-[#3A3D5B] text-base font-semibold">
                Criado em: {new Date(pei.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[10px] border border-[#DEE2E6] p-6 mb-6">
            <h2 className="text-black text-[28px] font-normal mb-4">Plano Educacional Individualizado</h2>
            <p className="text-[#3A3D5B] text-base">Nenhum PEI encontrado para este aluno.</p>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-[#FFD8C3] rounded-[10px] border border-[#E65100] p-8">
          <h3 className="text-[#1D1D1D] text-xl font-bold text-center mb-6">
            Faça o upload do material didático a ser adaptado ao aluno de forma inteligente!
          </h3>
          
          <div className="max-w-2xl mx-auto space-y-4">
            {/* File Upload */}
            <div>
              <Label htmlFor="file-upload" className="text-[#1D1D1D] font-medium mb-2 block">
                Selecione o arquivo PDF
              </Label>
              <input
                id="file-upload"
                type="file"
                className="w-full text-sm text-[#1D1D1D] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#E65100] file:text-white hover:file:bg-[#D14900] cursor-pointer"
                onChange={handleFileChange}
                accept=".pdf"
                disabled={uploading}
              />
              {selectedFile && (
                <p className="text-[#1D1D1D] text-sm mt-2">
                  📄 {selectedFile.name}
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="material-title" className="text-[#1D1D1D] font-medium mb-2 block">
                Título do Material *
              </Label>
              <Input
                id="material-title"
                type="text"
                value={materialTitle}
                onChange={(e) => setMaterialTitle(e.target.value)}
                placeholder="Ex: Introdução à Fotossíntese"
                className="w-full"
                disabled={uploading}
              />
            </div>

            {/* Subject */}
            <div>
              <Label htmlFor="material-subject" className="text-[#1D1D1D] font-medium mb-2 block">
                Disciplina (opcional)
              </Label>
              <Input
                id="material-subject"
                type="text"
                value={materialSubject}
                onChange={(e) => setMaterialSubject(e.target.value)}
                placeholder="Ex: Biologia"
                className="w-full"
                disabled={uploading}
              />
            </div>

            {/* Grade */}
            <div>
              <Label htmlFor="material-grade" className="text-[#1D1D1D] font-medium mb-2 block">
                Série (opcional)
              </Label>
              <Input
                id="material-grade"
                type="text"
                value={materialGrade}
                onChange={(e) => setMaterialGrade(e.target.value)}
                placeholder="Ex: 7º ano"
                className="w-full"
                disabled={uploading}
              />
            </div>

            {/* Upload Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleUploadMaterial}
                disabled={!selectedFile || !materialTitle.trim() || uploading}
                className="bg-[#E65100] hover:bg-[#D14900] text-white px-8 py-3 text-base font-semibold"
              >
                {uploading ? 'Enviando...' : 'Enviar para Adaptação'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GenerateClass;
