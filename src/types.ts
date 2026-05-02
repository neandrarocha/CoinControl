export interface Transaction {
  id: string;
  date: string; // ISO DateTime
  asset: string; // e.g., 'BTC', 'USDC'
  quantity: number;
  valuePaid: number;
  quotation: number;
  type: 'compra' | 'venda';
}

export interface AssetStats {
  asset: string;
  totalQuantity: number;
  totalInvested: number;
  averagePrice: number;
  currentPrice: number;
  currentValue: number;
  profitOrLoss: number;
  profitOrLossPercent: number;
}
