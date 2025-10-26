import { CheckCircle } from '@phosphor-icons/react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function FormSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-white" weight="fill" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Respostas Enviadas com Sucesso!</h1>
          <p className="text-lg text-gray-600">
            Muito obrigado pela sua contribuição valiosa para o desenvolvimento do aluno.
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-3">O que acontece agora?</h2>
          <ul className="text-left space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" weight="fill" />
              <span>Suas respostas foram registradas no sistema</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" weight="fill" />
              <span>Quando todos os profissionais responderem, nossa IA processará automaticamente as informações</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" weight="fill" />
              <span>O PEI será gerado em poucos minutos e encaminhado para revisão</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" weight="fill" />
              <span>Você receberá uma notificação quando o PEI estiver pronto</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Caso tenha dúvidas ou precise fazer alguma alteração, entre em contato conosco.
          </p>
          <Button
            onClick={() => navigate('/')}
            className="bg-[#FF6B35] hover:bg-[#E55A2B]"
          >
            Voltar para a Página Inicial
          </Button>
        </div>
      </div>
    </div>
  );
}
