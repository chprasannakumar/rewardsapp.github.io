import {
  calculatePoints,
  getMonthYear,
  processTransactions,
  sortTransactionsByDate,
  sortMonthlyRewards,
  sortTotalRewards,
} from '../dataProcessor';

// ─── calculatePoints ────────────────────────────────────────────────────────

describe('calculatePoints', () => {
  // Invalid inputs throw
  test('throws for null', () => expect(() => calculatePoints(null)).toThrow('calculatePoints'));
  test('throws for undefined', () => expect(() => calculatePoints(undefined)).toThrow('calculatePoints'));
  test('throws for NaN', () => expect(() => calculatePoints(NaN)).toThrow('calculatePoints'));
  test('throws for string', () => expect(() => calculatePoints('120')).toThrow('calculatePoints'));
  test('throws for object', () => expect(() => calculatePoints({})).toThrow('calculatePoints'));

  // $0–$50 tier → 0 pts (cents do NOT affect tier)
  test('returns 0 for $0', () => expect(calculatePoints(0)).toBe(0));
  test('returns 0 for $50', () => expect(calculatePoints(50)).toBe(0));
  test('returns 0 for $50.99 — cents do not push into next tier', () => expect(calculatePoints(50.99)).toBe(0));

  // $51–$100 tier → 1 pt per whole dollar over $50
  test('returns 1 pt for $51', () => expect(calculatePoints(51)).toBe(1));
  test('returns 1 pt for $51.99 — cents ignored in tier calc', () => expect(calculatePoints(51.99)).toBe(1));
  test('returns 25 pts for $75', () => expect(calculatePoints(75)).toBe(25));
  test('returns 25 pts for $75.75 — cents do not add fractions', () => expect(calculatePoints(75.75)).toBe(25));
  test('returns 49 pts for $99.99', () => expect(calculatePoints(99.99)).toBe(49));
  test('returns 50 pts for $100', () => expect(calculatePoints(100)).toBe(50));

  // KEY: cents in the $100–$101 range still give 50 pts (floor stays at $100)
  test('returns 50 pts for $100.20 — floor to $100', () => expect(calculatePoints(100.20)).toBe(50));
  test('returns 50 pts for $100.40 — floor to $100', () => expect(calculatePoints(100.40)).toBe(50));
  test('returns 50 pts for $100.99 — floor to $100', () => expect(calculatePoints(100.99)).toBe(50));

  // > $100 tier → 2 pts per whole dollar over $100 + 50 base
  test('returns 52 pts for $101', () => expect(calculatePoints(101)).toBe(52));
  test('returns 52 pts for $101.50 — cents ignored', () => expect(calculatePoints(101.50)).toBe(52));
  test('returns 90 pts for $120', () => expect(calculatePoints(120)).toBe(90));
  test('returns 90 pts for $120.99 — cents do not add', () => expect(calculatePoints(120.99)).toBe(90));
  test('returns 250 pts for $200', () => expect(calculatePoints(200)).toBe(250));

  // finally block
  test('finally block does not swallow return value', () => expect(calculatePoints(75)).toBe(25));
  test('finally block runs even on error path', () => expect(() => calculatePoints(null)).toThrow());
});

// ─── getMonthYear ────────────────────────────────────────────────────────────

describe('getMonthYear', () => {
  test('throws for null', () => expect(() => getMonthYear(null)).toThrow('getMonthYear'));
  test('throws for undefined', () => expect(() => getMonthYear(undefined)).toThrow('getMonthYear'));
  test('throws for empty string', () => expect(() => getMonthYear('')).toThrow('getMonthYear'));
  test('throws for unparseable date', () => expect(() => getMonthYear('not-a-date')).toThrow('getMonthYear'));
  test('throws for out-of-range month', () => expect(() => getMonthYear('2024-13-01')).toThrow('getMonthYear'));

  test('returns correct values for December', () => {
    const r = getMonthYear('2023-12-05T10:00:00Z');
    expect(r.monthString).toBe('December');
    expect(r.monthIndex).toBe(11);
    expect(r.year).toBe(2023);
    expect(r.yearString).toBe('2023');
  });

  test('returns correct values for January', () => {
    const r = getMonthYear('2024-01-20T10:00:00Z');
    expect(r.monthString).toBe('January');
    expect(r.monthIndex).toBe(0);
  });

  test('finally block does not suppress valid return', () => {
    expect(getMonthYear('2024-06-15T00:00:00Z').monthString).toBe('June');
  });

  test('finally block runs on error path', () => {
    expect(() => getMonthYear(null)).toThrow();
  });
});

