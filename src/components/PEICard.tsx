import React from 'react';
import { useNavigate } from 'react-router-dom';

interface PEICardProps {
  peiId?: string;
  studentName: string;
  year: string;
  status: string;
  statusColor: string;
  createdDate: string;
  studentIcon: string;
  onView?: () => void;
}

export const PEICard: React.FC<PEICardProps> = ({
  peiId = '1',
  studentName,
  year,
  status,
  statusColor,
  createdDate,
  studentIcon,
  onView
}) => {
  const navigate = useNavigate();

  const handleView = () => {
    if (onView) {
      onView();
    } else {
      navigate(`/pei/${peiId}`);
    }
  };

  return (
    <article className="border bg-white flex w-full max-w-[474px] flex-col items-stretch text-black font-normal mt-8 px-[41px] py-9 rounded-[10px] border-solid border-[#C4C4C4] max-md:max-w-full max-md:px-5 overflow-hidden">
      <header className="flex w-full items-stretch gap-5 justify-between max-md:mr-[3px]">
        <div className="flex items-stretch gap-3.5 text-lg min-w-0 flex-1">
          <img
            src={studentIcon}
            alt={`${studentName} avatar`}
            className="aspect-[0.96] object-contain w-[26px] shrink-0"
          />
          <h3 className="basis-auto my-auto truncate">{studentName}</h3>
        </div>
        <div className="text-xl shrink-0">{year}</div>
      </header>
      
      <div className="flex items-stretch gap-3 text-lg text-black mt-[23px]">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/82237a5678c3ae1e5c66ea2d4cc44b3efb2d0d60?placeholderIfAbsent=true"
          alt="Status icon"
          className="aspect-[0.96] object-contain w-[27px] shrink-0"
        />
        <div className="basis-auto grow shrink my-auto truncate">
          Status:{" "}
          <span style={{ fontWeight: 700, color: statusColor }}>
            {status}
          </span>
        </div>
      </div>
      
      <div className="flex items-stretch gap-3.5 text-lg mt-[23px]">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/919b6529f13a4ae1a7ff912b91632136dc6fc1f9?placeholderIfAbsent=true"
          alt="Calendar icon"
          className="aspect-[1] object-contain w-[26px] shrink-0"
        />
        <div className="basis-auto">Criado em: {createdDate}</div>
      </div>
      
      <button
        onClick={handleView}
        className="justify-center items-center rounded flex min-h-9 gap-[-15px] text-sm text-[#1D1D1D] font-medium whitespace-nowrap text-center leading-[1.2] bg-[#FFD8C3] mt-[22px] pl-[21px] py-2.5 hover:bg-[#FFB899] transition-colors max-md:pl-5"
      >
        <span className="text-[#1D1D1D] self-stretch w-[111px] my-auto">
          Visualizar
        </span>
      </button>
    </article>
  );
};
