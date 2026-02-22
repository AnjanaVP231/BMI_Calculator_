/**
 * BMI Calculator — script.js
 * Handles validation, BMI calculation, age-adjusted category logic, and UI updates.
 *
 * Age-group logic (WHO / CDC guidelines):
 *   • Children & Teens  (2 – 17 yrs) : Standard BMI formula; note that clinical
 *       assessment uses BMI-for-age percentiles. We display the value but warn the user.
 *       Approximate percentile-based thresholds used here:
 *         Underweight  < 5th  ≈ BMI < 14  (simplified)
 *         Healthy      5th–84th ≈ BMI 14–21 (simplified)
 *         Overweight   85th–94th ≈ BMI 21–25 (simplified)
 *         Obese        ≥ 95th   ≈ BMI ≥ 25  (simplified)
 *   • Adults    (18 – 64 yrs) : Standard WHO thresholds (18.5 / 25 / 30)
 *   • Seniors   (65 +  yrs)   : Slightly elevated normal range (22 – 27)
 *       as recommended by several geriatric health associations
 */

// ─────────────────────────────────────────────
//  DOM Element References
// ─────────────────────────────────────────────
const form = document.getElementById("bmi-form");
const weightInput = document.getElementById("weight");
const heightInput = document.getElementById("height");
const ageInput = document.getElementById("age");
const weightError = document.getElementById("weight-error");
const heightError = document.getElementById("height-error");
const ageError = document.getElementById("age-error");
const resultSection = document.getElementById("result-section");
const bmiValue = document.getElementById("bmi-value");
const bmiBadge = document.getElementById("bmi-badge");
const bmiCategory = document.getElementById("bmi-category");
const ageGroupChip = document.getElementById("age-group-chip");
const ageNoteEl = document.getElementById("age-note");
const scaleIndicator = document.getElementById("scale-indicator");
const resetBtn = document.getElementById("reset-btn");
const healthyRangeEl = document.getElementById("healthy-range");
const weightSuggestion = document.getElementById("weight-suggestion");
const adviceMessage = document.getElementById("advice-message");
const refTitleText = document.getElementById("ref-title-text");

// ─────────────────────────────────────────────
//  BMI Category Configurations
// ─────────────────────────────────────────────
const CATEGORIES = {
  underweight: {
    key: "underweight",
    label: "Underweight",
    colorClass: "color-underweight",
    badgeClass: "badge-underweight",
    scaleColor: "#3b82f6",
  },
  normal: {
    key: "normal",
    label: "Normal Weight",
    colorClass: "color-normal",
    badgeClass: "badge-normal",
    scaleColor: "#22c55e",
  },
  overweight: {
    key: "overweight",
    label: "Overweight",
    colorClass: "color-overweight",
    badgeClass: "badge-overweight",
    scaleColor: "#f97316",
  },
  obese: {
    key: "obese",
    label: "Obese",
    colorClass: "color-obese",
    badgeClass: "badge-obese",
    scaleColor: "#ef4444",
  },
};

// ─────────────────────────────────────────────
//  Age Group Detection
// ─────────────────────────────────────────────
/**
 * Returns an age-group descriptor object based on the user's age.
 * @param {number} age
 * @returns {{ group: string, label: string, emoji: string,
 *             bmiLow: number, bmiHigh: number,
 *             healthyMin: number, healthyMax: number,
 *             note: string }}
 */
function getAgeGroup(age) {
  if (age >= 2 && age <= 17) {
    return {
      group: "child",
      label: "Child / Teen",
      emoji: "🧒",
      // Simplified BMI-for-age approximate thresholds (not percentile table)
      bmiLow: 14,    // ~ 5th percentile approximation
      bmiHigh: 21,    // ~ 84th percentile approximation
      healthyMin: 14,
      healthyMax: 21,
      note: "⚠ For children & teens (2–17), BMI is assessed using age-specific growth charts. These results are an approximation — please consult a paediatrician for a full assessment.",
    };
  }
  if (age >= 18 && age <= 64) {
    return {
      group: "adult",
      label: "Adult",
      emoji: "🧑",
      bmiLow: 18.5,
      bmiHigh: 24.9,
      healthyMin: 18.5,
      healthyMax: 24.9,
      note: "",
    };
  }
  // 65+
  return {
    group: "senior",
    label: "Senior (65+)",
    emoji: "🧓",
    // Many geriatric bodies suggest BMI 22–27 as healthy for seniors
    bmiLow: 22,
    bmiHigh: 27,
    healthyMin: 22,
    healthyMax: 27,
    note: "ℹ For adults aged 65+, a slightly higher BMI range (22–27) is generally considered healthy per geriatric health guidelines.",
  };
}

