import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatCurrency } from '../lib/utils';
import { Transaction } from '../types';

interface Props {
  transactions: Transaction[];
  totalCurrentValue: number;
  currentPrices: Record<string, number>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0B0E11]/95 backdrop-blur-md border border-[#2B2F36] text-[#EAECEF] p-4 rounded-xl shadow-2xl min-w-[200px]">
        <p className="text-sm text-[#848E9C] mb-3 font-semibold border-b border-[#2B2F36] pb-2">{label}</p>
        <div className="space-y-3">
          {payload.map((p: any, index: number) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></div>
                <span className="text-sm font-medium text-[#EAECEF]">{p.name}:</span>
              </div>
              <span className="font-mono font-bold text-sm" style={{ color: p.color }}>{formatCurrency(p.value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function EvolutionChart({ transactions, totalCurrentValue, currentPrices }: Props) {
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

  const chartData = sorted.map((t) => {
    if (!assetTracking[t.asset]) {
      assetTracking[t.asset] = { quantity: 0, invested: 0 };
    }

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

    // Calculate market value based on TODAY'S prices for the quantity held AT THIS STEP
    const marketValueAtStep = Object.entries(assetTracking).reduce((acc, [asset, data]) => {
      return acc + (data.quantity * (currentPrices[asset] || 0));
    }, 0);

    return {
      date: new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(t.date)),
      investido: Math.max(0, currentCumulativeInvested),
      patrimonio: Math.max(0, marketValueAtStep)
    };
  });

  // Deduplicate points by date, keeping the last one
  const uniqueDates = new Map();
  chartData.forEach(item => {
    uniqueDates.set(item.date, item);
  });
  
  const finalData = Array.from(uniqueDates.values());
  
  // Add a final "Hoje" point
  if (finalData.length > 0) {
    finalData.push({
      date: 'Hoje',
      investido: currentCumulativeInvested,
      patrimonio: totalCurrentValue
    });
  }

  return (
    <div className="h-[400px] bg-[#181A20] rounded-xl border border-[#2B2F36] p-6 flex flex-col shrink-0 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-[#F3BA2F] rounded-full"></div>
          <div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wide">Evolução do Patrimônio</h3>
            <p className="text-xs text-[#848E9C] font-semibold mt-1">Comparativo de Valor Aplicado vs. Valor Atual</p>
          </div>
        </div>
        <div className="hidden sm:flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#F3BA2F] rounded-sm"></div>
            <span className="text-xs text-[#848E9C] font-semibold">Patrimônio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-[#848E9C] rounded-full"></div>
            <span className="text-xs text-[#848E9C] font-semibold">Investido</span>
          </div>
        </div>
      </div>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={finalData} margin={{ top: 15, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPatrimonio" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F3BA2F" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#F3BA2F" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2B2F36" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#848E9C" 
              fontSize={11} 
              tickLine={false}
              axisLine={false}
              tickMargin={12}
            />
            <YAxis 
              stroke="#848E9C" 
              fontSize={11} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR', { notation: 'compact' })}`}
              width={65}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#404040', strokeWidth: 1 }} />
            
            {/* Patrimônio Area */}
            <Area 
              type="monotone" 
              name="Patrimônio"
              dataKey="patrimonio" 
              stroke="#F3BA2F" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPatrimonio)" 
              animationDuration={1500}
            />
            
            {/* Investido Line */}
            <Area
              type="monotone"
              name="Total Investido"
              dataKey="investido"
              stroke="#848E9C"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="transparent"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
