import React, { useState, useCallback } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AssetStats, Transaction } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { BrainCircuit, ShieldAlert, Cpu, Loader2, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  stats: AssetStats[];
  transactions: Transaction[];
}

export function KryptonAdvisor({ stats, transactions }: Props) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAIInsight = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      // Limpa a chave para evitar espaços invisíveis
      const rawKey = import.meta.env.VITE_GEMINI_API_KEY;
      const apiKey = typeof rawKey === 'string' ? rawKey.trim() : null;

      if (!apiKey) {
        throw new Error('Chave da IA não encontrada. No Vercel, adicione VITE_GEMINI_API_KEY nas Environment Variables e faça Redeploy.');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Tentativa de estratégia: Gemini 1.5 Flash é o mais estável para cotas gratuitas
      // Usamos a versão 'v1' explicitamente para evitar problemas de compatibilidade
      let text = "";
      let lastError: any = null;

      const modelsToTry = [
        { name: "gemini-1.5-flash", version: "v1" },
        { name: "gemini-2.0-flash", version: "v1beta" }, // Fallback para o que você usou antes
        { name: "gemini-1.5-flash-8b", version: "v1" }
      ];

      for (const modelConfig of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel(
            { model: modelConfig.name },
            { apiVersion: modelConfig.version as any }
          );
          
          const portfolioContext = stats.map(s => (
            `- ${s.asset}: Qtd: ${s.totalQuantity.toFixed(8)}, Preço Médio: R$ ${s.averagePrice.toLocaleString('pt-BR')}, Valor Atual: R$ ${s.currentValue.toLocaleString('pt-BR')}, Lucro/Prejuízo: ${s.profitOrLossPercent.toFixed(2)}%`
          )).join('\n');

          const prompt = `
            Aja como Krypton Advisor. Analise este portfólio curto e direto:
            ${portfolioContext}
            Diga se é Oportunidade, Hold ou Alerta. Máximo 100 palavras. Responda em Português.
          `;

          const result = await model.generateContent(prompt);
          text = result.response.text();
          if (text) break;
        } catch (err: any) {
          lastError = err;
          console.warn(`Tentativa com ${modelConfig.name} falhou:`, err.message);
          continue;
        }
      }

      if (text) {
        setInsight(text);
      } else {
        throw lastError || new Error('Não foi possível gerar uma análise no momento.');
      }
    } catch (err: any) {
      console.error('Advisor Error:', err);
      const errorMessage = err.message || '';
      
      if (errorMessage.includes('429')) {
        setError('Limite de Cota Excedido (429): Suas requisições gratuitas acabaram por hoje no Google AI Studio. Tente novamente mais tarde.');
      } else if (errorMessage.includes('403') || errorMessage.includes('PERMISSION_DENIED')) {
        setError('Erro de Permissão (403): Sua chave de API pode ter restrições ou seu projeto não tem acesso a modelos generativos no momento.');
      } else if (errorMessage.includes('404')) {
        setError('Modelos Incompatíveis (404): Nenhum modelo Gemini foi encontrado para esta chave. Verifique se o projeto no AI Studio está ativo.');
      } else {
        setError(errorMessage || 'Falha ao conectar com o Advisor.');
      }
    } finally {
      setLoading(false);
    }
  }, [stats, transactions, loading]);

  return (
    <div className="bg-[#181A20] rounded-xl border border-[#2B2F36] overflow-hidden shadow-2xl flex flex-col h-full min-h-[400px]">
      <div className="p-5 border-b border-[#2B2F36] flex items-center justify-between bg-gradient-to-r from-[#181A20] via-[#1E2329] to-[#181A20]">
        <div className="flex items-center gap-3">
          <div className="bg-[#F3BA2F]/10 p-2 rounded-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-[#F3BA2F]/5 animate-pulse"></div>
            <BrainCircuit className="w-5 h-5 text-[#F3BA2F] relative z-10" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Krypton Advisor</h3>
            <p className="text-[10px] text-[#F3BA2F] font-bold uppercase tracking-tighter opacity-80">AI Insight Engine</p>
          </div>
        </div>
        <button
          onClick={getAIInsight}
          disabled={loading}
          className="bg-[#2B2F36] hover:bg-[#F3BA2F] hover:text-black disabled:opacity-50 text-[#F3BA2F] p-2 rounded-lg transition-all border border-[#F3BA2F]/20 hover:border-[#F3BA2F] active:scale-95 group shadow-lg"
          title="Atualizar análise"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
          )}
        </button>
      </div>

      <div className="p-6 flex-1 flex flex-col relative overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          {!insight && !loading && !error && (
            <motion.div
              key="initial"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="m-auto text-center"
            >
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <Sparkles className="w-12 h-12 text-[#F3BA2F]/20 animate-pulse" />
                  <Cpu className="w-6 h-6 text-[#F3BA2F]/40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
              </div>
              <p className="text-[#848E9C] text-sm max-w-[220px] mx-auto leading-relaxed font-medium">
                Clique no botão acima para que a nossa IA analise seu portfólio e sugira estratégias personalizadas.
              </p>
              <div className="mt-8 flex justify-center gap-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#2B2F36]"></div>
                ))}
              </div>
            </motion.div>
          )}

          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="m-auto flex flex-col items-center gap-6 py-8"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-[#F3BA2F]/10 border-t-[#F3BA2F] animate-spin"></div>
                <BrainCircuit className="w-8 h-8 text-[#F3BA2F] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <div className="space-y-2 text-center">
                <p className="text-xs font-black text-[#F3BA2F] tracking-[0.2em] uppercase">Computando Contexto</p>
                <div className="flex gap-1 justify-center">
                  <div className="w-1 h-1 bg-[#F3BA2F] animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1 h-1 bg-[#F3BA2F] animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1 h-1 bg-[#F3BA2F] animate-bounce"></div>
                </div>
              </div>
            </motion.div>
          )}

          {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="m-auto flex flex-col items-center gap-4 bg-rose-500/5 border border-rose-500/20 p-6 rounded-xl text-center max-w-[280px]"
              >
                <div className="bg-rose-500/20 p-3 rounded-full">
                  <ShieldAlert className="w-8 h-8 text-rose-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-rose-200 mb-1">Ops! Ocorreu um erro</p>
                  <p className="text-xs text-rose-500/70">{error}</p>
                </div>
                <button 
                  onClick={getAIInsight}
                  className="mt-2 text-xs font-bold text-rose-500 hover:underline"
                >
                  Tentar novamente
                </button>
              </motion.div>
          )}

          {insight && !loading && (
            <motion.div
              key="insight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col"
            >
              <div className="markdown-body">
                <ReactMarkdown 
                  components={{
                    p: ({children}) => <p className="text-[#EAECEF] text-sm leading-relaxed mb-4 font-medium">{children}</p>,
                    strong: ({children}) => <strong className="text-[#F3BA2F] font-bold">{children}</strong>,
                    ul: ({children}) => <ul className="space-y-3 mb-4">{children}</ul>,
                    li: ({children}) => (
                      <li className="flex gap-3 text-sm text-[#EAECEF] leading-snug">
                        <span className="text-[#F3BA2F] mt-1 shrink-0">●</span>
                        <span>{children}</span>
                      </li>
                    ),
                  }}
                >
                  {insight}
                </ReactMarkdown>
              </div>
              
              <div className="mt-8 pt-6 border-t border-[#2B2F36] flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#0ECB81] shadow-[0_0_8px_#0ECB81]"></div>
                    <span className="text-[10px] text-[#848E9C] font-black uppercase tracking-widest">Estratégia Validada</span>
                 </div>
                 <div className="flex items-center gap-1.5 opacity-60">
                    <TrendingUp className="w-3 h-3 text-[#0ECB81]" />
                    <span className="text-[9px] text-white font-mono font-bold italic">Krypton-AI v1</span>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
