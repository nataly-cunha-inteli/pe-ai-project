import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
  userName?: string;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  userName = "Maria Silva", 
  onLogout 
}) => {
  const location = useLocation();
  
  return (
    <nav className="items-center self-stretch flex min-h-[83px] w-full gap-[40px_49px] flex-wrap bg-[#E75A00] pl-[51px] pr-[52px] py-[18px] max-md:max-w-full max-md:px-5">
      <div className="self-stretch flex min-w-60 items-center gap-8 grow shrink w-[888px] my-auto max-md:max-w-full">
        <Link to="/dashboard">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/5e4c789fa75d88c1cd75aee46ac320e7773c6994?placeholderIfAbsent=true"
            alt="Logo"
            className="aspect-[2.08] object-contain w-[100px] max-w-full hover:opacity-80 transition-opacity"
          />
        </Link>
        <div className="flex gap-6">
          <Link
            to="/dashboard"
            className={`text-white text-lg font-medium hover:text-[#FFD8C3] transition-colors ${
              location.pathname === '/dashboard' ? 'border-b-2 border-white' : ''
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/students"
            className={`text-white text-lg font-medium hover:text-[#FFD8C3] transition-colors ${
              location.pathname === '/students' ? 'border-b-2 border-white' : ''
            }`}
          >
            Alunos
          </Link>
          <Link
            to="/peis"
            className={`text-white text-lg font-medium hover:text-[#FFD8C3] transition-colors ${
              location.pathname === '/peis' ? 'border-b-2 border-white' : ''
            }`}
          >
            PEIs
          </Link>
          <Link
            to="/ai-processing"
            className={`text-white text-lg font-medium hover:text-[#FFD8C3] transition-colors ${
              location.pathname === '/ai-processing' ? 'border-b-2 border-white' : ''
            }`}
          >
            Processamento IA
          </Link>
        </div>
      </div>
      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/da80e9e03cbc6b2fda974e1fa04e962c380dea67?placeholderIfAbsent=true"
        alt="Notification"
        className="aspect-[1] object-contain w-[34px] self-stretch shrink-0 my-auto cursor-pointer hover:opacity-80 transition-opacity"
      />
      <div className="self-stretch flex gap-2.5 text-[25px] text-white font-medium leading-[1.2] my-auto">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/c837214d2f86370480846be85fe4f41a3ab509e2?placeholderIfAbsent=true"
          alt="User avatar"
          className="aspect-[1] object-contain w-[33px] shrink-0"
        />
        <span>{userName}</span>
      </div>
      <button 
        onClick={onLogout}
        className="self-stretch flex items-center gap-2.5 text-[25px] text-white font-medium whitespace-nowrap leading-[1.2] my-auto hover:opacity-80 transition-opacity"
      >
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/b7ddddd0438062a9545dee695cda1f6b4564243e?placeholderIfAbsent=true"
          alt="Logout icon"
          className="aspect-[1] object-contain w-6 self-stretch shrink-0 my-auto"
        />
        <span className="self-stretch my-auto">Sair</span>
      </button>
      <nav className="flex gap-6 items-center text-base font-medium">
        {/* TEMPORÁRIO - Para testes */}
        <Link
          to="/test-form"
          className="text-white hover:text-white hover:bg-[#C44800] transition-colors border-2 border-orange-400 px-3 py-1 rounded"
        >
          🧪 Testar Formulário
        </Link>
      </nav>
    </nav>
  );
};
