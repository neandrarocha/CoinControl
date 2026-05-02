import React, { useState } from 'react';
import { Transaction, AssetStats } from '../types';
import { EvolutionChart } from './EvolutionChart';
import { PortfolioAllocationChart } from './PortfolioAllocationChart';

interface Props {
  transactions: Transaction[];
  stats: AssetStats[];
  totalCurrentValue: number;
}

export function ChartsCarousel({ transactions, stats, totalCurrentValue }: Props) {
  const [activeChart, setActiveChart] = useState<'evolution' | 'allocation'>('evolution');

  return (
    <div className="flex flex-col gap-4">
      {/* Carousel Navigation */}
      <div className="flex justify-center sm:justify-start gap-4">
        <button 
          onClick={() => setActiveChart('evolution')}
          className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${activeChart === 'evolution' ? 'bg-[#F3BA2F] text-black' : 'bg-[#2B2F36] text-[#848E9C] hover:text-white'}`}
        >
          Evolução
        </button>
        <button 
          onClick={() => setActiveChart('allocation')}
          className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${activeChart === 'allocation' ? 'bg-[#F3BA2F] text-black' : 'bg-[#2B2F36] text-[#848E9C] hover:text-white'}`}
        >
          Alocação (Pizza)
        </button>
      </div>

      {/* Chart Display */}
      <div>
        {activeChart === 'evolution' ? (
          <EvolutionChart transactions={transactions} totalCurrentValue={totalCurrentValue} />
        ) : (
          <PortfolioAllocationChart stats={stats} />
        )}
      </div>
    </div>
  );
}
