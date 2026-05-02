import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';

interface Props {
  onAddTransaction: (t: Transaction) => void;
  currentPrices: Record<string, number>;
}

export function TransactionForm({ onAddTransaction, currentPrices }: Props) {
  const [date, setDate] = useState('');
  const [asset, setAsset] = useState('BTC');
  const [quantity, setQuantity] = useState('');
  const [valuePaid, setValuePaid] = useState('');
  const [quotation, setQuotation] = useState('');
  const [type, setType] = useState<'compra' | 'venda'>('compra');

  // Auto-calculate Value Paid when quantity or quotation changes
  useEffect(() => {
    const q = parseFloat(quantity);
    const c = parseFloat(quotation);
    if (!isNaN(q) && !isNaN(c)) {
      setValuePaid((q * c).toString());
    }
  }, [quantity, quotation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !asset || !quantity || !valuePaid || !quotation) return;

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      date,
      asset: asset.toUpperCase().trim(),
      quantity: parseFloat(quantity),
      valuePaid: parseFloat(valuePaid),
      quotation: parseFloat(quotation),
      type
    };

    onAddTransaction(transaction);
    
    // Reset form mostly, keep date
    setQuantity('');
    setValuePaid('');
    setQuotation('');
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-6 border-b border-[#2B2F36] pb-3">
          <div className="w-1.5 h-6 bg-[#F3BA2F] rounded-full"></div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wide">Novo Lançamento</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <span className="text-sm font-semibold text-[#EAECEF] block mb-2">Operação</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('compra')}
                className={`flex-1 py-3 px-4 rounded font-bold transition-all ${
                  type === 'compra' 
                    ? 'bg-[#00C087] text-white' 
                    : 'bg-[#2B2F36] text-[#848E9C] hover:bg-[#32363D]'
                }`}
              >
                COMPRA
              </button>
              <button
                type="button"
                onClick={() => setType('venda')}
                className={`flex-1 py-3 px-4 rounded font-bold transition-all ${
                  type === 'venda' 
                    ? 'bg-[#F6465D] text-white' 
                    : 'bg-[#2B2F36] text-[#848E9C] hover:bg-[#32363D]'
                }`}
              >
                VENDA
              </button>
            </div>
          </div>
          <div>
            <span className="text-sm font-semibold text-[#EAECEF] block mb-2">Data e Hora</span>
            <input 
              type="datetime-local" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#2B2F36] border border-transparent focus:border-[#F3BA2F] rounded p-3 text-sm outline-none text-white !color-scheme-dark"
              style={{ colorScheme: 'dark' }}
              required
            />
          </div>
          <div>
            <span className="text-sm font-semibold text-[#EAECEF] block mb-2">Ativo</span>
            <select 
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              className="w-full bg-[#2B2F36] border border-transparent focus:border-[#F3BA2F] rounded p-3 text-sm outline-none text-white appearance-none"
              required
            >
              <option value="BTC">BTC</option>
              <option value="USDC">USDC</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-sm font-semibold text-[#EAECEF] block mb-2">Quantidade</span>
              <input 
                type="number" 
                step="any"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-[#2B2F36] border border-transparent focus:border-[#F3BA2F] rounded p-3 text-sm outline-none text-white"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <span className="text-sm font-semibold text-[#EAECEF] block mb-2">{type === 'compra' ? 'Valor Pago' : 'Valor Recebido'}</span>
              <input 
                type="number" 
                step="any"
                min="0"
                value={valuePaid}
                onChange={(e) => setValuePaid(e.target.value)}
                className="w-full bg-[#2B2F36] border border-transparent focus:border-[#F3BA2F] rounded p-3 text-sm outline-none text-white"
                placeholder={type === 'compra' ? 'R$ 0,00' : 'Total Recebido'}
                required
              />
            </div>
          </div>
          <div>
            <span className="text-sm font-semibold text-[#EAECEF] block mb-2">Cotação no Momento</span>
            <input 
              type="number" 
              step="any"
              min="0"
              value={quotation}
              onChange={(e) => setQuotation(e.target.value)}
              className="w-full bg-[#2B2F36] border border-transparent focus:border-[#F3BA2F] rounded p-3 text-sm outline-none text-white"
              placeholder="Preço Unitário"
              required
            />
          </div>
          <button 
            type="submit"
            className={`w-full font-bold py-3 rounded text-base transition-colors mt-4 ${
              type === 'compra' 
                ? 'bg-[#F3BA2F] hover:bg-[#E2B237] text-black' 
                : 'bg-[#F6465D] hover:bg-[#D53D50] text-white'
            }`}
          >
            Adicionar {type === 'compra' ? 'Compra' : 'Venda'}
          </button>
        </form>
      </div>
    </div>
  );
}