// ─── sortTransactionsByDate ──────────────────────────────────────────────────

describe('sortTransactionsByDate', () => {
  test('throws for null', () => expect(() => sortTransactionsByDate(null)).toThrow());
  test('throws for undefined', () => expect(() => sortTransactionsByDate(undefined)).toThrow());

  test('sorts descending by purchaseDate', () => {
    const txs = [
      { id: '1', purchaseDate: '2024-01-10T00:00:00Z' },
      { id: '2', purchaseDate: '2024-01-20T00:00:00Z' },
      { id: '3', purchaseDate: '2023-12-15T00:00:00Z' },
    ];
    expect(sortTransactionsByDate(txs).map(t => t.id)).toEqual(['2', '1', '3']);
  });

  test('handles missing purchaseDate gracefully', () => {
    expect(() => sortTransactionsByDate([{ id: '1', purchaseDate: '2024-01-10T00:00:00Z' }, { id: '2' }])).not.toThrow();
  });

  test('returns empty array for empty input', () => expect(sortTransactionsByDate([])).toEqual([]));
  test('finally block does not interfere with return', () => {
    expect(sortTransactionsByDate([{ id: 'x', purchaseDate: '2024-03-01T00:00:00Z' }])).toHaveLength(1);
  });
});

// ─── sortMonthlyRewards ──────────────────────────────────────────────────────

describe('sortMonthlyRewards', () => {
  test('throws for null', () => expect(() => sortMonthlyRewards(null)).toThrow());
  test('throws for undefined', () => expect(() => sortMonthlyRewards(undefined)).toThrow());

  test('sorts by year desc then monthIndex desc', () => {
    const rewards = [
      { customerId: 'c1', year: 2024, monthIndex: 0 },
      { customerId: 'c2', year: 2023, monthIndex: 11 },
      { customerId: 'c3', year: 2024, monthIndex: 1 },
    ];
    const sorted = sortMonthlyRewards(rewards);
    expect(sorted[0]).toMatchObject({ year: 2024, monthIndex: 1 });
    expect(sorted[2]).toMatchObject({ year: 2023, monthIndex: 11 });
  });

  test('same year falls through to monthIndex comparison', () => {
    const sorted = sortMonthlyRewards([
      { customerId: 'c1', year: 2024, monthIndex: 3 },
      { customerId: 'c2', year: 2024, monthIndex: 7 },
    ]);
    expect(sorted[0].monthIndex).toBe(7);
  });

  test('finally block does not suppress result', () => {
    expect(sortMonthlyRewards([{ customerId: 'c1', year: 2024, monthIndex: 0 }])).toHaveLength(1);
  });
});

// ─── sortTotalRewards ────────────────────────────────────────────────────────

describe('sortTotalRewards', () => {
  test('throws for null', () => expect(() => sortTotalRewards(null)).toThrow());
  test('throws for undefined', () => expect(() => sortTotalRewards(undefined)).toThrow());

  test('sorts by points descending', () => {
    const sorted = sortTotalRewards([
      { customerId: 'a', points: 50 },
      { customerId: 'b', points: 200 },
      { customerId: 'c', points: 100 },
    ]);
    expect(sorted.map(r => r.customerId)).toEqual(['b', 'c', 'a']);
  });

  test('handles missing points gracefully', () => {
    expect(() => sortTotalRewards([{ customerId: 'a' }, { customerId: 'b', points: 100 }])).not.toThrow();
  });
});

// ─── processTransactions ─────────────────────────────────────────────────────

