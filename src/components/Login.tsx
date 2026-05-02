import React, { useState } from 'react';
import { loginWithGoogle } from '../lib/firebase';

export function Login() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setError(null);
      setIsLoading(true);
      await loginWithGoogle();
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        setError('Ocorreu um erro ao fazer login. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E11] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-[#F3BA2F] rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(243,186,47,0.3)]">
          <div className="w-8 h-8 bg-black rounded-sm transform rotate-45 flex items-center justify-center">
            <span className="text-xl text-[#F3BA2F] font-bold transform -rotate-45">B</span>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">KryptonStats</h1>
        <p className="text-[#848E9C] text-sm mb-10">Monitore sua carteira de criptomoedas em tempo real.</p>
        
        {error && (
          <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm rounded-lg w-full">
            {error}
          </div>
        )}

        <button 
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" className="w-5 h-5" />
          )}
          {isLoading ? 'Conectando...' : 'Entrar com a Conta Google'}
        </button>
      </div>
    </div>
  );
}
