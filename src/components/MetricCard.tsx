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
  iconAlt = label,
}) => {
  return (
    <article className="min-w-[200px] border bg-[#FBFBFB] self-stretch min-h-[101px] w-[225px] gap-2 my-auto p-6 rounded-[10px] border-solid border-[#DEE2E6] max-md:px-5 overflow-hidden">
      <div className="flex flex-col justify-between h-full w-full">
        <div className="flex items-center gap-3 text-base text-black font-normal max-w-full">
          <img
            src={icon}
            alt={iconAlt}
            className="aspect-[1] object-contain w-6 self-stretch shrink-0 my-auto"
          />
          <span className="self-stretch my-auto truncate max-w-[calc(100%-36px)]">{label}</span>
        </div>

        <div className="text-black text-[27px] font-black mt-4 break-words truncate">
          {value}
        </div>
      </div>
    </article>
  );
};
