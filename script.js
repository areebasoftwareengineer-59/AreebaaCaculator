const result = document.getElementById("result");
const expression = document.getElementById("expression");
const preview = document.getElementById("preview");
const historyList = document.getElementById("historyList");
const clearHistory = document.getElementById("clearHistory");

let currentInput = "";
let previousExpression = "";
let justCalculated = false;
let history = [];

const buttons = document.querySelectorAll(".keypad button");

buttons.forEach(button => {
    button.addEventListener("click", () => {
        const value = button.dataset.value;
        const action = button.dataset.action;

        if (value !== undefined) {
            addValue(value);
        }

        if (action === "clear") {
            clearCalculator();
        }

        if (action === "backspace") {
            backspace();
        }

        if (action === "sign") {
            toggleSign();
        }

        if (action === "percent") {
            percentage();
        }

        if (action === "calculate") {
            calculate();
        }
    });
});

function addValue(value) {
    if (justCalculated) {
        if (isOperator(value)) {
            currentInput = result.textContent + value;
        } else {
            currentInput = value;
        }

        justCalculated = false;
    }

    if (isOperator(value)) {
        addOperator(value);
        return;
    }

    if (value === ".") {
        const parts = currentInput.split(/[+\-*/]/);
        const lastNumber = parts[parts.length - 1];

        if (lastNumber.includes(".")) {
            return;
        }

        if (lastNumber === "") {
            currentInput += "0.";
        } else {
            currentInput += ".";
        }

        updateDisplay();
        return;
    }

    currentInput += value;

    updateDisplay();
}

function addOperator(operator) {
    if (currentInput === "") {
        if (operator === "-") {
            currentInput = "-";
            updateDisplay();
        }
        return;
    }

    if (isOperator(currentInput.slice(-1))) {
        currentInput = currentInput.slice(0, -1) + operator;
    } else {
        currentInput += operator;
    }

    justCalculated = false;
    updateDisplay();
}

function isOperator(value) {
    return ["+", "-", "*", "/"].includes(value);
}

function updateDisplay() {
    expression.textContent = currentInput
        .replace(/\*/g, " × ")
        .replace(/\//g, " ÷ ")
        .replace(/\+/g, " + ");

    if (currentInput === "") {
        result.textContent = "0";
        preview.textContent = "";
        expression.textContent = "Ready";
        return;
    }

    result.textContent = getLastNumber(currentInput);

    const calculated = calculateExpression(currentInput);

    if (calculated !== null && !isOperator(currentInput.slice(-1))) {
        preview.textContent = "= " + formatNumber(calculated);
    } else {
        preview.textContent = "";
    }
}

function getLastNumber(value) {
    const parts = value.split(/[+\-*/]/);
    return parts[parts.length - 1] || "0";
}

function calculateExpression(value) {
    if (!value || isOperator(value.slice(-1))) {
        return null;
    }

    try {
        if (!/^[0-9+\-*/. ]+$/.test(value)) {
            return null;
        }

        const answer = Function('"use strict"; return (' + value + ')')();

        if (!Number.isFinite(answer)) {
            return null;
        }

        return answer;
    } catch {
        return null;
    }
}

function calculate() {
    const answer = calculateExpression(currentInput);

    if (answer === null) {
        result.textContent = "Error";
        preview.textContent = "";
        return;
    }

    const formatted = formatNumber(answer);
    const shownExpression = currentInput
        .replace(/\*/g, " × ")
        .replace(/\//g, " ÷ ");

    expression.textContent = shownExpression;
    preview.textContent = "";
    result.textContent = formatted;

    addHistory(shownExpression, formatted);

    currentInput = String(answer);
    previousExpression = shownExpression;
    justCalculated = true;
}

function formatNumber(number) {
    if (Number.isInteger(number)) {
        return number.toLocaleString("en-US");
    }

    return Number(number.toFixed(10)).toLocaleString("en-US");
}

function clearCalculator() {
    currentInput = "";
    previousExpression = "";
    justCalculated = false;

    expression.textContent = "Ready";
    preview.textContent = "";
    result.textContent = "0";
}

function backspace() {
    if (justCalculated) {
        clearCalculator();
        return;
    }

    currentInput = currentInput.slice(0, -1);

    updateDisplay();
}

function toggleSign() {
    if (currentInput === "") {
        currentInput = "-";
        updateDisplay();
        return;
    }

    const match = currentInput.match(/(-?\d*\.?\d+)$/);

    if (!match) {
        return;
    }

    const number = match[0];
    const start = match.index;

    const newNumber = number.startsWith("-")
        ? number.substring(1)
        : "-" + number;

    currentInput =
        currentInput.substring(0, start) + newNumber;

    updateDisplay();
}

function percentage() {
    const match = currentInput.match(/(\d*\.?\d+)$/);

    if (!match) {
        return;
    }

    const number = parseFloat(match[0]);
    const percentageValue = number / 100;

    currentInput =
        currentInput.substring(0, match.index) +
        percentageValue;

    updateDisplay();
}

function addHistory(exp, answer) {
    history.unshift({
        expression: exp,
        result: answer
    });

    if (history.length > 8) {
        history.pop();
    }

    renderHistory();
}

function renderHistory() {
    if (history.length === 0) {
        historyList.innerHTML = `
            <div class="empty-history">
                <div class="history-icon">◌</div>
                <p>No calculations yet</p>
                <span>Your results will appear here</span>
            </div>
        `;

        return;
    }

    historyList.innerHTML = "";

    history.forEach((item, index) => {
        const historyItem = document.createElement("div");

        historyItem.className = "history-item";

        historyItem.innerHTML = `
            <div class="history-expression">
                ${item.expression}
            </div>
            <div class="history-result">
                = ${item.result}
            </div>
        `;

        historyItem.addEventListener("click", () => {
            result.textContent = item.result;
            currentInput = item.result.replace(/,/g, "");
            justCalculated = true;
        });

        historyList.appendChild(historyItem);
    });
}

clearHistory.addEventListener("click", () => {
    history = [];
    renderHistory();
});

document.addEventListener("keydown", event => {
    const key = event.key;

    if (/^[0-9.]$/.test(key)) {
        addValue(key);
        return;
    }

    if (["+", "-", "*", "/"].includes(key)) {
        addValue(key);
        return;
    }

    if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculate();
        return;
    }

    if (key === "Backspace") {
        backspace();
        return;
    }

    if (key === "Escape" || key.toLowerCase() === "c") {
        clearCalculator();
        return;
    }

    if (key === "%") {
        percentage();
    }
});