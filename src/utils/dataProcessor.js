import { logger } from './logger';
import { MONTH_NAMES } from '../constants';

export const calculatePoints = (price) => {
  try {
    if (price == null || typeof price !== 'number' || isNaN(price)) {
      throw new Error(`calculatePoints received invalid price: ${price}`);
    }

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
  } catch (error) {
    throw new Error(`calculatePoints failed: ${error?.message ?? String(error)}`);
  }
};

export const getMonthYear = (dateString) => {
  try {
    if (!dateString) {
      throw new Error('getMonthYear received a null or undefined dateString');
    }

    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) {
      throw new Error(`getMonthYear received an invalid date string: "${dateString}"`);
    }

    return {
      monthString: MONTH_NAMES[dateObj.getMonth()],
      monthIndex: dateObj.getMonth(),
      yearString: dateObj.getFullYear().toString(),
      year: dateObj.getFullYear(),
    };
  } catch (error) {
    throw new Error(`getMonthYear failed: ${error?.message ?? String(error)}`);
  }
};

export const sortTransactionsByDate = (transactions) => {
  try {
    if (!Array.isArray(transactions)) {
      throw new Error('sortTransactionsByDate expected an array of transactions');
    }

    return [...transactions].sort(
      (a, b) =>
        new Date(b?.purchaseDate ?? 0).getTime() -
        new Date(a?.purchaseDate ?? 0).getTime()
    );
  } catch (error) {
    throw new Error(`sortTransactionsByDate failed: ${error?.message ?? String(error)}`);
  }
};

export const sortMonthlyRewards = (rewards) => {
  try {
    if (!Array.isArray(rewards)) {
      throw new Error('sortMonthlyRewards expected an array of rewards');
    }

    return [...rewards].sort((a, b) => {
      if ((a?.year ?? 0) !== (b?.year ?? 0)) return (b?.year ?? 0) - (a?.year ?? 0);
      return (b?.monthIndex ?? 0) - (a?.monthIndex ?? 0);
    });
  } catch (error) {
    throw new Error(`sortMonthlyRewards failed: ${error?.message ?? String(error)}`);
  }
};

export const sortTotalRewards = (rewards) => {
  try {
    if (!Array.isArray(rewards)) {
      throw new Error('sortTotalRewards expected an array of rewards');
    }

    return [...rewards].sort((a, b) => (b?.points ?? 0) - (a?.points ?? 0));
  } catch (error) {
    throw new Error(`sortTotalRewards failed: ${error?.message ?? String(error)}`);
  }
};

export const processTransactions = (transactions) => {
  try {
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return { transactions: [], monthlyRewards: [], totalRewards: [] };
    }

    const processedData = transactions.reduce(
      (acc, tx) => {
        if (!tx?.id || !tx?.customerId || !tx?.purchaseDate) return acc;

        let points;
        let dateInfo;

        try {
          points = calculatePoints(tx.price);
        } catch {
          logger.debug(`Skipping transaction ${tx.id}: invalid price "${tx.price}"`);
          return acc;
        }

        try {
          dateInfo = getMonthYear(tx.purchaseDate);
        } catch {
          logger.debug(`Skipping transaction ${tx.id}: invalid purchaseDate "${tx.purchaseDate}"`);
          return acc;
        }

        const { monthString, monthIndex, year } = dateInfo;

        const newTx = { ...tx, points, monthIndex, year };

        const monthKey = `${tx.customerId}_${year}_${monthString}`;
        const currentMonthlyReward = acc.monthlyRewards[monthKey] || {
          customerId: tx.customerId,
          customerName: tx.customerName ?? 'Unknown',
          month: monthString,
          monthIndex,
          year,
          points: 0,
        };

        const currentTotalReward = acc.totalRewards[tx.customerId] || {
          customerId: tx.customerId,
          customerName: tx.customerName ?? 'Unknown',
          points: 0,
        };

        return {
          processedTransactions: [...acc.processedTransactions, newTx],
          monthlyRewards: {
            ...acc.monthlyRewards,
            [monthKey]: { ...currentMonthlyReward, points: currentMonthlyReward.points + points },
          },
          totalRewards: {
            ...acc.totalRewards,
            [tx.customerId]: { ...currentTotalReward, points: currentTotalReward.points + points },
          },
        };
      },
      { processedTransactions: [], monthlyRewards: {}, totalRewards: {} }
    );

    const sortedTransactions = sortTransactionsByDate(processedData.processedTransactions);
    const sortedMonthly = sortMonthlyRewards(Object.values(processedData.monthlyRewards));
    const sortedTotal = sortTotalRewards(Object.values(processedData.totalRewards));

    return {
      transactions: sortedTransactions,
      monthlyRewards: sortedMonthly,
      totalRewards: sortedTotal,
    };
  } catch (error) {
    throw new Error(`processTransactions failed: ${error?.message ?? String(error)}`);
  }
};