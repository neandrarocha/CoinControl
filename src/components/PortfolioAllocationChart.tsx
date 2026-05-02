import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { AssetStats } from '../types';
import { formatCurrency, formatCrypto } from '../lib/utils';

interface Props {
  stats: AssetStats[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#2B2F36] border border-[#2B2F36] text-[#EAECEF] p-4 rounded-xl shadow-xl min-w-[160px]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.fill }}></div>
          <p className="font-bold text-base text-white">{data.name}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm flex justify-between gap-4">
            <span className="text-[#848E9C]">Patrimônio:</span> 
            <span className="text-[#F3BA2F] font-mono font-bold">{formatCurrency(data.value)}</span>
          </p>
          <p className="text-sm flex justify-between gap-4">
            <span className="text-[#848E9C]">Quantidade:</span> 
            <span className="font-mono text-white">{formatCrypto(data.quantity)}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function PortfolioAllocationChart({ stats }: Props) {
  const [activeIndex, setActiveIndex] = useState(-1);

  // Only use positive value assets
  const data = stats
    .filter((s) => s.currentValue > 0)
    .map((s, idx) => ({
      name: s.asset,
      value: s.currentValue,
      quantity: s.totalQuantity,
      fill: s.asset === 'BTC' ? '#F3BA2F' : s.asset === 'USDC' ? '#2775CA' : '#0ECB81'
    }));

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border border-[#2B2F36] rounded-xl bg-[#181A20]">
        <p className="text-[#848E9C] text-sm">Adicione compras para visualizar a alocação</p>
      </div>
    );
  }

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 12}
          outerRadius={outerRadius + 16}
          fill={fill}
        />
      </g>
    );
  };

  return (
    <div className="h-[350px] bg-[#181A20] rounded-xl border border-[#2B2F36] p-6 flex flex-col shrink-0 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
      <div className="mb-6 flex items-center gap-2">
        <div className="w-1.5 h-6 bg-[#F3BA2F] rounded-full"></div>
        <div>
          <h3 className="text-lg font-bold text-white uppercase tracking-wide">Alocação do Patrimônio</h3>
          <p className="text-sm text-[#848E9C] font-semibold mt-1">Composição atual da carteira</p>
        </div>
      </div>
      <div className="flex-1 w-full min-h-0 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(-1)}
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              cornerRadius={4}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
