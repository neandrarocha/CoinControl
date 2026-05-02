import { useState, useEffect } from 'react';
import { Transaction, AssetStats } from '../types';
import { db, auth } from '../lib/firebase';
import { collection, onSnapshot, query, setDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebase-errors';
import { onAuthStateChanged } from 'firebase/auth';

export function usePortfolio() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setTransactions([]);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const q = query(collection(db, 'users', user.uid, 'transactions'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Transaction[] = [];
      snapshot.forEach(docSnap => {
        const item = docSnap.data();
        if (item.createdAt && item.date && item.asset) {
           data.push({
             id: docSnap.id,
             date: item.date,
             asset: item.asset,
             quantity: item.quantity,
             valuePaid: item.valuePaid,
             quotation: item.quotation,
             type: (item.type as 'compra' | 'venda') || 'compra'
           });
        }
      });
      data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setTransactions(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'users/transactions');
    });

    return () => unsubscribe();
  }, [user]);

  const addTransaction = async (t: Transaction) => {
    if (!user) return;
    const docRef = doc(collection(db, 'users', user.uid, 'transactions'));
    const newTx = {
      date: t.date,
      asset: t.asset,
      quantity: t.quantity,
      valuePaid: t.valuePaid,
      quotation: t.quotation,
      type: t.type,
      userId: user.uid,
      createdAt: serverTimestamp()
    };
    
    try {
      await setDoc(docRef, newTx);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/transactions/${docRef.id}`);
    }
  };

  const removeTransaction = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/transactions/${id}`);
    }
  };

  return { 
    transactions,
    addTransaction,
    removeTransaction
  };
}

export function calculateStats(transactions: Transaction[], currentPrices: Record<string, number>) {
  const assetStatsMap: Record<string, AssetStats> = {};
  
  transactions.forEach(t => {
    if (!assetStatsMap[t.asset]) {
      assetStatsMap[t.asset] = {
        asset: t.asset,
        totalQuantity: 0,
        totalInvested: 0,
        averagePrice: 0,
        currentPrice: 0,
        currentValue: 0,
        profitOrLoss: 0,
        profitOrLossPercent: 0
      };
    }
    if (t.type === 'venda') {
      const stats = assetStatsMap[t.asset];
      const avgPrice = stats.totalQuantity > 0 ? stats.totalInvested / stats.totalQuantity : 0;
      stats.totalQuantity -= t.quantity;
      // Reduce invested proportionally to maintain same average price
      stats.totalInvested -= t.quantity * avgPrice;
    } else {
      assetStatsMap[t.asset].totalQuantity += t.quantity;
      assetStatsMap[t.asset].totalInvested += t.valuePaid;
    }
  });

  const stats = Object.values(assetStatsMap)
    .filter(stat => stat.totalQuantity > 0.00000001) // Filter out dust or fully sold assets
    .map(stat => {
      stat.averagePrice = stat.totalQuantity > 0 ? stat.totalInvested / stat.totalQuantity : 0;
    stat.currentPrice = currentPrices[stat.asset] || stat.averagePrice; // Fallback so chart doesn't break if API fails
    stat.currentValue = stat.totalQuantity * stat.currentPrice;
    stat.profitOrLoss = stat.currentValue - stat.totalInvested;
    stat.profitOrLossPercent = stat.totalInvested > 0 ? (stat.profitOrLoss / stat.totalInvested) * 100 : 0;
    return stat;
  });

  const totalPatrimony = stats.reduce((acc, stat) => acc + stat.currentValue, 0);
  const totalInvested = stats.reduce((acc, stat) => acc + stat.totalInvested, 0);
  
  return { stats, totalPatrimony, totalInvested };
}