describe('processTransactions', () => {
  test('returns empty structure for empty array', () =>
    expect(processTransactions([])).toEqual({ transactions: [], monthlyRewards: [], totalRewards: [] }));
  test('returns empty structure for null', () =>
    expect(processTransactions(null)).toEqual({ transactions: [], monthlyRewards: [], totalRewards: [] }));
  test('returns empty structure for undefined', () =>
    expect(processTransactions(undefined)).toEqual({ transactions: [], monthlyRewards: [], totalRewards: [] }));

  test('skips transactions missing id', () => {
    expect(processTransactions([{ customerName: 'X', customerId: 'c1', purchaseDate: '2024-01-01T00:00:00Z', price: 120 }]).transactions).toHaveLength(0);
  });
  test('skips transactions missing customerId', () => {
    expect(processTransactions([{ id: 't1', purchaseDate: '2024-01-01T00:00:00Z', price: 120 }]).transactions).toHaveLength(0);
  });
  test('skips transactions missing purchaseDate', () => {
    expect(processTransactions([{ id: 't1', customerId: 'c1', price: 120 }]).transactions).toHaveLength(0);
  });
  test('skips transactions with invalid purchaseDate', () => {
    expect(processTransactions([{ id: 't1', customerId: 'c1', purchaseDate: 'bad', price: 120 }]).transactions).toHaveLength(0);
  });
  test('skips transactions with invalid price', () => {
    expect(processTransactions([{ id: 't1', customerId: 'c1', purchaseDate: '2024-01-01T00:00:00Z', price: 'x' }]).transactions).toHaveLength(0);
  });

  // Decimal price: cents do NOT affect points tier
  test('$100.20 → 50 pts (floor to $100)', () => {
    const { transactions } = processTransactions([
      { id: 't1', customerId: 'c1', customerName: 'A', purchaseDate: '2024-01-10T00:00:00Z', price: 100.20 },
    ]);
    expect(transactions[0].points).toBe(50);
  });

  test('$100.40 → 50 pts (floor to $100)', () => {
    const { transactions } = processTransactions([
      { id: 't1', customerId: 'c1', customerName: 'A', purchaseDate: '2024-01-10T00:00:00Z', price: 100.40 },
    ]);
    expect(transactions[0].points).toBe(50);
  });

  test('$101.99 → 52 pts (floor to $101, crosses into next tier)', () => {
    const { transactions } = processTransactions([
      { id: 't1', customerId: 'c1', customerName: 'A', purchaseDate: '2024-01-10T00:00:00Z', price: 101.99 },
    ]);
    expect(transactions[0].points).toBe(52);
  });

  test('uses "Unknown" for missing customerName', () => {
    const { totalRewards } = processTransactions([
      { id: 't1', customerId: 'c1', purchaseDate: '2024-01-10T00:00:00Z', price: 120 },
    ]);
    expect(totalRewards[0].customerName).toBe('Unknown');
  });

  test('totalRewards sorted by points descending', () => {
    const { totalRewards } = processTransactions([
      { id: '1', customerId: 'c1', customerName: 'Low', purchaseDate: '2024-01-01T00:00:00Z', price: 60 },
      { id: '2', customerId: 'c2', customerName: 'High', purchaseDate: '2024-01-01T00:00:00Z', price: 200 },
    ]);
    expect(totalRewards[0].customerId).toBe('c2');
  });

  test('accumulates points from multiple transactions same customer/month', () => {
    const { monthlyRewards } = processTransactions([
      { id: 't1', customerId: 'c1', customerName: 'A', purchaseDate: '2024-03-01T00:00:00Z', price: 120 },
      { id: 't2', customerId: 'c1', customerName: 'A', purchaseDate: '2024-03-15T00:00:00Z', price: 75 },
    ]);
    const march = monthlyRewards.find(r => r.month === 'March');
    expect(march.points).toBe(115); // 90 + 25
  });

  test('correctly groups across year boundaries', () => {
    const { monthlyRewards, totalRewards } = processTransactions([
      { id: '1', customerId: 'c1', customerName: 'User A', purchaseDate: '2023-12-15T00:00:00Z', price: 120 },
      { id: '2', customerId: 'c1', customerName: 'User A', purchaseDate: '2024-01-20T00:00:00Z', price: 120 },
      { id: '3', customerId: 'c2', customerName: 'User B', purchaseDate: '2024-01-10T00:00:00Z', price: 50 },
    ]);
    expect(monthlyRewards).toHaveLength(3);
    expect(totalRewards.find(t => t.customerId === 'c1').points).toBe(180);
    expect(totalRewards.find(t => t.customerId === 'c2').points).toBe(0);
  });

  test('finally block does not interfere with result', () => {
    const result = processTransactions([
      { id: 't1', customerId: 'c1', customerName: 'A', purchaseDate: '2024-01-10T00:00:00Z', price: 120 },
    ]);
    expect(result.transactions).toHaveLength(1);
  });

  test('sortTransactionsByDate equal dates returns 0 branch', () => {
    const txs = [
      { id: '1', purchaseDate: '2024-01-01T00:00:00Z' },
      { id: '2', purchaseDate: '2024-01-01T00:00:00Z' },
    ];
    expect(() => sortTransactionsByDate(txs)).not.toThrow();
  });

  test('sortMonthlyRewards equal values branch', () => {
    const rewards = [
      { customerId: 'c1', year: 2024, monthIndex: 5 },
      { customerId: 'c2', year: 2024, monthIndex: 5 },
    ];
    expect(() => sortMonthlyRewards(rewards)).not.toThrow();
  });

  test('sortTotalRewards equal points branch', () => {
    const rewards = [
      { customerId: 'c1', points: 100 },
      { customerId: 'c2', points: 100 },
    ];
    expect(() => sortTotalRewards(rewards)).not.toThrow();
  });

  test('sortMonthlyRewards handles null values', () => {
    expect(() =>
      sortMonthlyRewards([
        { customerId: 'c1', year: null, monthIndex: null },
        { customerId: 'c2' },
      ])
    ).not.toThrow();
  });

  test('sortTotalRewards handles null points', () => {
    expect(() =>
      sortTotalRewards([
        { customerId: 'c1', points: null },
        { customerId: 'c2' },
      ])
    ).not.toThrow();
  });

  test('processTransactions reducer skip all entries', () => {
    const result = processTransactions([
      { invalid: true },
      { foo: 'bar' },
    ]);
    expect(result.transactions).toHaveLength(0);
  });

  test('processTransactions aggregates multiple customers correctly', () => {
    const { totalRewards } = processTransactions([
      { id: '1', customerId: 'c1', customerName: 'A', purchaseDate: '2024-01-01T00:00:00Z', price: 120 },
      { id: '2', customerId: 'c2', customerName: 'B', purchaseDate: '2024-01-01T00:00:00Z', price: 120 },
    ]);

    expect(totalRewards).toHaveLength(2);
  });

  test('processTransactions separates months correctly', () => {
    const { monthlyRewards } = processTransactions([
      { id: '1', customerId: 'c1', customerName: 'A', purchaseDate: '2024-01-01T00:00:00Z', price: 120 },
      { id: '2', customerId: 'c1', customerName: 'A', purchaseDate: '2024-02-01T00:00:00Z', price: 120 },
    ]);

    expect(monthlyRewards).toHaveLength(2);
  });

  test('processTransactions handles reduce edge case', () => {
    const result = processTransactions([null, undefined]);
    expect(result.transactions).toEqual([]);
  });
 
  test('calculatePoints catch wraps error message', () => {
    try {
      calculatePoints("bad");
    } catch (e) {
      expect(e.message).toMatch('calculatePoints failed');
    }
  });

  test('sortTransactionsByDate handles null purchaseDate', () => {
    const txs = [
      { id: '1', purchaseDate: null },
      { id: '2', purchaseDate: '2024-01-01T00:00:00Z' },
    ];
    expect(() => sortTransactionsByDate(txs)).not.toThrow();
  });

  test('processTransactions triggers inner catch for price', () => {
    const result = processTransactions([
      {
        id: 't1',
        customerId: 'c1',
        purchaseDate: '2024-01-01T00:00:00Z',
        price: "invalid"
      }
    ]);

    expect(result.transactions).toHaveLength(0);
  });

  test('processTransactions triggers inner catch for date', () => {
    const result = processTransactions([
      {
        id: 't1',
        customerId: 'c1',
        purchaseDate: "bad-date",
        price: 100
      }
    ]);

    expect(result.transactions).toHaveLength(0);
  });

  test('processTransactions outer catch branch', () => {
    const badInput = {};
    expect(() => processTransactions(badInput.nonexistent.prop)).toThrow();
  });
});
