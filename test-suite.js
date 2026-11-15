/**
 * World Explorer - Automated Verification Test Suite
 * Tests all core features, edge cases, algorithms, and country datasets
 */

const fs = require('fs');
const assert = require('assert');

console.log('====================================================');
console.log('🧪 RUNNING WORLD EXPLORER COMPREHENSIVE TEST SUITE');
console.log('====================================================\n');

// 1. Load Data
const raw = fs.readFileSync('assets/data/countries.json', 'utf8');
const allCountries = JSON.parse(raw);

console.log(`[PASS] Total countries loaded: ${allCountries.length}`);
assert.strictEqual(allCountries.length, 250, 'Must have 250 countries');

// 2. Index Map
const countryMap = new Map();
allCountries.forEach(c => {
  if (c.cca3) countryMap.set(c.cca3.toUpperCase(), c);
  if (c.cca2) countryMap.set(c.cca2.toUpperCase(), c);
});

// Helper functions from script.js
const DataHelper = {
  getName: (c) => c?.name?.common || 'Unknown Country',
  getOfficialName: (c) => c?.name?.official || c?.name?.common || 'Unknown Official Name',
  getCapital: (c) => (Array.isArray(c?.capital) && c.capital.length > 0) ? c.capital.join(', ') : 'None / Not declared',
  getRegion: (c) => c?.region || 'Unspecified',
  getSubregion: (c) => c?.subregion || 'None / Not specified',
  getContinents: (c) => Array.isArray(c?.continents) ? c.continents.join(', ') : (c?.region || 'N/A'),
  getPopulation: (c) => (typeof c?.population === 'number') ? c.population.toLocaleString('en-US') : '0',
  getArea: (c) => (typeof c?.area === 'number') ? `${c.area.toLocaleString('en-US')} km²` : 'N/A',
  getCurrencies: (c) => {
    if (!c?.currencies || typeof c.currencies !== 'object') return 'None / N/A';
    const items = Object.entries(c.currencies).map(([code, cur]) => {
      const symbol = cur?.symbol ? ` (${cur.symbol})` : '';
      const name = cur?.name || code;
      return `${name}${symbol} [${code}]`;
    });
    return items.length > 0 ? items.join(', ') : 'None';
  },
  getLanguages: (c) => {
    if (!c?.languages || typeof c.languages !== 'object') return 'None / Not declared';
    const langs = Object.values(c.languages);
    return langs.length > 0 ? langs.join(', ') : 'None';
  },
  getCallingCode: (c) => {
    if (!c?.idd?.root) return 'N/A';
    const root = c.idd.root;
    if (Array.isArray(c.idd.suffixes) && c.idd.suffixes.length === 1) {
      return root + c.idd.suffixes[0];
    }
    return root;
  },
  getTimezones: (c) => (Array.isArray(c?.timezones) && c.timezones.length > 0) ? c.timezones.join(', ') : 'N/A',
  getGoogleMapsUrl: (c) => c?.maps?.googleMaps || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c?.name?.common || '')}`
};

// 3. Test India
console.log('\n--- Test Scenario 1: India ---');
const india = countryMap.get('IND');
assert(india, 'India must exist');
console.log('✓ Name:', DataHelper.getName(india));
console.log('✓ Official Name:', DataHelper.getOfficialName(india));
console.log('✓ Capital:', DataHelper.getCapital(india));
console.log('✓ Currencies:', DataHelper.getCurrencies(india));
console.log('✓ Languages:', DataHelper.getLanguages(india));
console.log('✓ Calling Code:', DataHelper.getCallingCode(india));
console.log('✓ Timezones:', DataHelper.getTimezones(india));
console.log('✓ Borders:', india.borders.join(', '));
console.log('✓ Google Maps:', DataHelper.getGoogleMapsUrl(india));
assert.strictEqual(DataHelper.getName(india), 'India');
assert.strictEqual(DataHelper.getCapital(india), 'New Delhi');
assert(DataHelper.getCurrencies(india).includes('INR'), 'Currency must include INR');
assert(DataHelper.getCallingCode(india) === '+91', 'Calling code must be +91');
assert(india.borders.length >= 6, 'India must have at least 6 border countries');
console.log('[PASS] India scenario verified successfully.');

// 4. Test Japan (Island nation edge case)
console.log('\n--- Test Scenario 2: Japan ---');
const japan = countryMap.get('JPN');
assert(japan, 'Japan must exist');
console.log('✓ Name:', DataHelper.getName(japan));
console.log('✓ Capital:', DataHelper.getCapital(japan));
console.log('✓ Currencies:', DataHelper.getCurrencies(japan));
console.log('✓ Borders count:', japan.borders ? japan.borders.length : 0);
assert.strictEqual(DataHelper.getName(japan), 'Japan');
assert.strictEqual(DataHelper.getCapital(japan), 'Tokyo');
assert(DataHelper.getCurrencies(japan).includes('JPY'), 'Currency must include JPY');
assert(!japan.borders || japan.borders.length === 0, 'Japan must have 0 land borders (island nation)');
console.log('[PASS] Japan island edge-case verified successfully.');

// 5. Test United States
console.log('\n--- Test Scenario 3: United States ---');
const usa = countryMap.get('USA');
assert(usa, 'USA must exist');
console.log('✓ Name:', DataHelper.getName(usa));
console.log('✓ Capital:', DataHelper.getCapital(usa));
console.log('✓ Currencies:', DataHelper.getCurrencies(usa));
console.log('✓ Borders:', usa.borders.join(', '));
assert.strictEqual(DataHelper.getCapital(usa), 'Washington, D.C.');
assert(DataHelper.getCurrencies(usa).includes('USD'), 'Currency must include USD');
assert(usa.borders.includes('CAN') && usa.borders.includes('MEX'), 'Borders must include CAN and MEX');
console.log('[PASS] USA scenario verified successfully.');

// 6. Test France
console.log('\n--- Test Scenario 4: France ---');
const france = countryMap.get('FRA');
assert(france, 'France must exist');
console.log('✓ Name:', DataHelper.getName(france));
console.log('✓ Capital:', DataHelper.getCapital(france));
console.log('✓ Currencies:', DataHelper.getCurrencies(france));
console.log('✓ Borders count:', france.borders.length);
assert.strictEqual(DataHelper.getCapital(france), 'Paris');
assert(DataHelper.getCurrencies(france).includes('EUR'), 'Currency must include EUR');
console.log('[PASS] France scenario verified successfully.');

// 7. Test Invalid Country Query
console.log('\n--- Test Scenario 5: Invalid Country Query ---');
const query = 'AtlantisXYZ123'.toLowerCase();
const invalidMatches = allCountries.filter(c => {
  const common = (c?.name?.common || '').toLowerCase();
  const official = (c?.name?.official || '').toLowerCase();
  const cca2 = (c?.cca2 || '').toLowerCase();
  const cca3 = (c?.cca3 || '').toLowerCase();
  return common.includes(query) || official.includes(query) || cca2 === query || cca3 === query;
});
console.log(`✓ Matches for "${query}":`, invalidMatches.length);
assert.strictEqual(invalidMatches.length, 0, 'Must return 0 matches for invalid query');
console.log('[PASS] Invalid search triggers empty state as expected.');

// 8. Test Region Filters
console.log('\n--- Test Scenario 6: Region Filters ---');
const regions = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];
regions.forEach(r => {
  const filtered = allCountries.filter(c => c.region === r);
  console.log(`✓ Region ${r}: ${filtered.length} countries`);
  assert(filtered.length > 0, `Region ${r} must have countries`);
});
console.log('[PASS] Region filtering logic verified.');

// 9. Test Sorting Algorithms
console.log('\n--- Test Scenario 7: Sorting Algorithms ---');
// Alphabetical A-Z
const sortedAz = [...allCountries].sort((a, b) => (a.name.common || '').localeCompare(b.name.common || ''));
assert.strictEqual(sortedAz[0].name.common, 'Afghanistan', 'First in A-Z should be Afghanistan');

// Population Descending
const sortedPop = [...allCountries].sort((a, b) => (b.population || 0) - (a.population || 0));
console.log('✓ Top 3 Populated:', sortedPop.slice(0, 3).map(c => `${c.name.common} (${c.population.toLocaleString()})`).join(', '));
assert(sortedPop[0].name.common === 'China' || sortedPop[0].name.common === 'India', 'India/China top populated');

// Area Descending
const sortedArea = [...allCountries].sort((a, b) => (b.area || 0) - (a.area || 0));
console.log('✓ Largest 3 Countries by Area:', sortedArea.slice(0, 3).map(c => `${c.name.common} (${c.area.toLocaleString()} km²)`).join(', '));
assert.strictEqual(sortedArea[0].name.common, 'Russia', 'Largest country by area must be Russia');
console.log('[PASS] Sorting verified.');

// 10. Test Country Comparison Engine (India vs USA)
console.log('\n--- Test Scenario 8: Country Comparison Engine ---');
const c1 = india;
const c2 = usa;
const maxPop = Math.max(c1.population, c2.population, 1);
const popPct1 = Math.round((c1.population / maxPop) * 100);
const popPct2 = Math.round((c2.population / maxPop) * 100);

const maxArea = Math.max(c1.area, c2.area, 1);
const areaPct1 = Math.round((c1.area / maxArea) * 100);
const areaPct2 = Math.round((c2.area / maxArea) * 100);

console.log(`✓ Population Comparison: India ${popPct1}% vs USA ${popPct2}%`);
console.log(`✓ Area Comparison: India ${areaPct1}% vs USA ${areaPct2}%`);
assert.strictEqual(popPct1, 100, 'India has higher population so 100%');
assert.strictEqual(areaPct2, 100, 'USA has larger area so 100%');
console.log('[PASS] Comparison metrics verified.');

console.log('\n====================================================');
console.log('🎉 ALL 8 TEST SCENARIOS PASSED WITH ZERO ERRORS!');
console.log('====================================================');
