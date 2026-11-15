# 🌍 World Explorer — Advanced Country Information App

> **SpireX Foundation Internship — Task 9**  
> A senior-grade, high-performance country intelligence platform engineered strictly using **HTML5**, **CSS3 (Vanilla Glassmorphism)**, and **Modern JavaScript (ES6+)**. Powered by the **REST Countries API** with resilient multi-tier fallback architecture, LocalStorage persistence, live autocomplete, dynamic side-by-side country comparison, interactive border navigation, and accessible dark/light themes.

---

## 📸 Overview & Design Philosophy

World Explorer delivers a modern web experience inspired by modern data dashboards and international geopolitical atlases.

- **Theme Palette:** Deep navy (`#080c19`) with purple, indigo, and cyan glowing accents (`#6366f1`, `#8b5cf6`, `#06b6d4`).
- **Glassmorphism Design:** Subtle frosted glass cards (`backdrop-filter: blur(14px)`), gradient borders, soft elevation shadows, and micro-interactions.
- **Dual Theme Support:** Seamless toggle between Dark Mode and Light Mode with persistent user preference in `localStorage`.
- **Zero Frameworks:** Strictly Vanilla JavaScript, Native CSS3 custom properties, and semantic HTML5. No React, Bootstrap, Tailwind, or external script dependencies.

---

## 🚀 Key Features

### 🌟 Core Capabilities
1. **Live Autocomplete & Instant Search:** Real-time search by country name, official name, capital city, or 2/3-letter country codes (e.g., `India`, `Tokyo`, `USA`, `FR`) with match highlighting and thumbnail flags.
2. **Comprehensive Country Intelligence:**
   - National Flag & Official Coat of Arms (high-resolution SVG/PNG).
   - Common & Official Names, Native Names, CCA2, CCA3, and CCN3 ISO codes.
   - Capital city, Population, Geographic Region, Subregion, Continents, Lat/Lng coordinates, and Total Surface Area ($km^2$).
   - Currencies (code, full name, symbol), Official Languages, Timezones, Calling Codes (IDD), Top-Level Domain (TLD), and Road Driving Side.
   - Landlocked status, Sovereign Independence, and United Nations membership status.
3. **Interactive Neighboring Country Navigation:** Clickable border country chips featuring national flags. Clicking any border country immediately navigates the modal to that country. Island nations and territories with no land borders display an informative badge.
4. **Interactive Cartography:** One-click direct links to **Google Maps** and **OpenStreetMap** for every country.
5. **Loading Skeletons:** Shimmering skeleton card placeholders during data retrieval.
6. **Error Resilience:** Human-readable error and empty state messages with "Reset All Filters" and "Retry Connection" buttons.

### ⚡ Advanced Capabilities
7. **Region & Subregion Filtering:** One-click filter pills for **Africa**, **Americas**, **Asia**, **Europe**, **Oceania**, plus dynamically populated subregion dropdowns.
8. **Multi-Criteria Sorting:** Sort by Country Name (A–Z / Z–A), Population (High–Low / Low–High), and Surface Area (Largest–Smallest / Smallest–Largest).
9. **Interactive Country Comparison Engine:** Side-by-side comparative cards with dual country pickers, "Swap Countries" button, and **graphical progress bar comparisons** for relative Population and Landmass.
10. **Favourites Management:** Save favourite countries to `localStorage`. Dedicated "Favourites Only" filter switch and header badge counter.
11. **Recent Search History:** Tracks recent search queries in `localStorage` with clickable chips and a "Clear History" control.
12. **Surprise Me (Random Discovery):** Discover a random nation with one click, accompanied by an animated toast notification.
13. **Responsive Grid & Compact Views:** Toggle between a rich responsive card grid and a compact row-based view.
14. **Customizable Pagination:** View 12, 24, 48, or All countries per page with numeric pagination controls and smart ellipsis.
15. **Keyboard & Accessibility Support:** `Enter` to search, `Escape` to close modals, ARIA labels, semantic roles, high-contrast text, and skip-to-content link.
16. **Floating Back-to-Top Button:** Circular glassmorphism button that appears on scroll with smooth animation.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Structure** | HTML5 | Semantic elements (`<header>`, `<main>`, `<section>`, `<article>`, `<dialog>`), ARIA accessibility |
| **Styling** | CSS3 | Custom Properties (variables), CSS Grid, Flexbox, Glassmorphism, CSS Animations, Media Queries |
| **Logic** | Vanilla JavaScript | ES6+ Classes, Async/Await, Fetch API, Event Delegation, DOM Manipulation |
| **Persistence** | Web Storage API | `localStorage` for Theme, Favourites, Search History, Page Size, and View Mode |
| **Data Provider** | REST Countries API v3.1 | Primary endpoint + Repository CDN fallback + Bundled local fallback |

