import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
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
      const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Chave da IA não encontrada. No Vercel, adicione VITE_GEMINI_API_KEY nas Environment Variables (em maiúsculo) e faça Redeply.');
      }

      const ai = new GoogleGenAI({ apiKey });
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const portfolioContext = stats.map(s => (
        `- ${s.asset}: Qtd: ${s.totalQuantity.toFixed(8)}, Preço Médio: R$ ${s.averagePrice.toLocaleString('pt-BR')}, Valor Atual: R$ ${s.currentValue.toLocaleString('pt-BR')}, Lucro/Prejuízo: ${s.profitOrLossPercent.toFixed(2)}%`
      )).join('\n');

      const recentHistory = transactions.slice(-10).map(t => (
        `- ${new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}: ${t.type} de ${t.quantity.toFixed(8)} ${t.asset} a R$ ${t.quotation.toLocaleString('pt-BR')}`
      )).join('\n');

      const prompt = `
        Aja como o "Krypton Advisor", um consultor financeiro de elite especializado em Cripto (BTC e USDC).
        
        DADOS DE MERCADO E USUÁRIO EM TEMPO REAL:
        ${portfolioContext}

        HISTÓRICO RECENTE:
        ${recentHistory}

        SUA MISSÃO:
        1. ANALISAR OPORTUNIDADE: Compare o "Valor Atual" (preço de mercado agora) com o "Preço Médio" do usuário.
        2. SINALIZAR: 
           - Se o Valor Atual estiver significativamente ABAIXO do Preço Médio: Sugira se é uma "Oportunidade de Compra" para reduzir o PM (DCA).
           - Se o Valor Atual estiver significativamente ACIMA do Preço Médio: Analise se é hora de "Realizar Lucro" parcial.
           - Se estiver equilibrado: Sugira "Manter (Hold)".
        3. ESTRATÉGIA DE ATIVO: Diferencie a estratégia para BTC (acumulação de valor) vs USDC (reserva de valor/estabilidade).
        4. SENTIMENTO: Com base nos preços atuais, dê um breve parecer se o momento de mercado parece "Esticado" (caro) ou "Sobre-vendido" (barato).

        REGRAS DE FORMATAÇÃO:
        - Use títulos curtos em negrito.
        - Seja direto: "Oportunidade Detectada" ou "Momento de Cautela".
        - Responda em Português do Brasil.
        - Máximo 130 palavras.
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      if (text) {
        setInsight(text);
      } else {
        throw new Error('Não foi possível gerar uma análise no momento.');
      }
    } catch (err: any) {
      console.error('Advisor Error:', err);
      if (err.message?.includes('403') || err.message?.includes('PERMISSION_DENIED')) {
        setError('Erro de Permissão (403): Verifique se a Generative Language API está ativa no Google AI Studio e se a chave não tem restrições de IP/Referer.');
      } else {
        setError(err.message || 'Falha ao conectar com o Advisor.');
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
