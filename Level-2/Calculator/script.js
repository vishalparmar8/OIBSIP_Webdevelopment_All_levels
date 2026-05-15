const display = document.querySelector("#display");
const history = document.querySelector("#history");
const statusText = document.querySelector("#status");
const keys = document.querySelector("#keys");

const operators = ["+", "-", "*", "/"];
const operatorLabels = {
  "+": "+",
  "-": "-",
  "*": "x",
  "/": "/",
};

let expression = "";
let justCalculated = false;

function updateDisplay(message = "Ready") {
  display.textContent = formatExpression(expression) || "0";
  statusText.textContent = message;
}

function formatExpression(value) {
  return value.replaceAll("*", "x");
}

function getLastNumber(value) {
  let start = 0;

  for (let index = value.length - 1; index >= 0; index -= 1) {
    const character = value[index];
    const previous = value[index - 1];
    const unaryMinus = character === "-" && (index === 0 || operators.includes(previous));

    if (operators.includes(character) && !unaryMinus) {
      start = index + 1;
      break;
    }
  }

  return value.slice(start);
}

function appendValue(value) {
  if (justCalculated && !operators.includes(value)) {
    expression = "";
    history.textContent = "";
  }

  justCalculated = false;

  if (value === ".") {
    const lastNumber = getLastNumber(expression);

    if (lastNumber.includes(".")) {
      updateDisplay("Already decimal");
      return;
    }

    expression += lastNumber === "" || operators.includes(expression.at(-1)) ? "0." : ".";
    updateDisplay();
    return;
  }

  if (operators.includes(value)) {
    handleOperator(value);
    return;
  }

  expression += value;
  updateDisplay();
}

function handleOperator(operator) {
  if (expression === "") {
    if (operator === "-") {
      expression = "-";
    }

    updateDisplay();
    return;
  }

  const lastCharacter = expression.at(-1);

  if (operators.includes(lastCharacter)) {
    const endsWithUnaryMinus = lastCharacter === "-" && (expression.length === 1 || operators.includes(expression.at(-2)));

    if (operator === "-" && !endsWithUnaryMinus) {
      expression += operator;
    } else if (endsWithUnaryMinus && expression.length > 1) {
      expression = expression.slice(0, -2) + operator;
    } else if (!endsWithUnaryMinus) {
      expression = expression.slice(0, -1) + operator;
    }
  } else {
    expression += operator;
  }

  updateDisplay(operatorLabels[operator]);
}

function clearCalculator() {
  expression = "";
  history.textContent = "";
  justCalculated = false;
  updateDisplay("Cleared");
}

function deleteLast() {
  if (justCalculated) {
    clearCalculator();
    return;
  }

  expression = expression.slice(0, -1);
  updateDisplay("Deleted");
}

function applyPercent() {
  const lastNumber = getLastNumber(expression);

  if (lastNumber === "" || lastNumber === "-") {
    updateDisplay("Enter number");
    return;
  }

  expression = expression.slice(0, expression.length - lastNumber.length) + String(Number(lastNumber) / 100);
  updateDisplay("Percent");
}

function toggleSign() {
  const lastNumber = getLastNumber(expression);
  const start = expression.length - lastNumber.length;

  if (lastNumber === "") {
    expression += "-";
  } else if (lastNumber.startsWith("-")) {
    expression = expression.slice(0, start) + lastNumber.slice(1);
  } else {
    expression = expression.slice(0, start) + `-${lastNumber}`;
  }

  updateDisplay("Sign");
}

function calculate() {
  if (expression === "" || expression === "-" || operators.includes(expression.at(-1))) {
    updateDisplay("Incomplete");
    return;
  }

  const result = evaluateExpression(expression);

  if (result === null || !Number.isFinite(result)) {
    updateDisplay("Error");
    return;
  }

  history.textContent = `${formatExpression(expression)} =`;
  expression = trimResult(result);
  justCalculated = true;
  updateDisplay("Result");
}

function evaluateExpression(value) {
  const tokens = tokenize(value);

  if (!tokens) {
    return null;
  }

  for (let index = 1; index < tokens.length - 1; index += 2) {
    if (tokens[index] === "*" || tokens[index] === "/") {
      const left = tokens[index - 1];
      const right = tokens[index + 1];
      const total = tokens[index] === "*" ? left * right : left / right;

      tokens.splice(index - 1, 3, total);
      index -= 2;
    }
  }

  let total = tokens[0];

  for (let index = 1; index < tokens.length - 1; index += 2) {
    if (tokens[index] === "+") {
      total += tokens[index + 1];
    } else if (tokens[index] === "-") {
      total -= tokens[index + 1];
    }
  }

  return total;
}

function tokenize(value) {
  const tokens = [];
  let currentNumber = "";

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    const previous = value[index - 1];
    const unaryMinus = character === "-" && (index === 0 || operators.includes(previous));

    if (/\d|\./.test(character) || unaryMinus) {
      currentNumber += character;
    } else if (operators.includes(character)) {
      if (currentNumber === "" || currentNumber === "-") {
        return null;
      }

      tokens.push(Number(currentNumber), character);
      currentNumber = "";
    }
  }

  if (currentNumber === "" || currentNumber === "-") {
    return null;
  }

  tokens.push(Number(currentNumber));

  for (const token of tokens) {
    if (Number.isNaN(token)) {
      return null;
    }
  }

  return tokens;
}

function trimResult(number) {
  return Number.parseFloat(number.toFixed(10)).toString();
}

function flashKey(selector) {
  const key = document.querySelector(selector);

  if (!key) {
    return;
  }

  key.classList.add("is-pressed");
  window.setTimeout(() => key.classList.remove("is-pressed"), 120);
}

keys.addEventListener("click", (event) => {
  const key = event.target.closest("button");

  if (!key) {
    return;
  }

  if (key.dataset.value) {
    appendValue(key.dataset.value);
  } else if (key.dataset.action === "clear") {
    clearCalculator();
  } else if (key.dataset.action === "delete") {
    deleteLast();
  } else if (key.dataset.action === "percent") {
    applyPercent();
  } else if (key.dataset.action === "toggle-sign") {
    toggleSign();
  } else if (key.dataset.action === "calculate") {
    calculate();
  }
});

window.addEventListener("keydown", (event) => {
  const key = event.key;

  if (/^\d$/.test(key) || key === ".") {
    appendValue(key);
    flashKey(`[data-value="${key}"]`);
  } else if (operators.includes(key)) {
    appendValue(key);
    flashKey(`[data-value="${key}"]`);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculate();
    flashKey('[data-action="calculate"]');
  } else if (key === "Backspace") {
    deleteLast();
    flashKey('[data-action="delete"]');
  } else if (key === "Escape") {
    clearCalculator();
    flashKey('[data-action="clear"]');
  } else if (key === "%") {
    applyPercent();
    flashKey('[data-action="percent"]');
  }
});

updateDisplay();