---

## 📡 API Integration & Resilience Architecture

The application communicates with the **REST Countries API**:

- **Primary Endpoint:** `https://restcountries.com/v3.1/all`
- **Official Repository Mirror:** `https://cdn.jsdelivr.net/gh/restcountries/restcountries@master/src/main/resources/countriesV3.1.json`
- **Local Bundled Fallback:** `assets/data/countries.json` (bundled in repository)

### Resilient Multi-Tier Fallback Strategy
```
+-------------------------------------------------------------+
| 1. Attempt Primary: https://restcountries.com/v3.1/all      |
+-------------------------------------------------------------+
                             │  (Fails or returns deprecation)
                             ▼
+-------------------------------------------------------------+
| 2. Attempt CDN Mirror: Official GitHub Repository Master    |
+-------------------------------------------------------------+
                             │  (Fails or offline)
                             ▼
+-------------------------------------------------------------+
| 3. Bundled Local Fallback: assets/data/countries.json       |
+-------------------------------------------------------------+
                             │
                             ▼
+-------------------------------------------------------------+
| Success: Index in memory (O(1) Map) -> Render App UI        |
+-------------------------------------------------------------+
```
All data extraction uses null-safe chaining and guard clauses so missing fields (e.g. countries without capitals like Antarctica, or territories without coats of arms) never cause runtime exceptions.

---

## 📂 Project Structure

```text
country-information-app/
├── index.html              # Semantic HTML5 markup, accessibility anchors, and modals
├── style.css               # Modern CSS3 stylesheet, dark/light variables & glassmorphism
├── script.js               # ES6+ application logic, API client, search, and storage
├── README.md               # Complete project documentation & verification test guide
└── assets/
    ├── favicon.svg         # Gradient vector favicon
    └── data/
        └── countries.json  # Complete 250-country offline dataset fallback
```

---

## 💻 Setup & Local Execution

This project is 100% self-contained and requires **no build tools, compilers, or npm installations**.

### Option 1: Python Simple HTTP Server (Recommended)
Open your terminal in the project directory:
```bash
# Python 3
python -m http.server 8080
```
Then visit: `http://localhost:8080/`

### Option 2: Node.js `npx serve` or `http-server`
```bash
npx serve .
```

### Option 3: VS Code Live Server
1. Open the project folder in VS Code.
2. Right-click `index.html` and select **"Open with Live Server"**.

### Option 4: Direct File Opening
Double-click `index.html` to open it directly in any modern browser (Chrome, Edge, Firefox, Safari).

---

## 🧪 Comprehensive Test Scenarios

Follow these step-by-step test instructions to verify each core and edge-case requirement:

### Test Case 1: India (`IN` / `IND`)
1. In the search bar, type `India`.
2. Observe the autocomplete suggestion: Flag of India, Common Name "India", Capital "New Delhi", and Region "Asia".
3. Press `Enter` or click on India's card / suggestion to open the **Country Detail Modal**.
4. **Verify the following fields:**
   - **Common Name:** India | **Official Name:** Republic of India
   - **Codes:** CCA2: `IN`, CCA3: `IND`, CCN3: `356`
   - **Capital:** New Delhi | **Continent:** Asia | **Region:** Asia (Southern Asia)
   - **Population:** Over 1.4 Billion (formatted with commas)
   - **Currencies:** Indian rupee (`₹`) `[INR]`
   - **Official Languages:** English, Hindi, Tamil
   - **Calling Code:** `+91` | **Timezones:** `UTC+05:30`
   - **Coat of Arms:** Ashoka Lion Capital emblem displayed.
   - **Neighbouring Borders:** Interactive pills for Bangladesh (`BGD`), Bhutan (`BTN`), Myanmar (`MMR`), China (`CHN`), Nepal (`NPL`), and Pakistan (`PAK`).
   - Click the **Nepal (`NPL`)** pill. Confirm that the modal smoothly updates to display Nepal's information!
   - Click **"Open in Google Maps"** to test cartography integration.

---