// ─────────────────────────────────────────────
//  BMI Category — Age-Adjusted
// ─────────────────────────────────────────────
/**
 * Returns the correct CATEGORIES entry based on BMI AND age group thresholds.
 * @param {number} bmi
 * @param {{ bmiLow: number, bmiHigh: number }} ageGroup
 * @returns {Object} Category config
 */
function getAgeAdjustedCategory(bmi, ageGroup) {
  const { bmiLow, bmiHigh } = ageGroup;

  // For the age group, thresholds are:
  //   Underweight : bmi < bmiLow
  //   Normal      : bmiLow <= bmi <= bmiHigh
  //   Overweight  : bmiHigh < bmi < bmiHigh + 5  (approx.)
  //   Obese       : bmi >= bmiHigh + 5
  if (bmi < bmiLow) return CATEGORIES.underweight;
  if (bmi <= bmiHigh) return CATEGORIES.normal;
  if (bmi < bmiHigh + 5) return CATEGORIES.overweight;
  return CATEGORIES.obese;
}

// ─────────────────────────────────────────────
//  Helper: Calculate BMI
// ─────────────────────────────────────────────
/**
 * Calculates BMI from weight (kg) and height (cm).
 * @param {number} weightKg
 * @param {number} heightCm
 * @returns {number} BMI rounded to 2 decimal places
 */
function calculateBMI(weightKg, heightCm) {
  const heightM = heightCm / 100;
  return +(weightKg / (heightM * heightM)).toFixed(2);
}

// ─────────────────────────────────────────────
//  Helper: Show / Clear Error
// ─────────────────────────────────────────────
function showError(inputEl, errorEl, message) {
  errorEl.textContent = message;
  errorEl.classList.add("visible");
  inputEl.classList.add("input-error");
  inputEl.setAttribute("aria-invalid", "true");
}

function clearError(inputEl, errorEl) {
  errorEl.textContent = "";
  errorEl.classList.remove("visible");
  inputEl.classList.remove("input-error");
  inputEl.removeAttribute("aria-invalid");
}

// ─────────────────────────────────────────────
//  Validation
// ─────────────────────────────────────────────
/**
 * Validates weight, height, and age inputs.
 * @returns {boolean} true if all fields are valid
 */
function validateInputs() {
  const weight = weightInput.value.trim();
  const height = heightInput.value.trim();
  const age = ageInput.value.trim();
  let valid = true;

  // ── Weight ──
  if (weight === "") {
    showError(weightInput, weightError, "⚠ Weight cannot be empty.");
    valid = false;
  } else if (isNaN(Number(weight)) || Number(weight) <= 0) {
    showError(weightInput, weightError, "⚠ Please enter a valid positive weight.");
    valid = false;
  } else if (Number(weight) > 500) {
    showError(weightInput, weightError, "⚠ Weight seems too high. Max: 500 kg.");
    valid = false;
  } else {
    clearError(weightInput, weightError);
  }

  // ── Height ──
  if (height === "") {
    showError(heightInput, heightError, "⚠ Height cannot be empty.");
    valid = false;
  } else if (isNaN(Number(height)) || Number(height) <= 0) {
    showError(heightInput, heightError, "⚠ Height cannot be zero or negative.");
    valid = false;
  } else if (Number(height) > 300) {
    showError(heightInput, heightError, "⚠ Height seems too high. Max: 300 cm.");
    valid = false;
  } else {
    clearError(heightInput, heightError);
  }

  // ── Age ──
  if (age === "") {
    showError(ageInput, ageError, "⚠ Age cannot be empty.");
    valid = false;
  } else if (isNaN(Number(age)) || !Number.isInteger(Number(age)) || Number(age) < 2) {
    showError(ageInput, ageError, "⚠ Please enter a valid age (min 2 years).");
    valid = false;
  } else if (Number(age) > 120) {
    showError(ageInput, ageError, "⚠ Age seems too high. Max: 120 years.");
    valid = false;
  } else {
    clearError(ageInput, ageError);
  }

  return valid;
}

// ─────────────────────────────────────────────
//  Scale Indicator Positioning
// ─────────────────────────────────────────────
function updateScaleIndicator(bmi, color) {
  const MIN_BMI = 0;
  const MAX_BMI = 40;
  const clamped = Math.min(Math.max(bmi, MIN_BMI), MAX_BMI);
  const pct = ((clamped - MIN_BMI) / (MAX_BMI - MIN_BMI)) * 100;
  scaleIndicator.style.left = `${pct}%`;
  scaleIndicator.style.borderColor = color;
  scaleIndicator.style.color = color;
}

