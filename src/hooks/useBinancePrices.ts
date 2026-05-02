import { useState, useEffect } from 'react';

export function useBinancePrices(assets: string[]) {
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/price');
        const data = await res.json();
        const newPrices: Record<string, number> = {};
        
        assets.forEach(asset => {
          // Attempt to find a BRL pair first for localized pricing
          let pair = data.find((d: any) => d.symbol === `${asset}BRL`);
          if (!pair) {
            // Fallback to USDT
            pair = data.find((d: any) => d.symbol === `${asset}USDT`);
          }
          if (pair) {
            newPrices[asset] = parseFloat(pair.price);
          }
        });
        
        setPrices(newPrices);
      } catch (err) {
        console.error('Failed to fetch prices from Binance', err);
      }
    };

    if (assets.length > 0) {
      fetchPrices();
      const interval = setInterval(fetchPrices, 15000); // Update every 15s
      return () => clearInterval(interval);
    }
  }, [JSON.stringify(assets)]);

  return prices;
}
