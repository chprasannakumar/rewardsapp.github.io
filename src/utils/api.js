import { logger } from './logger';

const STATIC_URL = `${import.meta.env.BASE_URL}db.json`;

/**
 * Fetches transactions from the server.
 * Returns a sorted array of parsed transactions or throws an Error.
 */
export const fetchTransactions = async () => {
  try {
    // Both Local and GitHub Pages use the static db.json (Read-Only mode)
    logger.info("Running in Static Demo Mode");
    const response = await fetch(STATIC_URL);
    if (!response.ok) throw new Error("Static fetch failed");
    const data = await response.json();
    return data.transactions;
  } catch (error) {
    logger.error("API error", error);
    throw error;
  }
};

/**
 * Updates a transaction on the server.
 */
export const updateTransaction = async () => {
  logger.warn("Update operation ignored in Static Demo Mode");
  return { success: true, message: "Read-only mode" };
};
