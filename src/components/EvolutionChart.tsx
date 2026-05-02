import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatCurrency } from '../lib/utils';
import { Transaction } from '../types';

interface Props {
  transactions: Transaction[];
  totalCurrentValue: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0B0E11]/90 backdrop-blur-md border border-[#F3BA2F]/30 text-[#EAECEF] p-4 rounded-xl shadow-[0_4px_20px_rgba(243,186,47,0.15)] min-w-[170px]">
        <p className="text-sm text-[#A9B1BD] mb-3 font-semibold border-b border-[#2B2F36] pb-2">{label}</p>
        <div className="space-y-2">
          {payload.map((p: any, index: number) => (
            <p key={index} className="text-base flex justify-between gap-4 items-center">
              <span className="text-white font-medium">{p.name}:</span>
              <span className="font-mono font-bold" style={{ color: p.color, textShadow: `0 0 8px ${p.color}40` }}>{formatCurrency(p.value)}</span>
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function EvolutionChart({ transactions, totalCurrentValue }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border border-[#2B2F36] rounded-xl bg-[#181A20]">
        <p className="text-[#848E9C] text-sm">Adicione compras para visualizar o gráfico</p>
      </div>
    );
  }

  // Generate chart data based on cumulative investments
  const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const assetTracking: Record<string, { quantity: number; invested: number }> = {};
  let currentCumulativeInvested = 0;

  const chartData = sorted.map((t, index) => {
    if (!assetTracking[t.asset]) {
      assetTracking[t.asset] = { quantity: 0, invested: 0 };
    }

    const prevInvested = assetTracking[t.asset].invested;

    if (t.type === 'venda') {
      const avgPrice = assetTracking[t.asset].quantity > 0 
        ? assetTracking[t.asset].invested / assetTracking[t.asset].quantity 
        : 0;
      const reduction = t.quantity * avgPrice;
      
      assetTracking[t.asset].quantity -= t.quantity;
      assetTracking[t.asset].invested -= reduction;
      
      currentCumulativeInvested -= reduction;
    } else {
      assetTracking[t.asset].quantity += t.quantity;
      assetTracking[t.asset].invested += t.valuePaid;
      
      currentCumulativeInvested += t.valuePaid;
    }

    return {
      date: new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(t.date)),
      investido: Math.max(0, currentCumulativeInvested),
      // Se for a última transação, adicionamos uma projeção até o valor atual para mostrar o crescimento/queda
      atual: index === sorted.length - 1 ? totalCurrentValue : null
    };
  });

  // Since currentCumulativeInvested is now updated inside the map, we use it for the "Hoje" point
  const finalCumulativeInvested = currentCumulativeInvested;

  // Deduplicate points by date, keeping the last one
  const uniqueDates = new Map();
  chartData.forEach(item => {
    uniqueDates.set(item.date, item);
  });
  
  const finalData = Array.from(uniqueDates.values());
  
  // Add a final point if the current value is different than invested to show the gap
  if (finalData.length > 0) {
    // Create a "Hoje" point to show the current divergence from invested amount safely
    finalData.push({
      date: 'Hoje',
      investido: finalCumulativeInvested,
      atual: totalCurrentValue
    });
  }

  return (
    <div className="h-[350px] bg-[#181A20] rounded-xl border border-[#2B2F36] p-6 flex flex-col shrink-0 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
      <div className="mb-6 flex items-center gap-2">
        <div className="w-1.5 h-6 bg-[#F3BA2F] rounded-full"></div>
        <div>
          <h3 className="text-lg font-bold text-white uppercase tracking-wide">Evolução do Patrimônio</h3>
          <p className="text-sm text-[#848E9C] font-semibold mt-1">Investido vs Atual</p>
        </div>
      </div>
      <div className="flex-1 w-full min-h-0 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={finalData} margin={{ top: 15, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorInvestido" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F3BA2F" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#F3BA2F" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2B2F36" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#848E9C" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              tickMargin={12}
            />
            <YAxis 
              stroke="#848E9C" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR', { notation: 'compact' })}`}
              width={70}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#404040', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area 
              type="monotone" 
              name="Total Investido"
              dataKey="investido" 
              stroke="#F3BA2F" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorInvestido)" 
              style={{ filter: "drop-shadow(0px 4px 8px rgba(243, 186, 47, 0.4))" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
