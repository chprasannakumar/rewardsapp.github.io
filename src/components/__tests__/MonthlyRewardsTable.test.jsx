import { render, screen } from "@testing-library/react";
import MonthlyRewardsTable from "../MonthlyRewardsTable";

test("renders monthly rewards", () => {
  const mockRewards = [
    {
      customerId: "C001",
      customerName: "John Doe",
      month: "March",
      year: 2026,
      points: 150,
    },
    {
      customerId: "C002",
      customerName: "Jane Smith",
      month: "February",
      year: 2026,
      points: 200,
    },
  ];


  render(<MonthlyRewardsTable rewards={mockRewards} />);

  expect(screen.getByText(/150/)).toBeInTheDocument();
});