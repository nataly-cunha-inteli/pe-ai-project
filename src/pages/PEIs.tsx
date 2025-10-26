import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, Download, RefreshCw, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { getAllPEIs, getStudent, type PEI, type Student } from '@/services/api';

const PEIs = () => {
  const navigate = useNavigate();
  const [peis, setPeis] = useState<PEI[]>([]);
  const [students, setStudents] = useState<{ [key: string]: Student }>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const peisData = await getAllPEIs();
        setPeis(peisData);

        // Fetch student data for each PEI
        const studentPromises = peisData.map(pei => 
          getStudent(pei.student_id).catch(() => null)
        );
        const studentsData = await Promise.all(studentPromises);
        
        const studentsMap: { [key: string]: Student } = {};
        studentsData.forEach((student, index) => {
          if (student) {
            studentsMap[peisData[index].student_id] = student;
          }
        });
        setStudents(studentsMap);
      } catch (error) {
        console.error('Error fetching PEIs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    console.log('Logging out...');
  };

  const handleViewPEI = (peiId: string) => {
    navigate(`/pei/${peiId}`);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Completo',
          color: 'bg-[#D4EDDA] text-[#155724]',
          icon: CheckCircle
        };
      case 'in_review':
        return {
          label: 'Em revisão',
          color: 'bg-[#FFF3CD] text-[#856404]',
          icon: Clock
        };
      case 'in_collection':
        return {
          label: 'Em coleta',
          color: 'bg-[#FFF4E6] text-[#9F8D46]',
          icon: RefreshCw
        };
      case 'expired':
        return {
          label: 'Expirado',
          color: 'bg-[#F8D7DA] text-[#721C24]',
          icon: AlertCircle
        };
      case 'concluido':
        return {
          label: 'Concluído',
          color: 'bg-[#D4EDDA] text-[#155724]',
          icon: CheckCircle
        };
      default:
        return {
          label: 'Em desenvolvimento',
          color: 'bg-[#F8F9FA] text-[#6C757D]',
          icon: Clock
        };
    }
  };

  // Filter PEIs
  const filteredPEIs = peis.filter(pei => {
    const student = students[pei.student_id];
    const matchesSearch = student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pei.special_needs?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || pei.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: peis.length,
    completed: peis.filter(p => p.status === 'completed').length,
    in_review: peis.filter(p => p.status === 'in_review').length,
    in_collection: peis.filter(p => p.status === 'in_collection').length,
    expired: peis.filter(p => p.status === 'expired').length,
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
        <Navbar onLogout={handleLogout} />
        <main className="flex flex-col items-center justify-center w-full max-w-[1200px] mx-auto px-4 mt-[60px] pb-20">
          <div className="text-[#3A3D5B] text-xl">Carregando PEIs...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
      <Navbar onLogout={handleLogout} />
      
      <main className="flex flex-col w-full max-w-[1200px] mx-auto px-4 mt-[60px] pb-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[#E65100] text-[32px] font-bold mb-2">
            Planos Educacionais Individualizados
          </h1>
          <p className="text-[#3A3D5B] text-base">
            Gerencie todos os PEIs dos alunos da instituição
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-[10px] border border-[#DEE2E6] p-4">
            <div className="text-[#3A3D5B] text-sm mb-1">Total</div>
            <div className="text-[#E65100] text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-white rounded-[10px] border border-[#DEE2E6] p-4">
            <div className="text-[#3A3D5B] text-sm mb-1">Em coleta</div>
            <div className="text-[#9F8D46] text-2xl font-bold">{stats.in_collection}</div>
          </div>
          <div className="bg-white rounded-[10px] border border-[#DEE2E6] p-4">
            <div className="text-[#3A3D5B] text-sm mb-1">Em revisão</div>
            <div className="text-[#856404] text-2xl font-bold">{stats.in_review}</div>
          </div>
          <div className="bg-white rounded-[10px] border border-[#DEE2E6] p-4">
            <div className="text-[#3A3D5B] text-sm mb-1">Completos</div>
            <div className="text-[#155724] text-2xl font-bold">{stats.completed}</div>
          </div>
          <div className="bg-white rounded-[10px] border border-[#DEE2E6] p-4">
            <div className="text-[#3A3D5B] text-sm mb-1">Expirados</div>
            <div className="text-[#721C24] text-2xl font-bold">{stats.expired}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-[10px] border border-[#DEE2E6] p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6C757D]" />
              <Input
                type="text"
                placeholder="Buscar por aluno ou NEE..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-[#DEE2E6] rounded-md bg-white text-[#3A3D5B] min-w-[200px]"
            >
              <option value="all">Todos os status</option>
              <option value="in_collection">Em coleta</option>
              <option value="in_review">Em revisão</option>
              <option value="completed">Completos</option>
              <option value="expired">Expirados</option>
            </select>
          </div>
        </div>

        {/* PEIs Table */}
        <div className="bg-white rounded-[10px] border border-[#DEE2E6] overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[2fr_2fr_1.5fr_1.5fr_120px] gap-4 px-6 py-3 bg-[#F8F9FA] border-b border-[#DEE2E6]">
            <div className="text-[#3A3D5B] text-sm font-semibold">Aluno</div>
            <div className="text-[#3A3D5B] text-sm font-semibold">NEE</div>
            <div className="text-[#3A3D5B] text-sm font-semibold">Status</div>
            <div className="text-[#3A3D5B] text-sm font-semibold">Data de Criação</div>
            <div className="text-[#3A3D5B] text-sm font-semibold text-center">Ações</div>
          </div>

          {/* Rows */}
          {filteredPEIs.length === 0 ? (
            <div className="px-6 py-12 text-center text-[#6C757D]">
              {searchTerm || statusFilter !== 'all' 
                ? 'Nenhum PEI encontrado com os filtros aplicados.'
                : 'Nenhum PEI cadastrado ainda.'}
            </div>
          ) : (
            filteredPEIs.map((pei) => {
              const student = students[pei.student_id];
              const statusInfo = getStatusInfo(pei.status);
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={pei.id}
                  className="grid grid-cols-[2fr_2fr_1.5fr_1.5fr_120px] gap-4 px-6 py-4 border-b border-[#DEE2E6] hover:bg-[#F8F9FA] transition-colors items-center"
                >
                  {/* Student Name */}
                  <div className="text-[#3A3D5B] font-medium">
                    {student?.name || 'Carregando...'}
                  </div>

                  {/* Special Needs */}
                  <div className="text-[#3A3D5B] text-sm">
                    {pei.special_needs || 'Não especificado'}
                  </div>

                  {/* Status */}
                  <div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded ${statusInfo.color}`}>
                      <StatusIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">{statusInfo.label}</span>
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className="text-[#3A3D5B] text-sm">
                    {new Date(pei.created_at).toLocaleDateString('pt-BR')}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={() => handleViewPEI(pei.id)}
                      variant="ghost"
                      size="sm"
                      className="text-[#3A3D5B] hover:text-[#E65100]"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => console.log('Download PEI:', pei.id)}
                      variant="ghost"
                      size="sm"
                      className="text-[#3A3D5B] hover:text-[#E65100]"
                      disabled={pei.status !== 'completed'}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Results count */}
        {filteredPEIs.length > 0 && (
          <div className="mt-4 text-[#6C757D] text-sm text-center">
            Mostrando {filteredPEIs.length} de {peis.length} PEI{peis.length !== 1 ? 's' : ''}
          </div>
        )}
      </main>
    </div>
  );
};

export default PEIs;
