const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

const totalIncomeEl = document.getElementById('totalIncome');
const totalExpensesEl = document.getElementById('totalExpenses');
const balanceEl = document.getElementById('balance');
const expensesList = document.getElementById('expensesList');
const incomeList = document.getElementById('incomeList');
const refreshBtn = document.getElementById('refresh');

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || 'Request failed');
  }
  return res.json();
}

function renderList(target, items, labelKey) {
  target.innerHTML = '';
  items.slice(-10).reverse().forEach((item) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${item[labelKey]}</span>
      <strong>${currency.format(item.amount)}</strong>
    `;
    target.appendChild(li);
  });
}

async function loadDashboard() {
  const [summary, expenses, income] = await Promise.all([
    fetchJSON('/api/dashboard'),
    fetchJSON('/api/expenses'),
    fetchJSON('/api/income'),
  ]);

  totalIncomeEl.textContent = currency.format(summary.totalIncome);
  totalExpensesEl.textContent = currency.format(summary.totalExpenses);
  balanceEl.textContent = currency.format(summary.balance);

  renderList(expensesList, expenses, 'title');
  renderList(incomeList, income, 'source');
}

async function handleCreate(form, endpoint) {
  const data = Object.fromEntries(new FormData(form));
  data.amount = Number(data.amount);

  await fetchJSON(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  form.reset();
  await loadDashboard();
}

refreshBtn.addEventListener('click', loadDashboard);

document.getElementById('expenseForm').addEventListener('submit', (event) => {
  event.preventDefault();
  handleCreate(event.target, '/api/expenses');
});

document.getElementById('incomeForm').addEventListener('submit', (event) => {
  event.preventDefault();
  handleCreate(event.target, '/api/income');
});

loadDashboard().catch((err) => {
  balanceEl.textContent = 'Error';
  console.error(err);
});
