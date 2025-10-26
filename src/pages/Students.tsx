import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ArrowsClockwise, XCircle } from '@phosphor-icons/react';
import { getStudents, type Student } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const Students = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState('All');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = () => {
    console.log('Logging out...');
  };

  const handleAddStudent = () => {
    toast({
      title: "🚧 Funcionalidade em desenvolvimento",
      description: "⏳ A função de adicionar aluno será implementada em breve.",
      variant: "default",
    });
  };

  // Fetch students from API on mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getStudents();
        setStudents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch students');
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleGenerateClass = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student?.status === 'active') {
      navigate(`/students/${studentId}/generate-class`);
    } else {
      console.log(`❌ Students.tsx - Cannot generate class for student ${studentId} with status ${student?.status}`);
      console.log(`Cannot generate class for student ${studentId} with status ${student?.status}`);
    }
  };

  const handleResendForm = (studentId: string) => {
    navigate(`/students/${studentId}/history`);
  };

  const handleRegisterForm = (studentId: string) => {
    navigate(`/students/${studentId}/history`);
  };

  const handleViewHistory = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student?.status === 'resend_form') {
      navigate(`/students/${studentId}/history`);
    } else {
      console.log(`Viewing history for student ${studentId} with different status`);
    }
  };

  const getStatusIcon = (status: Student['status']) => {
    if (status === 'resend_form') {
      return <ArrowsClockwise size={24} color="#9F8D46" weight="regular" />;
    }
    if (status === 'pending_form') {
      return <XCircle size={24} color="#E65100" weight="regular" />;
    }
    if (status === 'active') {
      return (
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/b60debcfdfd573b7b50d9eaec8c9129f0020d89b?placeholderIfAbsent=true"
          alt="Status icon"
          className="w-6 h-6"
        />
      );
    }
    return null;
  };

  const getActionButton = (student: Student) => {
    if (student.status === 'active') {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => handleGenerateClass(student.id)}
            className="px-3 py-1.5 rounded bg-[#89d496] text-white text-sm font-medium hover:bg-[#67a070] transition-colors"
          >
            Gerar aula
          </button>
          <button
            onClick={() => navigate(`/pei/${student.id}`)}
            className="px-3 py-1.5 rounded bg-[#FFD8C3] text-[#1D1D1D] text-sm font-medium hover:bg-[#FFB899] transition-colors"
          >
            Ver PEI
          </button>
        </div>
      );
    } else if (student.status === 'resend_form') {
      return (
        <button
          onClick={() => handleResendForm(student.id)}
          className="px-3 py-1.5 rounded bg-[#C4B568] text-white text-sm font-medium hover:bg-[#B5A659] transition-colors"
        >
          Reenviar formulário
        </button>
      );
    } else {
      return (
        <button
          onClick={() => handleRegisterForm(student.id)}
          className="px-3 py-1.5 rounded bg-[#df9494] text-white text-sm font-medium hover:bg-[#a25f5f] transition-colors"
        >
          Registrar formulário
        </button>
      );
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
        <Navbar onLogout={handleLogout} />
        <main className="flex flex-col items-center justify-center w-full max-w-[1200px] mx-auto px-4 mt-[60px] pb-20">
          <div className="text-[#3A3D5B] text-xl">Carregando alunos...</div>
        </main>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
        <Navbar onLogout={handleLogout} />
        <main className="flex flex-col items-center justify-center w-full max-w-[1200px] mx-auto px-4 mt-[60px] pb-20">
          <div className="text-red-600 text-xl">❌ Erro: {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#E65100] text-white rounded hover:bg-[#D14900] transition-colors"
          >
            Tentar novamente
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
      <Navbar onLogout={handleLogout} />
      
      <main className="flex flex-col w-full max-w-[1200px] mx-auto px-4 mt-[60px] pb-20">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <h1 className="text-[#E65100] text-[32px] font-bold">Alunos</h1>
          <button
            onClick={handleAddStudent}
            className="justify-center items-center rounded border bg-[#ECECEC] flex gap-2 text-base text-[#1D1D1D] font-medium px-4 py-3 border-solid border-[#E65100] hover:bg-[#E0E0E0] transition-colors"
          >
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/5e05b88d3d6520cb20e766e4459add3ab152172d?placeholderIfAbsent=true"
              alt="Add icon"
              className="w-6 h-6"
            />
            <span>Adicionar aluno</span>
          </button>
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {['All', '1', '2', '3', '4', '5'].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`min-w-[40px] px-4 py-2 rounded text-base font-medium transition-colors ${
                currentPage === page
                  ? 'bg-[#E65100] text-white'
                  : 'bg-white text-[#3A3D5B] border border-[#DEE2E6] hover:bg-[#FFD8C3]'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6C757D] w-5 h-5" />
          <Input
            type="text"
            placeholder="Pesquisar por nome"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-[#DEE2E6]"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-[10px] border border-[#DEE2E6] overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-6 py-3 bg-white border-b border-[#DEE2E6]">
            <div className="text-black text-base font-semibold">Nome</div>
            <div className="text-black text-base font-semibold">Status</div>
            <div className="text-black text-base font-semibold">Acesso</div>
            <div className="text-black text-base font-semibold">Histórico</div>
          </div>

          {/* Rows */}
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-6 py-4 bg-white border-b border-[#DEE2E6] hover:bg-[#F8F9FA] transition-colors items-center"
            >
              <div className="text-[#3A3D5B] text-base font-normal">
                {student.name}
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(student.status)}
              </div>
              <div>
                {getActionButton(student)}
              </div>
              <div>
                <button
                  onClick={() => {
                    // Se o aluno tem status 'active' (PEI disponível), vai para generate-class
                    // Senão, vai para history (formulários pendentes/em coleta)
                    const path = student.status === 'active' 
                      ? `/students/${student.id}/generate-class`
                      : `/students/${student.id}/history`;
                    navigate(path);
                  }}
                  className="p-2 rounded hover:bg-[#F8F9FA] transition-colors"
                  aria-label="Ver histórico"
                >
                  <img
                    src="https://api.builder.io/api/v1/image/assets/TEMP/6b5841e28d8f88cbff277e056ecfe69080541afc?placeholderIfAbsent=true"
                    alt="View history"
                    className="w-6 h-6"
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Students;