// ─────────────────────────────────────────────
//  Highlight Active Category Row
// ─────────────────────────────────────────────
function highlightActiveCategory(categoryKey) {
  document.querySelectorAll(".ref-item").forEach(item => {
    item.classList.remove("active-category");
  });
  const activeItem = document.querySelector(`.ref-${categoryKey}`);
  if (activeItem) activeItem.classList.add("active-category");
}

// ─────────────────────────────────────────────
//  Update Category Reference Ranges for Age Group
// ─────────────────────────────────────────────
/**
 * Rewrites the BMI range values in the category reference table
 * to reflect the current age group's thresholds.
 * @param {{ bmiLow: number, bmiHigh: number, group: string }} ageGroup
 */
function updateRefRanges(ageGroup) {
  const { bmiLow, bmiHigh, group } = ageGroup;
  const overHigh = bmiHigh + 5;

  const ranges = document.querySelectorAll(".ref-range");
  // Order in HTML: underweight, normal, overweight, obese
  if (ranges.length >= 4) {
    ranges[0].textContent = `< ${bmiLow}`;
    ranges[1].textContent = `${bmiLow} – ${bmiHigh}`;
    ranges[2].textContent = `${bmiHigh} – ${overHigh - 0.1}`;
    ranges[3].textContent = `≥ ${overHigh}`;
  }

  // Update the section title to note age adjustment
  if (group === "child") {
    refTitleText.textContent = "BMI Categories (Child/Teen — approx.)";
  } else if (group === "senior") {
    refTitleText.textContent = "BMI Categories (Senior — age-adjusted)";
  } else {
    refTitleText.textContent = "BMI Categories";
  }
}

// ─────────────────────────────────────────────
//  Weight Advice: Healthy Range & Gain/Loss
// ─────────────────────────────────────────────
/**
 * Renders the healthy weight range panel and personalised gain/loss advice.
 * @param {number} weightKg
 * @param {number} heightCm
 * @param {string} categoryKey
 * @param {{ healthyMin: number, healthyMax: number, group: string }} ageGroup
 */
function computeWeightAdvice(weightKg, heightCm, categoryKey, ageGroup) {
  const hM = heightCm / 100;
  const minHealthy = +(ageGroup.healthyMin * hM * hM).toFixed(1);
  const maxHealthy = +(ageGroup.healthyMax * hM * hM).toFixed(1);

  // ── Healthy Range ──
  healthyRangeEl.textContent = `${minHealthy} – ${maxHealthy} kg`;

  // ── Suggestion ──
  weightSuggestion.className = "advice-value suggestion-value";
  adviceMessage.className = "advice-message";

  if (categoryKey === "normal") {
    weightSuggestion.textContent = "✓ You're there!";
    weightSuggestion.classList.add("suggest-normal");
    adviceMessage.textContent = "🎉 Great job! Your weight is in the healthy range for your age group. Keep up your current lifestyle!";
    adviceMessage.classList.add("msg-normal");

  } else if (categoryKey === "underweight") {
    const toGain = +(minHealthy - weightKg).toFixed(1);
    weightSuggestion.textContent = `Gain ${toGain} kg`;
    weightSuggestion.classList.add("suggest-gain");
    adviceMessage.textContent = `⬆ You need to gain at least ${toGain} kg to reach a healthy weight for your age. A nutrient-rich diet and strength training can help.`;
    adviceMessage.classList.add("msg-gain");

  } else if (categoryKey === "overweight") {
    const toLose = +(weightKg - maxHealthy).toFixed(1);
    weightSuggestion.textContent = `Lose ${toLose} kg`;
    weightSuggestion.classList.add("suggest-lose");
    adviceMessage.textContent = `⬇ Losing ${toLose} kg will bring you into the healthy range for your age. Regular exercise and a balanced diet can help.`;
    adviceMessage.classList.add("msg-lose");

  } else {
    // Obese
    const toLose = +(weightKg - maxHealthy).toFixed(1);
    weightSuggestion.textContent = `Lose ${toLose} kg`;
    weightSuggestion.classList.add("suggest-lose");
    adviceMessage.textContent = `⬇ You need to lose ${toLose} kg to reach a healthy BMI for your age. Please consult a healthcare professional for a personalised plan.`;
    adviceMessage.classList.add("msg-lose");
  }
}

