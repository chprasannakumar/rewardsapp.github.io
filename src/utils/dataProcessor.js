import { logger } from './logger';

export const calculatePoints = (price) => {
  if (typeof price !== 'number') return 0;
  // Based on tips: Handle decimal calculations
  // ex: purchase 100.2 $ then reward is 50 points
  // purchase 100.4 $ then reward is 50 points
  const amount = Math.floor(price);
  let points = 0;
  
  if (amount <= 50) {
    points = 0;
  } else if (amount <= 100) {
    points = amount - 50;
  } else {
    points = (amount - 100) * 2 + 50;
  }

  if (price !== amount) {
    logger.debug(`Decimal reward calculation: $${price} floored to $${amount} -> ${points} pts`);
  }
  
  return points;
};

export const getMonthYear = (dateString) => {
  const dateObj = new Date(dateString);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  return {
    monthString: monthNames[dateObj.getMonth()],
    monthIndex: dateObj.getMonth(),
    yearString: dateObj.getFullYear().toString(),
    year: dateObj.getFullYear()
  };
};

export const processTransactions = (transactions) => {
  const processedData = transactions.reduce((acc, tx) => {
    const points = calculatePoints(tx.price);
    const { monthString, monthIndex, year } = getMonthYear(tx.purchaseDate);

    // 1. Transactions with points
    const newTx = {
      ...tx,
      points,
      monthIndex,
      year
    };

    // 2. Monthly Rewards Calculation
    const monthKey = `${tx.customerId}_${year}_${monthString}`;
    const currentMonthlyReward = acc.monthlyRewards[monthKey] || {
      customerId: tx.customerId,
      customerName: tx.customerName,
      month: monthString,
      monthIndex,
      year,
      points: 0
    };

    // 3. Total Rewards Calculation
    const currentTotalReward = acc.totalRewards[tx.customerId] || {
      customerId: tx.customerId,
      customerName: tx.customerName,
      points: 0
    };

    return {
      processedTransactions: [...acc.processedTransactions, newTx],
      monthlyRewards: {
        ...acc.monthlyRewards,
        [monthKey]: {
          ...currentMonthlyReward,
          points: currentMonthlyReward.points + points
        }
      },
      totalRewards: {
        ...acc.totalRewards,
        [tx.customerId]: {
          ...currentTotalReward,
          points: currentTotalReward.points + points
        }
      }
    };
  }, {
    processedTransactions: [],
    monthlyRewards: {},
    totalRewards: {}
  });

  return {
    transactions: sortTransactionsByDate(processedData.processedTransactions),
    monthlyRewards: sortMonthlyRewards(Object.values(processedData.monthlyRewards)),
    totalRewards: sortTotalRewards(Object.values(processedData.totalRewards))
  };
};

export const sortTransactionsByDate = (transactions) => {
  return [...transactions].sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
};

export const sortMonthlyRewards = (rewards) => {
  return [...rewards].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year; // Descending year
    return b.monthIndex - a.monthIndex; // Descending month
  });
};

export const sortTotalRewards = (rewards) => {
  // descending order of points
  return [...rewards].sort((a, b) => b.points - a.points);
};