### Test Case 2: Japan (`JP` / `JPN`) — Island Edge Case
1. Type `Japan` in the search bar and open Japan's details.
2. **Verify the following fields:**
   - **Common Name:** Japan | **Capital:** Tokyo
   - **Currencies:** Japanese yen (`¥`) `[JPY]`
   - **Languages:** Japanese
   - **Calling Code:** `+81` | **Driving Side:** Left
   - **Border Countries:** Observe the empty border state: *"Island nation or territory with no direct land borders."*
   - Verify that this is handled gracefully without errors.

---

### Test Case 3: United States (`US` / `USA`)
1. Search `USA` or click the popular `🇺🇸 USA` chip.
2. Open the detail view.
3. **Verify the following fields:**
   - **Official Name:** United States of America
   - **Capital:** Washington, D.C.
   - **Currencies:** United States dollar (`$`) `[USD]`
   - **Timezones:** Multiple timezones (`UTC-12:00` through `UTC+12:00`).
   - **Border Countries:** Canada (`CAN`) and Mexico (`MEX`).

---

### Test Case 4: France (`FR` / `FRA`) — European Union Multilingual Case
1. Click the popular `🇫🇷 France` chip or type `France`.
2. Open the detail view.
3. **Verify the following fields:**
   - **Official Name:** French Republic | **Capital:** Paris
   - **Continent:** Europe | **Region:** Europe (Western Europe)
   - **Currencies:** Euro (`€`) `[EUR]`
   - **Border Countries:** Andorra, Belgium, Germany, Italy, Luxembourg, Monaco, Spain, Switzerland.

---

### Test Case 5: Invalid Country Search
1. In the search box, enter an invalid query: `AtlantisXYZ123`.
2. **Verify the following behavior:**
   - Autocomplete dropdown disappears.
   - Card grid hides and the **Empty State** appears with an illustrative icon.
   - Message displays: *"No countries match "AtlantisXYZ123". Check the spelling or try searching by code (e.g. IN, USA, FR)."*
   - A prominent **"Reset All Filters"** button is displayed.
3. Click **"Reset All Filters"**. Confirm that the search input clears and all 250 countries return immediately.

---

### Test Case 6: Side-by-Side Comparison
1. Click the **"Compare"** button in the top navigation bar.
2. In Country 1, select **India**. In Country 2, select **United States**.
3. **Verify comparative visualization:**
   - Side-by-side flags and capitals.
   - **Visual Population Comparison Bar:** India displays 100%, United States displays ~24%.
   - **Visual Area Comparison Bar:** United States displays 100%, India displays ~35%.
   - Comparative currency, timezone, language, and driving side differences.
4. Click the **"Swap Countries"** button (`⇄`) to confirm the positions invert seamlessly.

---

### Test Case 7: Favourites & LocalStorage Persistence
1. Hover over any country card (e.g., Japan) and click the **Heart icon** (`❤️`).
2. Notice the badge counter in the header updates from `0` to `1`. A toast notification confirms *"Added Japan to favourites!"*.
3. Click the **"Favourites Only"** toggle button in the filter toolbar or header.
4. Confirm only favourited countries are shown in the grid.
5. Refresh the browser page (`F5`). Confirm Japan remains favourited and the counter stays at `1`.

---

### Test Case 8: Dark / Light Mode Switch
1. Click the **Theme Toggle** switch in the top header.
2. Confirm the entire interface transforms smoothly from dark navy glassmorphism to high-contrast clean light mode.
3. Refresh the page. Confirm the theme preference is remembered.

---

### Test Case 9: "Surprise Me" (Random Country)
1. Click the **"Surprise Me"** button in the header.
2. Notice a toast notification: *"Discovered [Country]! Exploring..."*.
3. The country detail modal immediately opens with rich information for that randomly selected country.

---

## ♿ Accessibility & Standards Compliance

- **Semantic HTML5:** `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`.
- **Keyboard Navigation:** Full tab order, Enter key triggers, Escape closes modals.
- **Screen Reader Support:** `aria-label`, `aria-expanded`, `aria-selected`, `aria-live="polite"` for dynamic search results.
- **Contrast Ratios:** Exceeds WCAG 2.1 AA standards in both dark and light modes.
- **Safe DOM Rendering:** All dynamic string injections are escaped through `escapeHtml()` to prevent XSS vulnerabilities.

---

## 📜 Attribution & Acknowledgments

- **REST Countries API:** [restcountries.com](https://restcountries.com/) by Fayder Florez and contributors.
- **National Flags:** [FlagCDN](https://flagcdn.com/) for optimized SVG flags.
- **Cartography:** Google Maps and OpenStreetMap.
- **Project Task:** SpireX Foundation Internship Task 9.

---

*Built with precision and passion for SpireX Foundation Task 9.*

#
