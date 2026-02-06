let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function saveData() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

function addTransaction() {

    let desc = document.getElementById("desc").value;
    let amount = document.getElementById("amount").value;
    let type = document.getElementById("type").value;
    let category = document.getElementById("category").value;
    let date = document.getElementById("date").value;

    if (!desc || !amount || !date) {
        alert("Please fill all fields");
        return;
    }

    let data = { desc, amount: parseFloat(amount), type, category, date };

    transactions.push(data);
    saveData();
    clearForm();
    showData();
}

function clearForm() {
    document.getElementById("desc").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("date").value = "";
}

function showData() {
    filterByMonth();
}

function deleteTransaction(index) {
    transactions.splice(index, 1);
    saveData();
    showData();
}

function editTransaction(index) {

    let item = transactions[index];

    document.getElementById("desc").value = item.desc;
    document.getElementById("amount").value = item.amount;
    document.getElementById("type").value = item.type;
    document.getElementById("category").value = item.category;
    document.getElementById("date").value = item.date;

    deleteTransaction(index);
}

function filterByMonth() {

    let selected = document.getElementById("monthFilter").value;

    let filtered = transactions;

    if (selected !== "all") {
        filtered = transactions.filter(item => {
            return new Date(item.date).getMonth() == selected;
        });
    }

    displayData(filtered);
}

function displayData(data) {

    let table = document.getElementById("table");
    table.innerHTML = "";

    data.forEach((item, index) => {

        table.innerHTML += `
        <tr>
            <td>${item.desc}</td>
            <td class="${item.type === 'Income' ? 'income' : 'expense'}">${item.amount}</td>
            <td>${item.type}</td>
            <td>${item.category}</td>
            <td>${item.date}</td>
            <td>
                <button onclick="editTransaction(${index})">Edit</button>
                <button onclick="deleteTransaction(${index})">Delete</button>
            </td>
        </tr>`;
    });

    updateStats(data);
    categoryReport(data);
    drawChart(data);
}

function updateStats(data) {

    let income = 0, expense = 0;

    data.forEach(item => {
        if (item.type === "Income") income += item.amount;
        else expense += item.amount;
    });

    document.getElementById("income").innerText = income;
    document.getElementById("expense").innerText = expense;
    document.getElementById("balance").innerText = income - expense;
}

/* CATEGORY REPORT */

function categoryReport(data) {

    let report = {};

    data.forEach(item => {
        if (!report[item.category]) {
            report[item.category] = 0;
        }
        report[item.category] += item.amount;
    });

    let output = document.getElementById("categoryReport");
    output.innerHTML = "";

    for (let key in report) {
        output.innerHTML += `<li>${key} : ${report[key]}</li>`;
    }
}

/* CHART */

function drawChart(data) {

    let income = 0, expense = 0;

    data.forEach(item => {
        if (item.type === "Income") income += item.amount;
        else expense += item.amount;
    });

    let ctx = document.getElementById("expenseChart").getContext("2d");

    new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Income", "Expense"],
            datasets: [{
                data: [income, expense],
                backgroundColor: ["green", "red"]
            }]
        }
    });
}

/* EXPORT EXCEL */

function exportExcel() {

    let csv = "Description,Amount,Type,Category,Date\n";

    transactions.forEach(t => {
        csv += `${t.desc},${t.amount},${t.type},${t.category},${t.date}\n`;
    });

    let blob = new Blob([csv], { type: "text/csv" });

    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "expense_report.csv";
    a.click();
}

/* EXPORT PDF */

function exportPDF() {

    const { jsPDF } = window.jspdf;

    let doc = new jsPDF();

    doc.text("Expense Report", 10, 10);

    let y = 20;

    transactions.forEach(t => {
        doc.text(`${t.desc} - ${t.amount} - ${t.type}`, 10, y);
        y += 10;
    });

    doc.save("expense_report.pdf");
}

/* SEARCH */

function searchTransaction() {

    let input = document.getElementById("search").value.toLowerCase();

    let result = transactions.filter(item =>
        item.desc.toLowerCase().includes(input) ||
        item.category.toLowerCase().includes(input)
    );

    displayData(result);
}

/* THEME */

function toggleTheme() {

    document.body.classList.toggle("dark");

    let btn = document.getElementById("themeBtn");

    if (document.body.classList.contains("dark")) {
        btn.innerText = "Light Mode";
    } else {
        btn.innerText = "Dark Mode";
    }
}

showData();
