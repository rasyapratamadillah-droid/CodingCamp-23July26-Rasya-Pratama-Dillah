// Elemen
const balance = document.getElementById('balance');
const form = document.getElementById('transaction-form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const category = document.getElementById('category');
const list = document.getElementById('list');
const sortOptions = document.getElementById('sort-options');
const themeToggle = document.getElementById('theme-toggle');
const ctx = document.getElementById('expenseChart').getContext('2d');

// LocalStg Setup
const localStorageTransactions = JSON.parse(localStorage.getItem('transactions'));
let transactions = localStorage.getItem('transactions') !== null ? localStorageTransactions : [];

// Chart
let expenseChart;

// Initialize App
function init() {
    list.innerHTML = '';
    
    // Sort transactions
    const sortedTransactions = getSortedTransactions();
    sortedTransactions.forEach(addTransactionDOM);
    
    updateValues();
    updateChart();
    
    // Check Dark Mode
    if(localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

// Add Transaction
function addTransaction(e) {
    e.preventDefault();

    if (text.value.trim() === '' || amount.value.trim() === '' || category.value === '') {
        alert('Please add text, amount, and category');
        return;
    }

    const transaction = {
        id: generateID(),
        text: text.value,
        amount: +amount.value,
        category: category.value,
        date: new Date().getTime()
    };

    transactions.push(transaction);
    updateLocalStorage();
    init();

    text.value = '';
    amount.value = '';
    category.value = '';
}

// Generate Random ID
function generateID() {
    return Math.floor(Math.random() * 100000000);
}

// Add transaction to DOM list
function addTransactionDOM(transaction) {
    const el = document.createElement('li');
    
    // Optional Challenge: Highlight spending over $50
    if(transaction.amount > 50) {
        el.classList.add('high-expense');
    }

    el.innerHTML = `
        <div class="item-info">
            <span class="item-name">${transaction.text}</span>
            <span class="item-category">${transaction.category}</span>
        </div>
        <div style="display:flex; align-items:center; gap: 15px;">
            <span class="item-amount">$${transaction.amount.toFixed(2)}</span>
            <button class="delete-btn" onclick="removeTransaction(${transaction.id})">Delete</button>
        </div>
    `;
    list.appendChild(el);
}

// Update Total Balance
function updateValues() {
    const amounts = transactions.map(transaction => transaction.amount);
    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
    balance.innerText = `$${total}`;
}

// Remove Transaction
function removeTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    updateLocalStorage();
    init();
}

// Update Local Storage
function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Optional Challenge: Sorting Logic
function getSortedTransactions() {
    const sortType = sortOptions.value;
    let tempArr = [...transactions];

    if (sortType === 'amount-desc') {
        tempArr.sort((a, b) => b.amount - a.amount);
    } else if (sortType === 'amount-asc') {
        tempArr.sort((a, b) => a.amount - b.amount);
    } else if (sortType === 'category') {
        tempArr.sort((a, b) => a.category.localeCompare(b.category));
    } else {
        // default by date (newest first)
        tempArr.sort((a, b) => b.date - a.date);
    }
    return tempArr;
}

// Update Chart.js
function updateChart() {
    const categoryTotals = {
        Food: 0,
        Transport: 0,
        Fun: 0
    };

    transactions.forEach(t => {
        if(categoryTotals[t.category] !== undefined) {
            categoryTotals[t.category] += t.amount;
        }
    });

    const data = [categoryTotals.Food, categoryTotals.Transport, categoryTotals.Fun];

    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Food', 'Transport', 'Fun'],
            datasets: [{
                data: data,
                backgroundColor: ['#4CAF50', '#2196F3', '#FF9800'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// Optional Challenge: Dark Mode Toggle
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if(document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});

// Event Listeners
form.addEventListener('submit', addTransaction);
sortOptions.addEventListener('change', init);

// Run init
init();