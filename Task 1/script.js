// DOM Elements
const expenseForm = document.getElementById("expense-form");
const expenseTitle = document.getElementById("expense-title");
const expenseAmount = document.getElementById("expense-amount");
const expenseCategory = document.getElementById("expense-category");
const expenseDate = document.getElementById("expense-date");
const expensesList = document.getElementById("expenses");
const expenseChartCanvas = document.getElementById("expense-chart");
const incomeForm = document.getElementById("income-form");
const incomeAmount = document.getElementById("income-amount");
const balanceAmountElement = document.getElementById("balance-amount");
const searchInput = document.getElementById("search-input");

// Expense Data and Balance
let expenses = [];
let balance = 0;
let isEditing = false;
let editingIndex = null;

// Add Income
incomeForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const income = parseFloat(incomeAmount.value);
  if (isNaN(income) || income <= 0) {
    alert("Please enter a valid income amount.");
    return;
  }

  balance += income;
  balanceAmountElement.textContent = balance.toFixed(2);
  incomeForm.reset();
});

// Add or Edit Expense
expenseForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = expenseTitle.value;
  const amount = parseFloat(expenseAmount.value);
  const category = expenseCategory.value;
  const date = expenseDate.value;

  if (!title || isNaN(amount) || amount <= 0) {
    alert("Please provide valid inputs.");
    return;
  }

  if (isEditing) {
    const prevAmount = expenses[editingIndex].amount;
    balance += prevAmount - amount;
    expenses[editingIndex] = { title, amount, category , date };
    isEditing = false;
    editingIndex = null;
  } else {
    if (balance - amount < 0) {
      alert("Insufficient balance!");
      return;
    }
    balance -= amount;
    expenses.push({ title, amount, category, date });
  }

  balanceAmountElement.textContent = balance.toFixed(2);
  updateExpenseList();
  updateChart();
  expenseForm.reset();
  expenseDate.value = "";
});

// Filter Expenses
function filterExpenses() {
  const searchQuery = searchInput.value.toLowerCase();
  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.title.toLowerCase().includes(searchQuery) ||
      expense.category.toLowerCase().includes(searchQuery)
  );
  updateExpenseList(filteredExpenses);
}

// Update Expense List
function updateExpenseList(filteredExpenses = expenses) {
  expensesList.innerHTML = "";

  if (filteredExpenses.length === 0) {
    const noExpensesMessage = document.createElement("li");
    noExpensesMessage.textContent = "No expenses";
    noExpensesMessage.style.textAlign = "center";
    expensesList.appendChild(noExpensesMessage);
  } else {
    filteredExpenses.forEach((expense, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
                    <span>${expense.title} (${
        expense.category
      }) - ₹${expense.amount.toFixed(2)} ${expense.date}</span>
                    <div class="button-container">
                        <button class="edit-btn" onclick="editExpense(${index})">Edit</button>
                        <button class="delete-btn" onclick="deleteExpense(${index})">Delete</button>
                    </div>
                `;
      expensesList.appendChild(li);
    });
  }
}

// Edit Expense
function editExpense(index) {
  const expense = expenses[index];
  expenseTitle.value = expense.title;
  expenseAmount.value = expense.amount;
  expenseCategory.value = expense.category;
  expenseDate.value = expense.date;

  isEditing = true;
  editingIndex = index;
}

// Delete Expense
function deleteExpense(index) {
  const expense = expenses[index];
  expenses.splice(index, 1);
  balance += expense.amount;
  balanceAmountElement.textContent = balance.toFixed(2);

  updateExpenseList();
  updateChart();
}

// Update Chart
let expenseChartInstance;
function updateChart() {
  const ctx = expenseChartCanvas.getContext("2d");

  const categories = [...new Set(expenses.map((expense) => expense.category))];
  const categoryTotals = categories.map((category) =>
    expenses
      .filter((expense) => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0)
  );

  if (expenseChartInstance) {
    expenseChartInstance.destroy();
  }

  expenseChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: categories,
      datasets: [
        {
          label: "Expenses by Category",
          data: categoryTotals,
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4CAF50",
            "#AB47BC",
            "#26C6DA",
            "#EC407A",
            "#78909C",
            "#FFA726",
            "#8D6E63",
            "#66BB6A",
            "#BA68C8",
            "#29B6F6",
            "#EF5350",
            "#FF7043",
          ],
          borderColor: "#121212",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
          maintainAspectRatio: false, // Allow custom height
          labels: {
            color: "#121212",
          },
        },
      },
    },
  });
}
