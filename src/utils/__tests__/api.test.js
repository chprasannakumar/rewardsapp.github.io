import { fetchTransactions, updateTransaction } from "../api";
import { logger } from "../logger";

// ✅ Mock logger (very important)
jest.mock("../logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe("api.js", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // fetchTransactions success
  test("should fetch and return transactions", async () => {
    const mockResponse = {
      transactions: [
        { id: 1, amount: 100 },
        { id: 2, amount: 200 },
      ],
    };

    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await fetchTransactions();

    expect(fetch).toHaveBeenCalledWith("/db.json");
    expect(result).toEqual(mockResponse.transactions);
    expect(logger.info).toHaveBeenCalledWith(
      "Running in Static Demo Mode"
    );
  });

  // fetchTransactions failure
  test("should throw error when fetch fails", async () => {
    fetch.mockResolvedValue({
      ok: false,
    });

    await expect(fetchTransactions()).rejects.toThrow(
      "Static fetch failed"
    );

    expect(logger.error).toHaveBeenCalled();
  });

  // network error
  test("should handle network error", async () => {
    fetch.mockRejectedValue(new Error("Network Error"));

    await expect(fetchTransactions()).rejects.toThrow(
      "Network Error"
    );

    expect(logger.error).toHaveBeenCalledWith(
      "API error",
      expect.any(Error)
    );
  });

  // updateTransaction
  test("should return static success response", async () => {
    const result = await updateTransaction();

    expect(result).toEqual({
      success: true,
      message: "Read-only mode",
    });

    expect(logger.warn).toHaveBeenCalledWith(
      "Update operation ignored in Static Demo Mode"
    );
  });
});