const sample = document.querySelector(".sample");
const viewportRadioBtns = document.querySelectorAll('input[name="viewport"]');
const inputs = document.querySelectorAll(".input");
const breakpoints = { mobile: 375, tablet: 768, laptop: 1024, desktop: 1920 };
const viewport = document.querySelector("#viewport");
const slider = document.querySelector("#slider");
const computed = document.querySelector("#computed");
const clampText = document.querySelector("#clamp");
slider.addEventListener("change", updateWidth);

const inputsArray = () =>
  Array.from(inputs).map((el) => {
    const parsed = parseEl(el);
    el.addEventListener("blur", updateEls);
    return parsed;
  });

function unitConversion(obj) {
  const { number, unit } = obj;
  if (unit === "rem") {
    const rem = number + "rem";
    const px = number * 16 + "px";
    return { rem, px };
  }
  const px = number + "px";
  const rem = number / 16 + "rem";
  return { rem, px };
}

function parseValue(str) {
  const num = +str.match(/[\d.]+/) && +str.match(/[\d.]+/)[0];
  const unit = str.match(/[^.\d]+/) && str.match(/[^.\d]+/)[0];
  return { num, unit };
}

function errorHandler(el) {
  const element = getEl(el);
  if (!element.validity.valid) {
    element.classList.add("is-invalid");
    return true;
  } else {
    element.classList.remove("is-invalid");
    return false;
  }
}

function updateEls(el) {
  const error = errorHandler(el);
  if (error) {
    console.log(error);
  }
  parseEl(el);
  calculateClamp();
}

function getEl(el) {
  return el.target ? el.target : el;
}

function parseEl(el) {
  const element = getEl(el);
  const id = element.id;
  const value = element.value;
  const number = parseValue(value).num;
  const unit = parseValue(value).unit;
  const px = unitConversion({ number, unit }).px;
  const rem = unitConversion({ number, unit }).rem;
  const parsed = { el, id, value, number, unit, px, rem };
  updateConversion(parsed);
  return parsed;
}

function updateConversion(obj) {
  const targetEl = document.querySelector(`[data-unit=${obj.id}]`);
  if (targetEl) {
    const text = obj.unit !== "rem" ? obj.rem : obj.px;
    targetEl.value = text;
  }
}

function convertToRem(obj) {
  return obj.unit === "rem" ? obj.number : obj.number / 16;
}

function calculateClamp() {
  const updatedValues = inputsArray();
  const minFs = convertToRem(updatedValues.find((obj) => obj.id === "min-fs"));
  const maxFs = convertToRem(updatedValues.find((obj) => obj.id === "max-fs"));
  const minVw = convertToRem(updatedValues.find((obj) => obj.id === "min-vw"));
  const maxVw = convertToRem(updatedValues.find((obj) => obj.id === "max-vw"));
  const factor = (1 / (maxVw - minVw)) * (maxFs - minFs);
  const calcRem = minFs - minVw * factor;
  const calcVw = 100 * factor;
  const calc = `${calcRem}rem + ${calcVw}vw`;
  const min = Math.min(minFs, maxFs);
  const max = Math.max(minFs, maxFs);
  const clamp = `font-size: ${min}rem;
font-size: clamp(${min}rem, ${calc}, ${max}rem);`;
  const calcInput = document.querySelector("#calc");
  const css = "font-size: " + clamp;
  calcInput.textContent = css;

  // Enter the simulation
  const simulatedVwNum = slider.value;
  viewport.textContent = `Viewport: ${simulatedVwNum}px`;
  clampText.textContent = `font-size: clamp(${min}rem, ${calc}, ${max}rem)`;

  const simulatedCalcVw = simulatedVwNum * factor;
  const simulatedCalc = `calc(${calcRem}em + ${simulatedCalcVw}px)`;
  const simulatedClamp = `font-size: ${min}em;
font-size: clamp(${min}em, ${simulatedCalc}, ${max}em);`;
  const simulatedFontSize = (calcRem * 16 + simulatedCalcVw).toFixed(4);
  computed.textContent = simulatedFontSize;
  sample.setAttribute("style", simulatedClamp);
}

function updateWidth() {
  // switch (e.target.id) {
  //   case "mobile":
  //     sample.style.width = "375px";
  //     break;
  //   case "tablet":
  //     sample.style.width = "768px";
  //     break;
  //   case "laptop":
  //     sample.style.width = "1024px";
  //     break;
  //   case "desktop":
  //     sample.style.width = "1920px";
  //     break;
  //   default:
  //     sample.style.width = "375px";
  //     break;
  // }
  calculateClamp();
}

inputsArray();
calculateClamp();
