import React from 'react';

interface MetricCardProps {
  icon: string;
  label: string;
  value: number;
  iconAlt?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  icon, 
  label, 
  value, 
  iconAlt = label 
}) => {
  return (
    <article className="min-w-[200px] border bg-[#FBFBFB] self-stretch min-h-[101px] w-[225px] gap-2 my-auto p-6 rounded-[10px] border-solid border-[#DEE2E6] max-md:px-5">
      <div className="relative flex w-full flex-col">
        <div className="z-0 flex w-[108px] max-w-full items-center gap-3 text-base text-black font-normal">
          <img
            src={icon}
            alt={iconAlt}
            className="aspect-[1] object-contain w-6 self-stretch shrink-0 my-auto"
          />
          <span className="self-stretch my-auto">{label}</span>
        </div>
        <div className="text-black text-[27px] font-black absolute z-0 bottom-[-39px] w-8 h-8 left-0">
          {value}
        </div>
      </div>
    </article>
  );
};
