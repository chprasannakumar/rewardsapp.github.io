import { logger } from './logger';
import { MONTH_NAMES } from '../constants';

/**
 * calculatePoints — awards reward points for a given purchase price.
 *
 * Tier structure (applied to the FLOORED whole-dollar amount):
 *   • $0 – $50    → 0 pts
 *   • $51 – $100  → 1 pt per whole dollar over $50
 *   • > $100      → 2 pts per whole dollar over $100 + 50 pts base
 *
 * Cents are intentionally excluded from tier calculation:
 *   $100.20 → floor → $100 → 50 pts
 *   $100.40 → floor → $100 → 50 pts
 *   $100.99 → floor → $100 → 50 pts
 *   $101.00 → floor → $101 → 52 pts
 */
export const calculatePoints = (price) => {
  let points = 0;
  try {
    if (price == null || typeof price !== 'number' || isNaN(price)) {
      throw new Error(`calculatePoints received invalid price: ${price}`);
    }

    const wholeDollars = Math.floor(price);

    if (wholeDollars <= 50) {
      points = 0;
    } else if (wholeDollars <= 100) {
      points = wholeDollars - 50;
    } else {
      points = (wholeDollars - 100) * 2 + 50;
    }

    logger.debug(`calculatePoints: $${price} (floor $${wholeDollars}) -> ${points} pts`);
    return points;
  } catch (error) {
    throw new Error(`calculatePoints failed: ${error?.message ?? String(error)}`);
  } finally {
    logger.debug(`calculatePoints finished for price: ${price}`);
  }
};

export const getMonthYear = (dateString) => {
  let result = null;
  try {
    if (!dateString) {
      throw new Error('getMonthYear received a null or undefined dateString');
    }

    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) {
      throw new Error(`getMonthYear received an invalid date string: "${dateString}"`);
    }

    result = {
      monthString: MONTH_NAMES[dateObj.getMonth()],
      monthIndex: dateObj.getMonth(),
      yearString: dateObj.getFullYear().toString(),
      year: dateObj.getFullYear(),
    };
    return result;
  } catch (error) {
    throw new Error(`getMonthYear failed: ${error?.message ?? String(error)}`);
  } finally {
    logger.debug(`getMonthYear finished for: ${dateString}`);
  }
};

export const sortTransactionsByDate = (transactions) => {
  let sorted = [];
  try {
    if (!Array.isArray(transactions)) {
      throw new Error('sortTransactionsByDate expected an array of transactions');
    }

    sorted = [...transactions].sort(
      (a, b) =>
        new Date(b?.purchaseDate ?? 0).getTime() -
        new Date(a?.purchaseDate ?? 0).getTime()
    );
    return sorted;
  } catch (error) {
    throw new Error(`sortTransactionsByDate failed: ${error?.message ?? String(error)}`);
  } finally {
    logger.debug(`sortTransactionsByDate finished, result length: ${sorted.length}`);
  }
};

export const sortMonthlyRewards = (rewards) => {
  let sorted = [];
  try {
    if (!Array.isArray(rewards)) {
      throw new Error('sortMonthlyRewards expected an array of rewards');
    }

    sorted = [...rewards].sort((a, b) => {
      if ((a?.year ?? 0) !== (b?.year ?? 0)) return (b?.year ?? 0) - (a?.year ?? 0);
      return (b?.monthIndex ?? 0) - (a?.monthIndex ?? 0);
    });
    return sorted;
  } catch (error) {
    throw new Error(`sortMonthlyRewards failed: ${error?.message ?? String(error)}`);
  } finally {
    logger.debug(`sortMonthlyRewards finished, result length: ${sorted.length}`);
  }
};

export const sortTotalRewards = (rewards) => {
  let sorted = [];
  try {
    if (!Array.isArray(rewards)) {
      throw new Error('sortTotalRewards expected an array of rewards');
    }

    sorted = [...rewards].sort((a, b) => (b?.points ?? 0) - (a?.points ?? 0));
    return sorted;
  } catch (error) {
    throw new Error(`sortTotalRewards failed: ${error?.message ?? String(error)}`);
  } finally {
    logger.debug(`sortTotalRewards finished, result length: ${sorted.length}`);
  }
};

export const processTransactions = (transactions) => {
  let result = { transactions: [], monthlyRewards: [], totalRewards: [] };
  try {
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return result;
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

    result = {
      transactions: sortedTransactions,
      monthlyRewards: sortedMonthly,
      totalRewards: sortedTotal,
    };
    return result;
  } catch (error) {
    throw new Error(`processTransactions failed: ${error?.message ?? String(error)}`);
  } finally {
    logger.debug(`processTransactions finished, transactions: ${result.transactions.length}`);
  }
};
