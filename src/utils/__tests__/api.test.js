import { fetchTransactions, updateTransaction } from '../api';
import { logger } from '../logger';

jest.mock('../logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('api.js', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── fetchTransactions ──────────────────────────────────────────────────────

  describe('fetchTransactions', () => {
    test('happy path: returns transactions array and logs info', async () => {
      const mockResponse = {
        transactions: [
          { id: '1', amount: 100 },
          { id: '2', amount: 200 },
        ],
      };
      fetch.mockResolvedValue({ ok: true, json: async () => mockResponse });

      const result = await fetchTransactions();

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse.transactions);
      expect(logger.info).toHaveBeenCalledWith('Running in Static Demo Mode');
    });

    test('happy path: calls fetch exactly once', async () => {
      fetch.mockResolvedValue({ ok: true, json: async () => ({ transactions: [] }) });
      await fetchTransactions();
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    // Branch: response.ok === false — throws "Static fetch failed" wrapped
    test('throws wrapped error when response.ok is false', async () => {
      fetch.mockResolvedValue({ ok: false });
      await expect(fetchTransactions()).rejects.toThrow('Failed to fetch transactions');
      expect(logger.error).toHaveBeenCalledWith('API error', expect.any(Error));
    });

    test('wrapped error message includes the original "Static fetch failed" cause', async () => {
      fetch.mockResolvedValue({ ok: false });
      const err = await fetchTransactions().catch(e => e);
      expect(err.message).toContain('Static fetch failed');
    });

    // Branch: fetch() itself rejects (network-level error)
    test('throws wrapped error on network-level failure', async () => {
      fetch.mockRejectedValue(new Error('Network Error'));
      await expect(fetchTransactions()).rejects.toThrow('Failed to fetch transactions');
      expect(logger.error).toHaveBeenCalledWith('API error', expect.any(Error));
    });

    test('wrapped error message includes original network error cause', async () => {
      fetch.mockRejectedValue(new Error('Network Error'));
      const err = await fetchTransactions().catch(e => e);
      expect(err.message).toContain('Network Error');
    });

    // Branch: json() parse fails
    test('throws wrapped error on JSON parse failure', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => { throw new Error('JSON parse error'); },
      });
      await expect(fetchTransactions()).rejects.toThrow('Failed to fetch transactions');
      expect(logger.error).toHaveBeenCalled();
    });

    test('wrapped error includes JSON parse cause message', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => { throw new Error('JSON parse error'); },
      });
      const err = await fetchTransactions().catch(e => e);
      expect(err.message).toContain('JSON parse error');
    });

    // Branch: error?.message ?? String(error) — error with no .message property
    test('falls back to String(error) when caught value has no .message', async () => {
      // Throwing a plain string (no .message property)
      fetch.mockRejectedValue('raw string error');
      const err = await fetchTransactions().catch(e => e);
      // error?.message is undefined => String('raw string error') = 'raw string error'
      expect(err.message).toContain('raw string error');
    });

    // Confirms logger.error is always called before rethrowing
    test('always calls logger.error before rethrowing', async () => {
      fetch.mockRejectedValue(new Error('any'));
      await fetchTransactions().catch(() => {});
      expect(logger.error).toHaveBeenCalledTimes(1);
    });
  });
});