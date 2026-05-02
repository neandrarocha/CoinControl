import React, { useState } from 'react';
import { AssetStats, Transaction } from '../types';
import { formatCurrency, formatCrypto } from '../lib/utils';
import { Trash2, Filter } from 'lucide-react';

interface Props {
  stats: AssetStats[];
  transactions: Transaction[];
  onRemoveTransaction: (id: string) => void;
}

export function AssetList({ stats, transactions, onRemoveTransaction }: Props) {
  const [typeFilter, setTypeFilter] = useState<'all' | 'compra' | 'venda'>('all');
  const [yearFilter, setYearFilter] = useState<'all' | string>('all');

  const years = Array.from(new Set(transactions.map(t => new Date(t.date).getFullYear().toString()))).sort((a, b) => b.localeCompare(a));

  const filteredTransactions = transactions.filter(t => {
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesYear = yearFilter === 'all' || new Date(t.date).getFullYear().toString() === yearFilter;
    return matchesType && matchesYear;
  });

  return (
    <div className="flex-1 flex flex-col 2xl:flex-row gap-8 min-h-0 w-full">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1.5 h-6 bg-[#F3BA2F] rounded-full"></div>
          <h3 className="text-lg font-bold uppercase text-white tracking-wide">Meus Ativos</h3>
        </div>
        
        {/* Mobile View (Cards) */}
        <div className="md:hidden flex flex-col gap-4">
          {stats.map(stat => (
            <div key={stat.asset} className="bg-[#181A20] border border-[#2B2F36] rounded-xl p-5 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3 font-semibold text-lg">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm ${stat.asset === 'BTC' ? 'bg-[#F3BA2F] text-black' : stat.asset === 'USDC' ? 'bg-[#2775CA]' : 'bg-[#0ECB81]'}`}>
                     {stat.asset.charAt(0)}
                   </div>
                   {stat.asset}
                 </div>
                 <div className={`font-mono text-base font-bold ${stat.profitOrLoss >= 0 ? 'text-[#0ECB81]' : 'text-rose-500'}`}>
                   {stat.profitOrLoss >= 0 ? '+' : ''}{stat.profitOrLossPercent.toFixed(2)}%
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                 <div>
                   <p className="text-[#848E9C] text-xs mb-1 uppercase font-semibold">Quantidade</p>
                   <p className="font-mono text-base">{formatCrypto(stat.totalQuantity)}</p>
                 </div>
                 <div>
                   <p className="text-[#848E9C] text-xs mb-1 uppercase font-semibold">Valor Atual</p>
                   <p className={`font-mono font-bold text-base ${stat.asset === 'BTC' ? 'text-[#F3BA2F]' : ''}`}>{formatCurrency(stat.currentValue)}</p>
                 </div>
                 <div>
                   <p className="text-[#848E9C] text-xs mb-1 uppercase font-semibold">Preço Médio</p>
                   <p className="font-mono text-base">{formatCurrency(stat.averagePrice)}</p>
                 </div>
              </div>
            </div>
          ))}
          {stats.length === 0 && (
            <div className="p-8 text-center text-base text-[#848E9C] bg-[#181A20] border border-[#2B2F36] rounded-xl">
              Nenhum ativo na carteira
            </div>
          )}
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden md:block bg-[#181A20] border border-[#2B2F36] rounded-xl overflow-x-auto flex-1 shadow-sm w-full">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#2B2F36] text-[#848E9C] sticky top-0">
              <tr>
                <th className="p-4 font-bold tracking-wide">Ativo</th>
                <th className="p-4 font-bold tracking-wide text-right">Quantidade</th>
                <th className="p-4 font-bold tracking-wide text-right">Preço Médio</th>
                <th className="p-4 font-bold tracking-wide text-right">Valor Atual</th>
                <th className="p-4 font-bold tracking-wide text-right">P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B2F36]">
              {stats.map(stat => (
                <tr key={stat.asset} className="hover:bg-[#2B2F36]/30 transition-colors">
                  <td className="p-4 flex items-center gap-3 font-semibold text-base">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${stat.asset === 'BTC' ? 'bg-[#F3BA2F] text-black' : stat.asset === 'USDC' ? 'bg-[#2775CA]' : 'bg-[#0ECB81]'}`}>
                      {stat.asset.charAt(0)}
                    </div>
                    {stat.asset}
                  </td>
                  <td className="p-4 text-right font-mono text-base">{formatCrypto(stat.totalQuantity)}</td>
                  <td className="p-4 text-right font-mono text-base">{formatCurrency(stat.averagePrice)}</td>
                  <td className={`p-4 text-right font-mono text-base font-bold ${stat.asset === 'BTC' ? 'text-[#F3BA2F]' : ''}`}>{formatCurrency(stat.currentValue)}</td>
                  <td className={`p-4 text-right font-mono text-base font-bold ${stat.profitOrLoss >= 0 ? 'text-[#0ECB81]' : 'text-rose-500'}`}>
                    {stat.profitOrLoss >= 0 ? '+' : ''}{stat.profitOrLossPercent.toFixed(2)}%
                  </td>
                </tr>
              ))}
              {stats.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-base text-[#848E9C]">Nenhum ativo na carteira</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="w-full 2xl:w-96 flex flex-col shrink-0 mt-8 2xl:mt-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-[#F3BA2F] rounded-full"></div>
            <h3 className="text-lg font-bold uppercase text-white tracking-wide">Últimos Lançamentos</h3>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-[#181A20] border border-[#2B2F36] rounded p-2 text-xs text-white outline-none focus:border-[#F3BA2F]"
          >
            <option value="all">Todas Ops</option>
            <option value="compra">Compras</option>
            <option value="venda">Vendas</option>
          </select>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="bg-[#181A20] border border-[#2B2F36] rounded p-2 text-xs text-white outline-none focus:border-[#F3BA2F]"
          >
            <option value="all">Todos Anos</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 bg-[#181A20] border border-[#2B2F36] rounded-xl p-5 space-y-5 max-h-[500px] xl:max-h-full overflow-y-auto custom-scrollbar shadow-sm">
          {filteredTransactions.slice().reverse().map((t, i) => (
            <div key={t.id} className={`flex justify-between items-start border-l-4 pl-4 group ${t.type === 'compra' ? 'border-[#0ECB81]' : 'border-[#F6465D]'} ${i > 5 ? 'opacity-50' : ''}`}>
              <div>
                <p className="text-sm font-bold text-white flex items-center gap-2">
                  <span className={`text-[10px] uppercase font-black px-1 rounded ${t.type === 'compra' ? 'bg-[#0ECB81]/10 text-[#0ECB81]' : 'bg-[#F6465D]/10 text-[#F6465D]'}`}>
                    {t.type}
                  </span>
                  {t.asset}
                </p>
                <p className="text-xs text-[#848E9C] mt-1">{new Date(t.date).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', ' •')}</p>
              </div>
              <div className="text-right flex items-center gap-3">
                <div>
                  <p className={`text-sm font-mono font-semibold ${t.type === 'compra' ? 'text-white' : 'text-[#848E9C]'}`}>
                    {t.type === 'compra' ? '+' : '-'}{formatCrypto(t.quantity)} {t.asset}
                  </p>
                  <p className="text-xs text-[#848E9C] mt-1">{formatCurrency(t.valuePaid)}</p>
                </div>
                <button 
                  onClick={() => onRemoveTransaction(t.id)}
                  className="text-[#848E9C] hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-rose-500/10 lg:opacity-0 opacity-100"
                  title="Remover"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {filteredTransactions.length === 0 && (
             <p className="text-sm text-[#848E9C] text-center p-4">Nenhum lançamento encontrado</p>
          )}
        </div>
      </div>
    </div>
  );
}
