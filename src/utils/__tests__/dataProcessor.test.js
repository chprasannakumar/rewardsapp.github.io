import { calculatePoints, getMonthYear, processTransactions } from '../dataProcessor';

describe('Data Processor - calculatePoints', () => {
  test('returns 0 for purchases under $50', () => {
    expect(calculatePoints(49.99)).toBe(0);
    expect(calculatePoints(50)).toBe(0);
  });

  test('returns 1 point for every dollar between $50 and $100', () => {
    expect(calculatePoints(51)).toBe(1);
    expect(calculatePoints(99.99)).toBe(49);
    expect(calculatePoints(100)).toBe(50);
  });

  test('returns 2 points for every dollar over $100 plus 50 points', () => {
    expect(calculatePoints(101)).toBe(52);
    expect(calculatePoints(120)).toBe(90); // 2*20 + 50
    expect(calculatePoints(200)).toBe(250); // 2*100 + 50
  });

  test('handles decimal values properly as per requirements (floor logic)', () => {
    expect(calculatePoints(100.2)).toBe(50);
    expect(calculatePoints(100.9)).toBe(50);
    expect(calculatePoints(120.9)).toBe(90);
    expect(calculatePoints(120.1)).toBe(90);
    expect(calculatePoints(50.9)).toBe(0);
    expect(calculatePoints(51.1)).toBe(1);
  });
});

describe('Data Processor - getMonthYear and processTransactions', () => {
  test('extracts correct month and year from ISO date strings across year bounds', () => {
    const decDate = getMonthYear('2023-12-05T10:00:00Z');
    expect(decDate.monthString).toBe('December');
    expect(decDate.year).toBe(2023);
    expect(decDate.monthIndex).toBe(11);
    
    const janDate = getMonthYear('2024-01-20T10:00:00Z');
    expect(janDate.monthString).toBe('January');
    expect(janDate.year).toBe(2024);
    expect(janDate.monthIndex).toBe(0);
  });

  test('processTransactions groups properly and avoids breaking on change of dataset', () => {
    const mockData = [
      { id: '1', customerId: 'c1', customerName: 'User A', purchaseDate: '2023-12-15T00:00:00Z', price: 120 },
      { id: '2', customerId: 'c1', customerName: 'User A', purchaseDate: '2024-01-20T00:00:00Z', price: 120.5 },
      { id: '3', customerId: 'c2', customerName: 'User B', purchaseDate: '2024-01-10T00:00:00Z', price: 50.5 }
    ];
    
    const { transactions, monthlyRewards, totalRewards } = processTransactions(mockData);
    
    // Sort logic (descending date)
    expect(transactions[0].id).toBe('2'); // Jan 20
    expect(transactions[1].id).toBe('3'); // Jan 10
    expect(transactions[2].id).toBe('1'); // Dec 15
    
    // Monthly points tests across arbitrary year boundaries
    expect(monthlyRewards.length).toBe(3); // (User A Dec, User A Jan, User B Jan)
    
    const userA_Dec = monthlyRewards.find(r => r.customerId === 'c1' && r.month === 'December');
    expect(userA_Dec.points).toBe(90);
    
    const userA_Jan = monthlyRewards.find(r => r.customerId === 'c1' && r.month === 'January');
    expect(userA_Jan.points).toBe(90); // 120.5 floors to 120 -> 90 points
    
    const userB_Jan = monthlyRewards.find(r => r.customerId === 'c2' && r.month === 'January');
    expect(userB_Jan.points).toBe(0); // 50.5 floors to 50 -> 0 points

    // Total calculation
    expect(totalRewards.find(t => t.customerId === 'c1').points).toBe(180);
    expect(totalRewards.find(t => t.customerId === 'c2').points).toBe(0);
  });
});
