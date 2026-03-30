import { render, screen } from "@testing-library/react";
import TotalRewardsTable from "../TotalRewardsTable";

test("renders total rewards", () => {
  const mockTotalRewards = [
    {
      customerId: "C001",
      customerName: "John Doe",
      points: 150,
    },
    {
      customerId: "C002",
      customerName: "Jane Smith",
      points: 200,
    },
  ];

  render(<TotalRewardsTable rewards={mockTotalRewards} />);

  expect(screen.getByText(/150/)).toBeInTheDocument();
});