// ─────────────────────────────────────────────
//  Display Results
// ─────────────────────────────────────────────
function displayResult(bmi, ageGroup) {
  const cat = getAgeAdjustedCategory(bmi, ageGroup);

  // ── BMI Value ──
  bmiValue.className = "result-value";
  void bmiValue.offsetWidth;          // restart animation
  bmiValue.textContent = bmi.toFixed(2);
  bmiValue.classList.add(cat.colorClass);

  // ── Category Badge ──
  bmiBadge.className = "bmi-badge";
  void bmiBadge.offsetWidth;
  bmiBadge.classList.add(cat.badgeClass);
  bmiCategory.textContent = cat.label;

  // ── Age Group Chip ──
  ageGroupChip.textContent = `${ageGroup.emoji} ${ageGroup.label}`;

  // ── Age Note / Disclaimer ──
  ageNoteEl.textContent = ageGroup.note;

  // ── Scale Indicator ──
  updateScaleIndicator(bmi, cat.scaleColor);

  // ── Highlight Category Row + Update Ranges ──
  highlightActiveCategory(cat.key);
  updateRefRanges(ageGroup);

  // ── Weight Advice Panel ──
  const weight = parseFloat(weightInput.value);
  const height = parseFloat(heightInput.value);
  computeWeightAdvice(weight, height, cat.key, ageGroup);

  // ── Show Result Section ──
  resultSection.classList.remove("hidden");

  setTimeout(() => {
    resultSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, 100);
}

// ─────────────────────────────────────────────
//  Reset / Recalculate
// ─────────────────────────────────────────────
function resetCalculator() {
  resultSection.classList.add("hidden");

  // Clear inputs
  weightInput.value = "";
  heightInput.value = "";
  ageInput.value = "";

  // Clear errors
  clearError(weightInput, weightError);
  clearError(heightInput, heightError);
  clearError(ageInput, ageError);

  // Clear advice panel
  healthyRangeEl.textContent = "";
  weightSuggestion.textContent = "";
  weightSuggestion.className = "advice-value suggestion-value";
  adviceMessage.textContent = "";
  adviceMessage.className = "advice-message";
  ageGroupChip.textContent = "";
  ageNoteEl.textContent = "";

  // Reset category ref title and ranges
  refTitleText.textContent = "BMI Categories";
  const ranges = document.querySelectorAll(".ref-range");
  const defaults = ["< 18.5", "18.5 – 24.9", "25 – 29.9", "≥ 30"];
  ranges.forEach((el, i) => { el.textContent = defaults[i]; });

  weightInput.focus();
  form.scrollIntoView({ behavior: "smooth", block: "center" });
}

// ─────────────────────────────────────────────
//  Event Listeners
// ─────────────────────────────────────────────

// Form submit
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validateInputs()) return;

  const weight = parseFloat(weightInput.value);
  const height = parseFloat(heightInput.value);
  const age = parseInt(ageInput.value, 10);
  const bmi = calculateBMI(weight, height);
  const ageGroup = getAgeGroup(age);

  displayResult(bmi, ageGroup);
});

// Reset button
resetBtn.addEventListener("click", resetCalculator);

// ── Inline blur validation ──
weightInput.addEventListener("blur", () => {
  const w = weightInput.value.trim();
  if (w === "") showError(weightInput, weightError, "⚠ Weight cannot be empty.");
  else if (isNaN(Number(w)) || Number(w) <= 0) showError(weightInput, weightError, "⚠ Please enter a valid positive weight.");
  else if (Number(w) > 500) showError(weightInput, weightError, "⚠ Weight seems too high. Max: 500 kg.");
  else clearError(weightInput, weightError);
});

heightInput.addEventListener("blur", () => {
  const h = heightInput.value.trim();
  if (h === "") showError(heightInput, heightError, "⚠ Height cannot be empty.");
  else if (isNaN(Number(h)) || Number(h) <= 0) showError(heightInput, heightError, "⚠ Height cannot be zero or negative.");
  else if (Number(h) > 300) showError(heightInput, heightError, "⚠ Height seems too high. Max: 300 cm.");
  else clearError(heightInput, heightError);
});

ageInput.addEventListener("blur", () => {
  const a = ageInput.value.trim();
  if (a === "") showError(ageInput, ageError, "⚠ Age cannot be empty.");
  else if (isNaN(Number(a)) || !Number.isInteger(Number(a)) || Number(a) < 2)
    showError(ageInput, ageError, "⚠ Please enter a valid age (min 2 years).");
  else if (Number(a) > 120) showError(ageInput, ageError, "⚠ Age seems too high. Max: 120 years.");
  else clearError(ageInput, ageError);
});

// ── Clear error on typing ──
weightInput.addEventListener("input", () => { if (weightError.classList.contains("visible")) clearError(weightInput, weightError); });
heightInput.addEventListener("input", () => { if (heightError.classList.contains("visible")) clearError(heightInput, heightError); });
ageInput.addEventListener("input", () => { if (ageError.classList.contains("visible")) clearError(ageInput, ageError); });

// ── Enter key submits ──
[weightInput, heightInput, ageInput].forEach(input => {
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      form.dispatchEvent(new Event("submit"));
    }
  });
});
