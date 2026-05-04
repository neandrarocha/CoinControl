import React, { useState, useCallback } from 'react';
import { AssetStats, Transaction } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { BrainCircuit, ShieldAlert, Cpu, Loader2, RefreshCw, Sparkles, TrendingUp, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  stats: AssetStats[];
  transactions: Transaction[];
}

export function KryptonAdvisor({ stats, transactions }: Props) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocalInsight = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Simulamos um pequeno processamento para dar "feeling" de análise
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const btc = stats.find(s => s.asset === 'BTC');
      const usdc = stats.find(s => s.asset === 'USDC');
      const totalValue = stats.reduce((acc, curr) => acc + curr.currentValue, 0);

      let report = "### 🧠 Krypton Core Analytics\n\n";

      // 1. Análise de Exposição e Risco
      if (totalValue > 0) {
        const btcWeight = btc ? (btc.currentValue / totalValue) * 100 : 0;
        const usdcWeight = usdc ? (usdc.currentValue / totalValue) * 100 : 0;

        report += `**Visão de Portfólio:** Você possui uma exposição de **${btcWeight.toFixed(1)}%** em ativos voláteis e **${usdcWeight.toFixed(1)}%** em reservas de liquidez.\n\n`;

        // 2. Análise Específica: BTC
        if (btc) {
          const pnl = btc.profitOrLossPercent;
          report += `#### ₿ Análise Bitcoin:\n`;
          
          if (pnl < -15) {
            report += `- **Status: Oportunidade Extrema.** Seu prejuízo de ${pnl.toFixed(2)}% indica que o preço de mercado está muito abaixo do seu custo médio. **Sugestão: COMPRAR MAIS (DCA AGRESSIVO)** para reduzir drasticamente o preço médio.\n`;
          } else if (pnl < -5) {
            report += `- **Status: Oportunidade de Entrada.** Com queda de ${pnl.toFixed(2)}%, o ativo está em zona de desconto. **Sugestão: COMPRAR FRACIONADO (DCA)**.\n`;
          } else if (pnl >= -5 && pnl <= 5) {
            report += `- **Status: Zona de Equilíbrio.** Preço próximo ao seu custo médio. **Sugestão: MANTER (HOLD)**. Não há necessidade de movimentos bruscos agora.\n`;
          } else if (pnl > 5 && pnl <= 15) {
            report += `- **Status: Lucro Moderado.** Ganhos de ${pnl.toFixed(2)}%. **Sugestão: MANTER/OBSERVAR**. Prepare-se para realizar parte caso atinja 20%.\n`;
          } else if (pnl > 15) {
            report += `- **Status: Lucro Elevado.** Você está com ${pnl.toFixed(2)}% de ganho. **Sugestão: VENDER PARCIAL (Take Profit)**. Considere converter 20% da posição em USDC para garantir o lucro.\n`;
          }
          report += '\n';
        }

        // 3. Análise de Liquidez: USDC
        if (usdc) {
          report += `#### 💵 Gestão de Caixa:\n`;
          const cashRatio = (usdc.currentValue / totalValue);
          
          if (cashRatio < 0.10) {
            report += `- **Alerta de Liquidez:** Sua reserva é baixa (${(cashRatio * 100).toFixed(1)}%). Se o mercado cair, você não terá fôlego para comprar o mergulho. Considere aumentar essa reserva.\n`;
          } else if (cashRatio >= 0.10 && cashRatio <= 0.30) {
            report += `- **Reserva Saudável:** Você tem ${(cashRatio * 100).toFixed(1)}% em caixa. Está bem posicionado para oportunidades pontuais.\n`;
          } else {
            report += `- **Alta Liquidez:** Com ${(cashRatio * 100).toFixed(1)}% em USDC, sua segurança é alta, mas seu custo de oportunidade aumenta se o BTC explodir. Considere aportes graduais se o BTC recuar.\n`;
          }
          report += '\n';
        }

        // 4. Veredito Final
        report += `--- \n`;
        if (btc && usdc) {
          if (btc.profitOrLossPercent < -10 && usdc.currentValue > 0) {
            report += `**💡 Insight Estratégico:** O "Buy the Dip" perfeito está desenhado. Você tem prejuízo no BTC e tem caixa (USDC). É hora de agir com sabedoria.`;
          } else if (btc.profitOrLossPercent > 20 && usdc.currentValue / totalValue < 0.1) {
            report += `**💡 Insight Estratégico:** Não seja ganancioso. O lucro de ${btc.profitOrLossPercent.toFixed(0)}% está no ponto para reforçar sua reserva de USDC.`;
          } else {
            report += `**💡 Insight Estratégico:** Mantenha a disciplina. Seu portfólio está seguindo uma gestão orgânica estável.`;
          }
        }
      } else {
        report += "Portfólio vazio. Adicione transações para receber uma análise estratégica.";
      }

      setInsight(report);
    } catch (err: any) {
      setError("Falha ao processar análise local.");
    } finally {
      setLoading(false);
    }
  }, [stats]);

  return (
    <div className="bg-[#181A20] rounded-xl border border-[#2B2F36] overflow-hidden shadow-2xl flex flex-col h-full min-h-[400px]">
      <div className="p-5 border-b border-[#2B2F36] flex items-center justify-between bg-gradient-to-r from-[#181A20] via-[#1E2329] to-[#181A20]">
        <div className="flex items-center gap-3">
          <div className="bg-[#0ECB81]/10 p-2 rounded-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-[#0ECB81]/5 animate-pulse"></div>
            <Cpu className="w-5 h-5 text-[#0ECB81] relative z-10" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Krypton Advisor</h3>
            <p className="text-[10px] text-[#0ECB81] font-bold uppercase tracking-tighter opacity-80">Local Core Intelligence</p>
          </div>
        </div>
        <button
          onClick={getLocalInsight}
          disabled={loading}
          className="bg-[#2B2F36] hover:bg-[#0ECB81] hover:text-black disabled:opacity-50 text-[#0ECB81] p-2 rounded-lg transition-all border border-[#0ECB81]/20 hover:border-[#0ECB81] active:scale-95 group shadow-lg"
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
                  <Sparkles className="w-12 h-12 text-[#0ECB81]/20 animate-pulse" />
                  <BrainCircuit className="w-6 h-6 text-[#0ECB81]/40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
              </div>
              <p className="text-[#848E9C] text-sm max-w-[220px] mx-auto leading-relaxed font-medium">
                Clique no botão acima para que o Motor Local analise seu portfólio e sugira estratégias baseadas em dados reais.
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
                <div className="w-16 h-16 rounded-full border-2 border-[#0ECB81]/10 border-t-[#0ECB81] animate-spin"></div>
                <Cpu className="w-8 h-8 text-[#0ECB81] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <div className="space-y-2 text-center">
                <p className="text-xs font-black text-[#0ECB81] tracking-[0.2em] uppercase">Processando Heurística</p>
                <div className="flex gap-1 justify-center">
                  <div className="w-1 h-1 bg-[#0ECB81] animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1 h-1 bg-[#0ECB81] animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1 h-1 bg-[#0ECB81] animate-bounce"></div>
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
                  onClick={getLocalInsight}
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
                    h3: ({children}) => <h3 className="text-[#0ECB81] text-base font-bold mb-4 flex items-center gap-2">{children}</h3>,
                    h4: ({children}) => <h4 className="text-white text-sm font-bold mb-2 mt-4 flex items-center gap-2 border-l-2 border-[#0ECB81] pl-2">{children}</h4>,
                    p: ({children}) => <p className="text-[#EAECEF] text-sm leading-relaxed mb-4 font-medium">{children}</p>,
                    strong: ({children}) => <strong className="text-[#0ECB81] font-bold">{children}</strong>,
                    ul: ({children}) => <ul className="space-y-3 mb-4">{children}</ul>,
                    li: ({children}) => (
                      <li className="flex gap-3 text-sm text-[#EAECEF] leading-snug">
                        <span className="text-[#0ECB81] mt-1 shrink-0 font-bold">»</span>
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
                    <span className="text-[10px] text-[#848E9C] font-black uppercase tracking-widest">
                       Motor: Krypton Logic (Off-Cloud)
                    </span>
                 </div>
                 <div className="flex items-center gap-1.5 opacity-60">
                    <TrendingUp className="w-3 h-3 text-[#0ECB81]" />
                    <span className="text-[9px] text-white font-mono font-bold italic">v2.0.local</span>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

