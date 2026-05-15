const form = document.querySelector("#converterForm");
const temperatureInput = document.querySelector("#temperatureInput");
const fromUnit = document.querySelector("#fromUnit");
const toUnit = document.querySelector("#toUnit");
const resultCard = document.querySelector(".result-card");
const resultValue = document.querySelector("#resultValue");
const resultDetail = document.querySelector("#resultDetail");

const units = {
  celsius: {
    label: "Celsius",
    symbol: "\u00b0C",
    minimum: -273.15
  },
  fahrenheit: {
    label: "Fahrenheit",
    symbol: "\u00b0F",
    minimum: -459.67
  },
  kelvin: {
    label: "Kelvin",
    symbol: "K",
    minimum: 0
  }
};

function toCelsius(value, unit) {
  if (unit === "fahrenheit") {
    return (value - 32) * 5 / 9;
  }

  if (unit === "kelvin") {
    return value - 273.15;
  }

  return value;
}

function fromCelsius(value, unit) {
  if (unit === "fahrenheit") {
    return value * 9 / 5 + 32;
  }

  if (unit === "kelvin") {
    return value + 273.15;
  }

  return value;
}

function convertTemperature(value, sourceUnit, targetUnit) {
  const valueInCelsius = toCelsius(value, sourceUnit);
  return fromCelsius(valueInCelsius, targetUnit);
}

function formatTemperature(value, unit) {
  const rounded = Number.parseFloat(value.toFixed(2));
  return `${rounded} ${units[unit].symbol}`;
}

function showError(message) {
  resultCard.classList.add("error");
  resultValue.textContent = "Invalid input";
  resultDetail.textContent = message;
}

function showResult(inputValue, sourceUnit, convertedValue, targetUnit) {
  resultCard.classList.remove("error");
  resultValue.textContent = formatTemperature(convertedValue, targetUnit);
  resultDetail.textContent = `${formatTemperature(inputValue, sourceUnit)} equals ${formatTemperature(convertedValue, targetUnit)}.`;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const inputValue = Number(temperatureInput.value);

  if (temperatureInput.value.trim() === "" || !Number.isFinite(inputValue)) {
    showError("Please enter a valid number before converting.");
    temperatureInput.focus();
    return;
  }

  if (inputValue < units[fromUnit.value].minimum) {
    showError(`${units[fromUnit.value].label} cannot be below ${units[fromUnit.value].minimum} ${units[fromUnit.value].symbol}.`);
    temperatureInput.focus();
    return;
  }

  const convertedValue = convertTemperature(inputValue, fromUnit.value, toUnit.value);
  showResult(inputValue, fromUnit.value, convertedValue, toUnit.value);
});
