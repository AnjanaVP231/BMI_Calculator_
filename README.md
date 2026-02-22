# 🏋️ BMI Calculator

A **responsive, modern BMI (Body Mass Index) Calculator** built with pure HTML, CSS, and JavaScript — no frameworks, no dependencies. It uses your **age**, **weight**, and **height** to deliver personalised, age-adjusted BMI results along with a healthy weight range and a tailored gain/loss suggestion.

---

## 🌐 Live Preview

Open `index.html` directly in any modern browser — no server required.

---

## ✨ Features

| Feature | Detail |
|---|---|
| 🎂 **Age-Aware Calculation** | Applies different BMI thresholds for children (2–17), adults (18–64), and seniors (65+) |
| ⚖️ **BMI Calculation** | Standard formula: `weight (kg) ÷ height (m)²`, shown to 2 decimal places |
| 🏷️ **BMI Category Badge** | Colour-coded badge: Underweight · Normal · Overweight · Obese |
| 🎯 **Healthy Weight Range** | Displays the exact kg range for a Healthy BMI at your height & age group |
| 💡 **Gain / Loss Suggestion** | Tells you precisely how many kg to gain or lose to reach the normal range |
| 📊 **Visual BMI Scale Bar** | Animated sliding indicator dot on a 4-segment colour bar |
| 🗂️ **Dynamic Category Table** | Reference ranges update automatically per age group |
| ⚠️ **Age Disclaimer** | Amber note for children (advises paediatrician) and seniors (explains adjusted range) |
| ✅ **Input Validation** | Real-time inline errors on blur; clears as you type |
| 📱 **Fully Responsive** | Works on desktop, tablet, and mobile |
| 🎨 **Dark Glassmorphism UI** | Animated background blobs, blur card, gradient typography |
| ♿ **Accessible** | ARIA labels, `role="alert"`, `aria-live` regions, keyboard navigation |

---

## 📁 Project Structure

```
BMI_Calculator_/
│
├── index.html      ← App structure, form, result sections, ARIA markup
├── style.css       ← Design system, glassmorphism card, animations, responsive layout
├── script.js       ← BMI logic, age-group detection, validation, UI updates
└── README.md       ← This file
```

---

## 🧮 BMI Formula

```
BMI = weight (kg) / (height (m))²
```

**Example:** Weight = 70 kg, Height = 175 cm  
```
BMI = 70 / (1.75)² = 70 / 3.0625 ≈ 22.86  →  Normal Weight ✅
```

---

## 👥 Age-Group Logic

BMI thresholds are **not one-size-fits-all**. This calculator adjusts them based on your age:

### 🧒 Children & Teens (Age 2–17)
BMI is calculated the same way but interpreted using **BMI-for-age percentile** approximations (as per CDC growth guidelines). Simplified thresholds are used since full percentile tables require sex-specific growth chart data.

| Category | Approx. BMI |
|---|---|
| Underweight | < 14 |
| Healthy Weight | 14 – 21 |
| Overweight | 21 – 25.9 |
| Obese | ≥ 26 |

> ⚠️ **Disclaimer shown:** For children, a paediatrician should assess BMI against age/sex-specific percentile charts.

---

### 🧑 Adults (Age 18–64)
Standard **WHO / NIH** adult BMI categories:

| Category | BMI Range | Colour |
|---|---|---|
| Underweight | < 18.5 | 🔵 Blue |
| Normal Weight | 18.5 – 24.9 | 🟢 Green |
| Overweight | 25 – 29.9 | 🟠 Orange |
| Obese | ≥ 30 | 🔴 Red |

---

### 🧓 Seniors (Age 65+)
Research from multiple geriatric health organisations suggests a **slightly higher BMI (22–27)** is associated with better health outcomes in older adults.

| Category | BMI Range |
|---|---|
| Underweight | < 22 |
| Healthy Weight | 22 – 27 |
| Overweight | 27 – 31.9 |
| Obese | ≥ 32 |

> ℹ️ A note is displayed to explain the adjusted thresholds.

---

## 🎯 Healthy Weight Range Calculation

The displayed healthy weight range is computed from the **age-group's healthy BMI bounds** and the user's height:

```
Min Healthy Weight = bmiLow  × (height in m)²
Max Healthy Weight = bmiHigh × (height in m)²
```

**Gain / Loss suggestion** is the difference between the current weight and the nearest healthy boundary.

---

## ✅ Input Validation Rules

| Field | Rules |
|---|---|
| **Weight** | Required · Must be > 0 · Max 500 kg |
| **Height** | Required · Must be > 0 · Max 300 cm |
| **Age** | Required · Integer · Min 2 · Max 120 |

Errors appear on field blur and clear as soon as the user starts typing again. All three fields also respond to the **Enter** key to submit.

---

## 🎨 Design Highlights

- **Font:** [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts
- **Theme:** Deep space dark (`#0f0c29 → #302b63 → #24243e` gradient)
- **Card:** Glassmorphism — `backdrop-filter: blur(24px)` + translucent border
- **Animations:** Card entrance, number pop, badge bounce, background blob float, scale indicator slide
- **Colour Scheme:**

| State | Colour |
|---|---|
| Underweight | `#3b82f6` (Blue) |
| Normal | `#22c55e` (Green) |
| Overweight | `#f97316` (Orange) |
| Obese | `#ef4444` (Red) |
| Warning / Note | Amber `rgba(253, 224, 71, …)` |

---

## 🚀 How to Use

1. **Open** `index.html` in any modern browser (Chrome, Firefox, Edge, Safari).
2. **Enter** your Weight (kg), Height (cm), and Age (years).
3. **Click** `Calculate BMI` or press **Enter**.
4. View your:
   - BMI value (colour-coded)
   - Category badge (Underweight / Normal / Overweight / Obese)
   - Age group chip (Child / Adult / Senior)
   - Visual scale bar with your position
   - Healthy weight range for your height & age
   - Personalised gain or loss suggestion
5. Click **↺ Recalculate** to start over.

---

## 🌍 Browser Compatibility

| Browser | Supported |
|---|---|
| Chrome 88+ | ✅ |
| Firefox 85+ | ✅ |
| Edge 88+ | ✅ |
| Safari 14+ | ✅ |
| Opera 74+ | ✅ |

> `backdrop-filter` (glassmorphism blur) requires a modern browser. On older browsers the card falls back to a semi-transparent dark background.

---

## ⚕️ Medical Disclaimer

> BMI is a **screening tool**, not a diagnostic measure. It does not account for muscle mass, bone density, fat distribution, or other individual health factors. Always consult a qualified healthcare professional for personalised health advice.

---

## 📄 License

This project is open-source and free to use for personal and educational purposes.

---

*Built with ❤️ using HTML · CSS · JavaScript*
