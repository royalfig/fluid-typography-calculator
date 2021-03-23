const sample = document.querySelector(".sample");
const viewportRadioBtns = document.querySelectorAll('input[name="viewport"]');
const inputs = document.querySelectorAll(".input");
const viewport = document.querySelector("#viewport");
const viewportRem = document.querySelector("#viewport-rem");

const slider = document.querySelector("#slider");
const computed = document.querySelector("#computed");
// slider.addEventListener("change", updateWidth);
slider.addEventListener("input", updateWidth);

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
  console.log(element);
  const helper = element.closest(".field").nextElementSibling;
  if (!element.validity.valid) {
    element.classList.add("is-danger");
    helper.textContent = "Inputs needs to be a number followed by px or rem.";
    helper.classList.add("is-danger");
    return true;
  } else {
    element.classList.remove("is-danger");
    helper.textContent = "";
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
    targetEl.textContent = text;
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
  const css = clamp;
  calcInput.textContent = css;

  // Enter the simulation
  const simulatedVwNum = slider.value;
  viewport.textContent = `${simulatedVwNum}px`;

  viewportRem.textContent = `${simulatedVwNum / 16}rem`;
  const viewportTitle = document.querySelector("#viewport-title");
  viewportTitle.textContent = `${simulatedVwNum}px`;

  const simulatedCalcVw = simulatedVwNum * factor;
  const simulatedCalc = `calc(${calcRem}em + ${simulatedCalcVw}px)`;
  const simulatedClamp = `font-size: ${min}em;
font-size: clamp(${min}em, ${simulatedCalc}, ${max}em);`;
  const simulatedFontSize = (calcRem * 16 + simulatedCalcVw).toFixed(4);
  const clampedSimulatedFontSize = calcInternalClamp(
    simulatedFontSize,
    min * 16,
    max * 16
  );
  computed.textContent = `${clampedSimulatedFontSize}px`;
  computedRem = document.querySelector("#computed-rem");
  computedRem.textContent = `${+(clampedSimulatedFontSize / 16).toFixed(4)}rem`;
  sample.setAttribute("style", simulatedClamp);
}
const viewportIcon = document.querySelectorAll(".viewport-icon");

function determineViewport(num) {
  switch (true) {
    case num <= 768:
      return "mobile";
    case num <= 1023:
      return "tablet";
    case num <= 1407:
      return "laptop";
    default:
      return "desktop";
  }
}
// =mobile
// until 768px
// =tablet
// from 769px
// =tablet-only
// from 769px and until 1023px
// =touch
// until 1023px
// =desktop
// from 1024px
// =desktop-only
// from 1024px and until 1215px
// =widescreen
// from 1216px
// =widescreen-only
// from 1216px and until 1407px
// =fullhd
// from 1408px
function updateWidth(e = slider) {
  console.log(e);
  const val = e.target?.value || e.value;
  const viewport = determineViewport(val);

  viewportIcon.forEach((el) => {
    if (el.classList.contains(viewport)) {
      el.classList.remove("is-hidden");
    } else {
      el.classList.add("is-hidden");
    }

    // if icon is below
  });
  // switch (e.target.value) {
  //   case (<= 375):
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
updateWidth();

function calcInternalClamp(val, min, max) {
  return val <= max && val >= min ? val : val > max ? max : min;
}
