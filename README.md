# Rewards App

A fully functional React JS application that calculates and displays reward points for customers based on their transactions over a three-month period.

## Features

- **Transaction Processing**: Calculates reward points for purchases (2 pts for every $1 over $100, 1 pt for $1 between $50-$100).
- **Data Aggregation**: Groups and aggregates points by customer, month, and year.
- **Glassmorphic UI**: Vibrant, premium dashboard design using modern frontend tooling and custom CSS variables.
- **Authentication**: Simulated login and logout flow.
- **Loading & Error States**: Graceful handling of network latency and errors, with retry mechanisms.
- **Mock Backend**: Uses `json-server` for simulating an asynchronous API without any external dependencies. Contains test data for three consecutive months (Dec, Jan, Feb).

## Prerequisites
- Node.js (v20+ recommended)

## Setup and Installation

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the mock backend server (`json-server`) on port 3001:
   ```bash
   npx json-server --watch db.json --port 3001
   ```
3. In a separate terminal, start the React frontend:
   ```bash
   npm run dev
   ```

## Project Architecture and High-Level Approach

This application focuses on **Separation of Concerns** and **Performance Optimization**:

-   **Data Processing Layer (`/src/utils/dataProcessor.js`)**: All aggregation and calculation logic is strictly functional. We use `.reduce()` to transform the raw transaction list into a structured graph of Monthly and Total rewards without mutating any original data.
-   **State Management**: Instead of using Redux (per requirement), we consolidated the dashboard's operational state into a single object in `Dashboard.jsx`. This reduces "state jitter" and ensures synchronous UI updates.
-   **Pure Functional calculation**: Points are calculated atomistically for each transaction, allowing for easy testing and debugging of decimal-sensitive prices.
-   **Styling**: A bespoke glassmorphism theme was built using material UI for a premium, tailored aesthetic.

## Running Tests

The project includes a comprehensive test suite using **Jest**. These tests validate:
- Boundary conditions for point calculations ($50, $100, $0).
- Decimal price handling (e.g. 100.2$ -> 50 points).
- Multi-year/multi-month aggregation accuracy.

Run the tests with:
```bash
npm run test
```

## Setup and Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Start Backend Server**:
   ```bash
   npx json-server --watch db.json --port 3001
   ```
3. **Start Frontend Server**:
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:5173`. Use any name (e.g., Alice Smith) to login.
