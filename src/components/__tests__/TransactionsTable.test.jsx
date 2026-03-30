import { render, screen } from "@testing-library/react";
import TransactionsTable from "../TransactionsTable";

describe("TransactionsTable", () => {
  const mockTransactions = [
    {
      id: "t1",
      customerId: "u1",
      customerName: "Alice Smith",
      purchaseDate: "2023-12-05T10:00:00Z",
      productPurchased: "Laptop",
      price: 151
    },
  ];

  test("renders transactions correctly", () => {
    render(<TransactionsTable transactions={mockTransactions} />);
    // check amounts
    expect(screen.getByText(/151/)).toBeInTheDocument();

    // check description (if exists in your UI)
    expect(screen.getByText(/Recent transactions/i)).toBeInTheDocument();
  });

  test("renders empty state when no transactions", () => {
    render(<TransactionsTable transactions={[]} />);

    expect(screen.getByText(/No transactions/i)).toBeInTheDocument();
  });
});