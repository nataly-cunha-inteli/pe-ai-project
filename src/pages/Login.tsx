import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoLight from '../../docs/static/img/logo_light_mode.png';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const [isRegistering, setIsRegistering] = useState(false);

    // Campos comuns/login
    const [matricula, setMatricula] = useState('');
    const [password, setPassword] = useState('');

    // Campos de cadastro
    const [nome, setNome] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Feedback
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(false);
        if (isRegistering) {
            // Mock de cadastro
            if (!nome.trim() || !matricula.trim() || !password) {
                setError('Preencha todos os campos de cadastro.');
                return;
            }
            if (password.length < 6) {
                setError('A senha deve ter ao menos 6 caracteres.');
                return;
            }
            if (password !== confirmPassword) {
                setError('As senhas não coincidem.');
                return;
            }

            setLoading(true);
            // Simula chamada assíncrona
            setTimeout(() => {
                // Salva usuário no localStorage como mock (não seguro, apenas para demo)
                const users = JSON.parse(localStorage.getItem('peai_users') || '{}');
                if (users[matricula]) {
                    setError('Matrícula já cadastrada.');
                    setLoading(false);
                    return;
                }
                users[matricula] = { nome, password };
                localStorage.setItem('peai_users', JSON.stringify(users));

                setLoading(false);
                // Simula login imediato após cadastro
                navigate('/dashboard');
            }, 800);
        } else {
            // Mock de login
            if (!matricula.trim() || !password) {
                setError('Preencha matrícula e senha.');
                return;
            }

            setLoading(true);
            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem('peai_users') || '{}');
                const user = users[matricula];
                // Se não houver usuário mockado, permitir "login" qualquer (opcional) ou exigir cadastro
                if (!user || user.password !== password) {
                    // Para demo, permitimos login se matrícula for "admin" e senha "admin"
                    if (!(matricula === 'admin' && password === 'admin')) {
                        setError('Matrícula ou senha inválida.');
                        setLoading(false);
                        return;
                    }
                }

                setLoading(false);
                navigate('/dashboard');
            }, 600);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#F8F9FA] px-6">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center gap-3">
                        <img
                            src={logoLight}
                            alt="PE.AI"
                            className="w-32 h-28 object-contain"
                        />
                    </div>
                    <p className="mt-3 text-sm text-gray-500">
                        Sistema de Gestão de Planos Educacionais Individualizados
                    </p>
                </div>

                {/* Card de Login/Cadastro */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                        {isRegistering ? 'Criar Conta' : 'Entrar'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isRegistering && (
                            <div>
                                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
                                    Nome completo
                                </label>
                                <input
                                    id="nome"
                                    type="text"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    placeholder="Seu nome"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 transition"
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <label htmlFor="matricula" className="block text-sm font-medium text-gray-700 mb-2">
                                Número de matrícula
                            </label>
                            <input
                                id="matricula"
                                type="text"
                                value={matricula}
                                onChange={(e) => setMatricula(e.target.value)}
                                placeholder="Número de matrícula"
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 transition"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Senha
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 transition"
                                required
                            />
                        </div>

                        {isRegistering && (
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirmar senha
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 transition"
                                    required
                                />
                            </div>
                        )}

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <button
                            type="submit"
                            className="w-full bg-[#E96100] hover:bg-orange-600 text-white font-semibold py-2.5 rounded-md shadow-sm transition-colors disabled:opacity-60"
                            disabled={loading}
                        >
                            {loading ? 'Aguarde...' : isRegistering ? 'Cadastrar' : 'Confirmar'}
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        {isRegistering ? (
                            <p className="text-sm text-gray-600">
                                Já tem uma conta?{' '}
                                <button
                                    type="button"
                                    className="text-[#E96100] hover:text-orange-600 font-medium"
                                    onClick={() => {
                                        setIsRegistering(false);
                                        setError(null);
                                    }}
                                >
                                    Entrar
                                </button>
                            </p>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    className="text-sm text-[#E96100] hover:text-orange-600 font-medium"
                                    onClick={() => {
                                        setIsRegistering(true);
                                        setError(null);
                                    }}
                                >
                                    Criar conta
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <p className="mt-8 text-center text-xs text-gray-500">
                    © 2025 PE.AI - Todos os direitos reservados
                </p>
            </div>
        </div>
    );
};
