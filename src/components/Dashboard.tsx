import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { MetricCard } from './MetricCard';
import { PEICard } from './PEICard';
import { StudentTable } from './StudentTable';
import { getAllPEIs, getStudent, type PEI, type Student } from '@/services/api';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [peis, setPeis] = useState<PEI[]>([]);
  const [students, setStudents] = useState<{ [key: string]: Student }>({});
  const [loading, setLoading] = useState(true);

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

  const handleCreateNewPEI = () => {
    navigate('/pei/create');
  };

  const handleLogout = () => {
    console.log('Logging out...');
  };

  const handleViewAllRecent = () => {
    navigate('/peis');
  };

  const handleViewAllStudents = () => {
    navigate('/students');
  };

  // Calculate metrics from real data
  const metrics = [
    {
      icon: "https://api.builder.io/api/v1/image/assets/TEMP/87d67f026b13eed3fe8610b182833e15477cb4fd?placeholderIfAbsent=true",
      label: "Em coleta",
      value: peis.filter(p => p.status === 'in_collection').length
    },
    {
      icon: "https://api.builder.io/api/v1/image/assets/TEMP/455affb69318e24e0398065dca6b256b8fd047f0?placeholderIfAbsent=true",
      label: "Em revisão",
      value: peis.filter(p => p.status === 'in_review').length
    },
    {
      icon: "https://api.builder.io/api/v1/image/assets/TEMP/c843d992c24c8320b9efed8de3f3376d4a834539?placeholderIfAbsent=true",
      label: "Validados",
      value: peis.filter(p => p.status === 'concluido').length
    },
    {
      icon: "https://api.builder.io/api/v1/image/assets/TEMP/ad8e27abdc63bcbf3b630f28b45edede767bfa75?placeholderIfAbsent=true",
      label: "Expirados",
      value: peis.filter(p => p.status === 'expired').length
    }
  ];

  // Get status label and color
  const getStatusInfo = (pei: PEI) => {
    const professionalCount = pei.professionals?.length || 0;
    const completedCount = 0; // TODO: track completed responses
    
    switch (pei.status) {
      case 'in_collection':
        return {
          label: `Em coleta (${completedCount}/${professionalCount} respostas)`,
          color: "rgba(159,141,70,1)"
        };
      case 'in_review':
        return {
          label: "Em revisão",
          color: "rgba(234,179,8,1)"
        };
      case 'completed':
        return {
          label: "Processado pela IA",
          color: "rgba(7,157,97,1)"
        };
      case 'concluido':
        return {
          label: "Concluído",
          color: "rgba(7,157,97,1)"
        };
      default:
        return {
          label: "Em desenvolvimento",
          color: "rgba(108,117,125,1)"
        };
    }
  };

  // Map PEIs to display format (show max 3 recent)
  const recentPEIs = peis.slice(0, 3).map(pei => {
    const student = students[pei.student_id];
    const statusInfo = getStatusInfo(pei);
    
    return {
      peiId: pei.id,
      studentName: student?.name || 'Carregando...',
      year: "1º ano", // TODO: get from student data
      status: statusInfo.label,
      statusColor: statusInfo.color,
      createdDate: new Date(pei.created_at).toLocaleDateString('pt-BR'),
      studentIcon: "https://api.builder.io/api/v1/image/assets/TEMP/9d0e62563ac351c3cab23e1c917b9c1f6b20f1c3?placeholderIfAbsent=true"
    };
  });

  return (
    <div className="flex flex-col overflow-hidden items-center bg-[#F8F9FA] pb-[191px] max-md:pb-[100px]">
      <Navbar onLogout={handleLogout} />
      
      <main className="flex w-[972px] max-w-full gap-[40px_100px] justify-between flex-wrap mt-[120px] max-md:mt-10">
        <h1 className="text-[#E65100] text-[32px] font-bold">
          Visão geral
        </h1>
        <button
          onClick={handleCreateNewPEI}
          className="justify-center items-center rounded border bg-[#ECECEC] flex gap-[5px] text-base text-[#1D1D1D] font-medium text-center leading-[1.2] w-[172px] px-4 py-3 border-solid border-[#E65100] hover:bg-[#E0E0E0] transition-colors"
        >
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/5e05b88d3d6520cb20e766e4459add3ab152172d?placeholderIfAbsent=true"
            alt="Add icon"
            className="aspect-[1] object-contain w-6 self-stretch shrink-0 my-auto"
          />
          <span className="text-[#1D1D1D] self-stretch w-[111px] my-auto">
            Criar novo PEI
          </span>
        </button>
      </main>

      <section className="flex w-full max-w-[986px] flex-col mt-[37px] max-md:max-w-full">
        <div className="flex items-center gap-6 flex-wrap max-md:max-w-full">
          {metrics.map((metric, index) => (
            <MetricCard
              key={index}
              icon={metric.icon}
              label={metric.label}
              value={metric.value}
            />
          ))}
        </div>
      </section>

      <div className="flex w-full max-w-[1055px] items-start gap-5 flex-wrap justify-between mt-[58px] max-md:max-w-full max-md:mt-10">
        <section className="max-md:max-w-full">
          <header className="flex w-full items-stretch gap-5 justify-between max-md:max-w-full">
            <h2 className="text-black text-[28px] font-normal">
              PEI's recentes
            </h2>
            <button
              onClick={handleViewAllRecent}
              className="justify-center items-center rounded flex min-h-8 text-xl text-[#1D1D1D] font-medium text-center leading-[1.2] bg-[#FFD8C3] pl-[11px] pr-2.5 pt-1 pb-[11px] hover:bg-[#FFB899] transition-colors"
            >
              <span className="text-[#1D1D1D] self-stretch w-[97px] my-auto">
                Ver tudo
              </span>
            </button>
          </header>
          
          <div className="border w-[474px] shrink-0 max-w-full h-px bg-[#C4C4C4] mt-7 border-[rgba(196,196,196,1)] border-solid" />
          
          <div className="mt-[55px] max-md:mt-10">
            {recentPEIs.map((pei, index) => (
              <PEICard
                key={index}
                peiId={pei.peiId}
                studentName={pei.studentName}
                year={pei.year}
                status={pei.status}
                statusColor={pei.statusColor}
                createdDate={pei.createdDate}
                studentIcon={pei.studentIcon}
              />
            ))}
          </div>
        </section>

        <div className="border w-px shrink-0 h-[1003px] bg-[#C4C4C4] border-[rgba(196,196,196,1)] border-solid" />

        <section className="flex flex-col max-md:max-w-full">
          <header className="flex w-[473px] max-w-full items-stretch gap-5 justify-between">
            <h2 className="text-black text-[28px] font-normal">
              Status por aluno
            </h2>
            <button
              onClick={handleViewAllStudents}
              className="justify-center items-center rounded flex min-h-8 text-xl text-[#1D1D1D] font-medium text-center leading-[1.2] bg-[#FFD8C3] pl-[11px] pr-2.5 pt-1 pb-[11px] hover:bg-[#FFB899] transition-colors"
            >
              <span className="text-[#1D1D1D] self-stretch w-[97px] my-auto">
                Ver tudo
              </span>
            </button>
          </header>
          
          <div className="border w-[474px] shrink-0 max-w-full h-px bg-[#C4C4C4] mt-7 border-[rgba(196,196,196,1)] border-solid" />
          
          <StudentTable />
        </section>
      </div>
    </div>
  );
};
