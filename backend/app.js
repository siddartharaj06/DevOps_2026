const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// In-memory data (simple DB for assignment)
let expenses = [
  { id: 1, title: "Groceries", amount: 500 },
  { id: 2, title: "Fuel", amount: 300 },
];

let income = [
  { id: 1, source: "Salary", amount: 10000 },
  { id: 2, source: "Freelance", amount: 2000 },
];

// Utility: compute dashboard summary
function getDashboardSummary() {
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalIncome = income.reduce((sum, i) => sum + Number(i.amount), 0);
  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
  };
}

// API 1: Dashboard summary
app.get("/api/dashboard", (req, res) => {
  res.json(getDashboardSummary());
});

// API 2: Expenses (GET all)
app.get("/api/expenses", (req, res) => {
  res.json(expenses);
});

// API 2: Expenses (POST create)
app.post("/api/expenses", (req, res) => {
  const { title, amount } = req.body;

  if (!title || amount === undefined) {
    return res.status(400).json({ error: "title and amount are required" });
  }

  const newExpense = {
    id: expenses.length ? expenses[expenses.length - 1].id + 1 : 1,
    title,
    amount: Number(amount),
  };

  expenses.push(newExpense);
  res.status(201).json(newExpense);
});

// API 3: Income (GET all)
app.get("/api/income", (req, res) => {
  res.json(income);
});

// API 3: Income (POST create)
app.post("/api/income", (req, res) => {
  const { source, amount } = req.body;

  if (!source || amount === undefined) {
    return res.status(400).json({ error: "source and amount are required" });
  }

  const newIncome = {
    id: income.length ? income[income.length - 1].id + 1 : 1,
    source,
    amount: Number(amount),
  };

  income.push(newIncome);
  res.status(201).json(newIncome);
});

// Export app for tests
module.exports = app;

// Helper exports for tests (optional)
module.exports._internal = {
  getDashboardSummary,
  _resetData: () => {
    expenses = [
      { id: 1, title: "Groceries", amount: 500 },
      { id: 2, title: "Fuel", amount: 300 },
    ];
    income = [
      { id: 1, source: "Salary", amount: 10000 },
      { id: 2, source: "Freelance", amount: 2000 },
    ];
  },
};