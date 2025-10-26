import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowsClockwise, XCircle } from '@phosphor-icons/react';
import { getStudents, type Student } from '@/services/api';

interface StudentTableProps {
  onGenerateClass?: (studentId: string) => void;
  onViewHistory?: (studentId: string) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  onGenerateClass,
  onViewHistory
}) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch students from API
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getStudents();
        // Limit to first 3 students for dashboard preview
        setStudents(data.slice(0, 3));
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
      console.log(`Cannot generate class for student ${studentId} with status ${student?.status}`);
    }
  };

  const handleViewHistory = (studentId: string) => {
    navigate(`/students/${studentId}/history`);
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
        <button
          onClick={() => handleGenerateClass(student.id)}
          className="px-3 py-1.5 rounded bg-[#89d496] text-white text-sm font-medium hover:bg-[#67a070] transition-colors"
        >
          Gerar aula
        </button>
      );
    } else if (student.status === 'resend_form') {
      return (
        <button
          onClick={() => handleViewHistory(student.id)}
          className="px-3 py-1.5 rounded bg-[#C4B568] text-white text-sm font-medium hover:bg-[#B5A659] transition-colors"
        >
          Reenviar formulário
        </button>
      );
    } else {
      return (
        <button
          onClick={() => navigate('/pei/create')}
          className="px-3 py-1.5 rounded bg-[#df9494] text-white text-sm font-medium hover:bg-[#a25f5f] transition-colors"
        >
          Registrar formulário
        </button>
      );
    }
  };

  // Loading state
  if (loading) {
    return (
      <section className="self-stretch mt-[55px] max-md:max-w-full max-md:mt-10">
        <div className="text-[#3A3D5B] text-center py-8">Carregando alunos...</div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="self-stretch mt-[55px] max-md:max-w-full max-md:mt-10">
        <div className="text-red-600 text-center py-8">❌ Erro: {error}</div>
      </section>
    );
  }

  return (
    <section className="self-stretch mt-[55px] max-md:max-w-full max-md:mt-10">
      {/* Table */}
      <div className="bg-white rounded-[10px] border border-[#DEE2E6] overflow-hidden max-w-[500px]">
        {/* Header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-6 py-3 bg-white border-b border-[#DEE2E6]">
          <div className="text-black text-base font-semibold">Nome</div>
          <div className="text-black text-base font-semibold">Status</div>
          <div className="text-black text-base font-semibold">Acesso</div>
          <div className="text-black text-base font-semibold">Histórico</div>
        </div>

        {/* Rows */}
        {students.map((student) => (
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
                onClick={() => handleViewHistory(student.id)}
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
    </section>
  );
};
