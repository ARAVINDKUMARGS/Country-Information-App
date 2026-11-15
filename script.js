/**
 * World Explorer - Advanced Country Information App
 * SpireX Foundation Internship - Task 9
 * Vanilla JavaScript (ES6+) - Clean, Modular Architecture
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. Configuration and Constants
     ========================================================================== */
  const CONFIG = {
    API_PRIMARY_BASE: 'https://restcountries.com/v3.1',
    API_CDN_FALLBACK: 'https://cdn.jsdelivr.net/gh/restcountries/restcountries@master/src/main/resources/countriesV3.1.json',
    API_LOCAL_FALLBACK: 'assets/data/countries.json',
    STORAGE_KEYS: {
      THEME: 'world_explorer_theme',
      FAVOURITES: 'world_explorer_favourites',
      HISTORY: 'world_explorer_search_history',
      VIEW_MODE: 'world_explorer_view_mode',
      PAGE_SIZE: 'world_explorer_page_size'
    },
    DEFAULT_PAGE_SIZE: 24,
    MAX_HISTORY_ITEMS: 8,
    MAX_SUGGESTIONS: 6,
    SEARCH_DEBOUNCE_MS: 180
  };

  /* ==========================================================================
     2. Application State
     ========================================================================== */
  const state = {
    allCountries: [],
    countryCodeMap: new Map(), // CCA3 / CCA2 -> Country Object for O(1) lookups
    filteredCountries: [],
    favourites: new Set(),
    searchHistory: [],
    compareCodes: [null, null], // [cca3_1, cca3_2]
    currentModalCountry: null,
    
    // Active filters
    activeRegion: 'all',
    activeSubregion: 'all',
    activeSort: 'name-asc',
    searchQuery: '',
    favouritesOnly: false,
    
    // Pagination & UI
    currentPage: 1,
    pageSize: CONFIG.DEFAULT_PAGE_SIZE,
    viewMode: 'grid', // 'grid' | 'compact'
    theme: 'dark',
    isLoading: true,
    hasError: false
  };

  /* ==========================================================================
     3. DOM Element Selectors Cache
     ========================================================================== */
  const DOM = {
    // Header & Nav
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    navFavouritesBtn: document.getElementById('nav-favourites-btn'),
    navCompareBtn: document.getElementById('nav-compare-btn'),
    navRandomBtn: document.getElementById('nav-random-btn'),
    favCounterBadge: document.getElementById('fav-counter-badge'),
    compareCounterBadge: document.getElementById('compare-counter-badge'),
    mobileMenuBtn: document.getElementById('mobile-menu-btn'),
    mobileDrawer: document.getElementById('mobile-drawer'),
    mobileFavBtn: document.getElementById('mobile-favourites-btn'),
    mobileCompareBtn: document.getElementById('mobile-compare-btn'),
    mobileRandomBtn: document.getElementById('mobile-random-btn'),
    mobileFavCount: document.getElementById('mobile-fav-count'),
    mobileCompareCount: document.getElementById('mobile-compare-count'),

    // Search & Autocomplete
    searchInput: document.getElementById('search-input'),
    clearSearchBtn: document.getElementById('clear-search-btn'),
    autocompleteDropdown: document.getElementById('autocomplete-dropdown'),
    quickChipsList: document.querySelector('.quick-chips-list'),
    recentSearchSection: document.getElementById('recent-search-section'),
    recentSearchChips: document.getElementById('recent-search-chips'),
    clearHistoryBtn: document.getElementById('clear-history-btn'),

    // Statistics
    statTotalCountries: document.getElementById('stat-total-countries'),
    statTotalPopulation: document.getElementById('stat-total-population'),
    statTotalContinents: document.getElementById('stat-total-continents'),
    statIndependentCount: document.getElementById('stat-independent-count'),

    // Controls & Filters
    regionPills: document.querySelectorAll('.region-pill'),
    subregionSelect: document.getElementById('subregion-select'),
    sortSelect: document.getElementById('sort-select'),
    pageSizeSelect: document.getElementById('page-size-select'),
    filterFavOnlyBtn: document.getElementById('filter-fav-only-btn'),
    resetFiltersBtn: document.getElementById('reset-filters-btn'),
    resultsCount: document.getElementById('results-count'),
    totalCount: document.getElementById('total-count'),
    activeFilterTags: document.getElementById('active-filter-tags'),
    viewGridBtn: document.getElementById('view-grid-btn'),
    viewCompactBtn: document.getElementById('view-compact-btn'),

    // Countries Display & States
    skeletonGrid: document.getElementById('skeleton-grid'),
    countriesGrid: document.getElementById('countries-grid'),
    emptyState: document.getElementById('empty-state'),
    emptyMessage: document.getElementById('empty-message'),
    emptyResetBtn: document.getElementById('empty-reset-btn'),
    errorState: document.getElementById('error-state'),
    errorMessage: document.getElementById('error-message'),
    retryFetchBtn: document.getElementById('retry-fetch-btn'),

    // Pagination
    paginationNav: document.getElementById('pagination-nav'),
    prevPageBtn: document.getElementById('prev-page-btn'),
    nextPageBtn: document.getElementById('next-page-btn'),
    paginationPages: document.getElementById('pagination-pages'),

    // Country Detail Modal
    detailModal: document.getElementById('detail-modal'),
    detailModalBackdrop: document.getElementById('detail-modal-backdrop'),
    closeModalBtn: document.getElementById('close-modal-btn'),
    modalHeaderFlag: document.getElementById('modal-header-flag'),
    modalCountryName: document.getElementById('modal-country-name'),
    modalCountryOfficial: document.getElementById('modal-country-official'),
    modalFavBtn: document.getElementById('modal-fav-btn'),
    modalCompareActionBtn: document.getElementById('modal-compare-action-btn'),
    modalFlagImg: document.getElementById('modal-flag-img'),
    modalFlagCaption: document.getElementById('modal-flag-caption'),
    modalCoatCard: document.getElementById('modal-coat-card'),
    modalCoatImg: document.getElementById('modal-coat-img'),
    modalCodeCca2: document.getElementById('modal-code-cca2'),
    modalCodeCca3: document.getElementById('modal-code-cca3'),
    modalCodeCcn3: document.getElementById('modal-code-ccn3'),
    modalStatusSovereign: document.getElementById('modal-status-sovereign'),
    modalStatusUn: document.getElementById('modal-status-un'),
    modalCapital: document.getElementById('modal-capital'),
    modalRegion: document.getElementById('modal-region'),
    modalSubregion: document.getElementById('modal-subregion'),
    modalContinents: document.getElementById('modal-continents'),
    modalLatlng: document.getElementById('modal-latlng'),
    modalArea: document.getElementById('modal-area'),
    modalLandlocked: document.getElementById('modal-landlocked'),
    modalPopulation: document.getElementById('modal-population'),
    modalLanguages: document.getElementById('modal-languages'),
    modalCurrencies: document.getElementById('modal-currencies'),
    modalCallingCode: document.getElementById('modal-calling-code'),
    modalTld: document.getElementById('modal-tld'),
    modalDrivingSide: document.getElementById('modal-driving-side'),
    modalTimezones: document.getElementById('modal-timezones'),
    modalBordersList: document.getElementById('modal-borders-list'),
    modalGoogleMaps: document.getElementById('modal-google-maps'),
    modalOsmMaps: document.getElementById('modal-osm-maps'),

    // Compare Modal
    compareModal: document.getElementById('compare-modal'),
    compareModalBackdrop: document.getElementById('compare-modal-backdrop'),
    closeCompareBtn: document.getElementById('close-compare-btn'),
    compareSelect1: document.getElementById('compare-select-1'),
    compareSelect2: document.getElementById('compare-select-2'),
    swapCompareBtn: document.getElementById('swap-compare-btn'),
    compareTableWrapper: document.getElementById('compare-table-wrapper'),

    // Utilities
    toastContainer: document.getElementById('toast-container'),
    backToTopBtn: document.getElementById('back-to-top')
  };

  /* ==========================================================================
     4. Data Extraction & Formatting Helpers (Safe Null Checks)
     ========================================================================== */
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

    getTimezones: (c) => {
      if (!Array.isArray(c?.timezones) || c.timezones.length === 0) return 'N/A';
      return c.timezones.join(', ');
    },

    getFlagSvg: (c) => c?.flags?.svg || c?.flags?.png || '',
    
    getCoatOfArmsSvg: (c) => c?.coatOfArms?.svg || c?.coatOfArms?.png || null,

    getGoogleMapsUrl: (c) => c?.maps?.googleMaps || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c?.name?.common || '')}`,
    
    getOsmMapsUrl: (c) => c?.maps?.openStreetMaps || `https://www.openstreetmap.org/search?query=${encodeURIComponent(c?.name?.common || '')}`
  };

  /* ==========================================================================
     5. Toast Notification System
     ========================================================================== */
  function showToast(message, type = 'info', duration = 3200) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
    } else {
      iconSvg = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }

    toast.innerHTML = `
      ${iconSvg}
      <span class="toast-msg">${message}</span>
    `;

    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-exit');
      toast.addEventListener('animationend', () => toast.remove());
    }, duration);
  }

  /* ==========================================================================
     6. Storage & State Persistence
     ========================================================================== */
  function loadPersistedState() {
    // Theme
    try {
      const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        state.theme = savedTheme;
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        state.theme = 'light';
      }
      applyTheme(state.theme);
    } catch (e) {
      console.warn('LocalStorage theme load error:', e);
    }

    // Favourites
    try {
      const savedFavs = localStorage.getItem(CONFIG.STORAGE_KEYS.FAVOURITES);
      if (savedFavs) {
        const parsed = JSON.parse(savedFavs);
        if (Array.isArray(parsed)) {
          state.favourites = new Set(parsed);
        }
      }
      updateFavCounters();
    } catch (e) {
      console.warn('LocalStorage favourites load error:', e);
    }

    // Search History
    try {
      const savedHistory = localStorage.getItem(CONFIG.STORAGE_KEYS.HISTORY);
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          state.searchHistory = parsed;
        }
      }
      renderSearchHistory();
    } catch (e) {
      console.warn('LocalStorage search history load error:', e);
    }

    // View Mode
    try {
      const savedView = localStorage.getItem(CONFIG.STORAGE_KEYS.VIEW_MODE);
      if (savedView === 'compact' || savedView === 'grid') {
        state.viewMode = savedView;
        setViewMode(savedView);
      }
    } catch (e) {
      console.warn('LocalStorage view mode load error:', e);
    }

    // Page Size
    try {
      const savedSize = localStorage.getItem(CONFIG.STORAGE_KEYS.PAGE_SIZE);
      if (savedSize) {
        state.pageSize = savedSize === 'all' ? 'all' : parseInt(savedSize, 10);
        DOM.pageSizeSelect.value = savedSize;
      }
    } catch (e) {
      console.warn('LocalStorage page size load error:', e);
    }
  }

  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, theme);
    } catch (e) {}
  }

  function saveFavourites() {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEYS.FAVOURITES, JSON.stringify([...state.favourites]));
    } catch (e) {}
    updateFavCounters();
  }

  function updateFavCounters() {
    const count = state.favourites.size;
    DOM.favCounterBadge.textContent = count;
    DOM.mobileFavCount.textContent = count;
  }

  function saveSearchHistory(query) {
    if (!query || !query.trim()) return;
    const cleanQuery = query.trim();
    // Move to front, remove duplicates
    state.searchHistory = [cleanQuery, ...state.searchHistory.filter(q => q.toLowerCase() !== cleanQuery.toLowerCase())]
      .slice(0, CONFIG.MAX_HISTORY_ITEMS);
    try {
      localStorage.setItem(CONFIG.STORAGE_KEYS.HISTORY, JSON.stringify(state.searchHistory));
    } catch (e) {}
    renderSearchHistory();
  }

  function renderSearchHistory() {
    if (state.searchHistory.length === 0) {
      DOM.recentSearchSection.classList.add('hidden');
      DOM.recentSearchChips.innerHTML = '';
      return;
    }

    DOM.recentSearchSection.classList.remove('hidden');
    DOM.recentSearchChips.innerHTML = state.searchHistory.map(q => `
      <button class="recent-chip" data-query="${escapeHtml(q)}">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <span>${escapeHtml(q)}</span>
      </button>
    `).join('');
  }

  /* ==========================================================================
     7. Multi-Tier Resilient API Fetching Engine
     ========================================================================== */
  async function fetchWithTimeout(url, timeoutMs = 3000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  async function fetchCountryData() {
    setLoadingState(true);
    setErrorState(false);

    let rawData = null;

    // Strategy 1: Attempt the official REST Countries API endpoint
    try {
      console.log('Attempting REST Countries primary API...');
      const response = await fetchWithTimeout(`${CONFIG.API_PRIMARY_BASE}/all`, 2500);
      if (response.ok) {
        const json = await response.json();
        // Check if real array of countries or deprecation object
        if (Array.isArray(json) && json.length > 50) {
          rawData = json;
          console.log(`Loaded ${json.length} countries from Primary REST Countries API.`);
        } else if (json && json.errors) {
          console.warn('Primary API returned deprecation notice:', json.errors[0]?.message);
        }
      }
    } catch (err) {
      console.warn('Primary REST Countries API request failed or timed out:', err.message);
    }

    // Strategy 2: If primary was deprecated (v3.1 notice) or blocked, load from official GitHub repository CDN
    if (!rawData) {
      try {
        console.log('Falling back to official REST Countries v3.1 CDN dataset...');
        const cdnResponse = await fetchWithTimeout(CONFIG.API_CDN_FALLBACK, 3000);
        if (cdnResponse.ok) {
          const json = await cdnResponse.json();
          if (Array.isArray(json) && json.length > 50) {
            rawData = json;
            console.log(`Loaded ${json.length} countries from Official Repository CDN.`);
          }
        }
      } catch (err) {
        console.warn('CDN dataset request failed or timed out:', err.message);
      }
    }

    // Strategy 3: Zero-failure offline & file:// bundled dataset (Instantaneous)
    if (!rawData) {
      if (typeof window !== 'undefined' && Array.isArray(window.LOCAL_COUNTRIES_DATA) && window.LOCAL_COUNTRIES_DATA.length > 50) {
        console.log(`Loaded ${window.LOCAL_COUNTRIES_DATA.length} countries from Window Preloaded Dataset.`);
        rawData = window.LOCAL_COUNTRIES_DATA;
      } else {
        try {
          console.log('Falling back to local bundled dataset via fetch...');
          const localResponse = await fetch(CONFIG.API_LOCAL_FALLBACK);
          if (localResponse.ok) {
            const json = await localResponse.json();
            if (Array.isArray(json) && json.length > 50) {
              rawData = json;
              console.log(`Loaded ${json.length} countries from Local Bundled JSON.`);
            }
          }
        } catch (err) {
          console.error('Local fallback failed:', err);
        }
      }
    }

    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
      setLoadingState(false);
      setErrorState(true, 'Could not retrieve country dataset from any source. Please check your network connection.');
      return;
    }

    // Successfully retrieved dataset
    processCountriesData(rawData);
    setLoadingState(false);
  }

  function processCountriesData(data) {
    state.allCountries = data;
    state.countryCodeMap.clear();

    // Index countries by CCA3, CCA2, and common name for instant O(1) lookups
    data.forEach(country => {
      if (country.cca3) state.countryCodeMap.set(country.cca3.toUpperCase(), country);
      if (country.cca2) state.countryCodeMap.set(country.cca2.toUpperCase(), country);
      if (country.cioc) state.countryCodeMap.set(country.cioc.toUpperCase(), country);
    });

    // Populate Subregions dropdown
    populateSubregionOptions(data);

    // Compute Global Statistics
    calculateGlobalStatistics(data);

    // Populate Comparison dropdowns
    populateCompareSelects(data);

    // Initial Filter & Render
    applyFiltersAndSort();
  }

  function calculateGlobalStatistics(countries) {
    const totalCount = countries.length;
    DOM.statTotalCountries.textContent = totalCount;

    // Total Population
    const totalPop = countries.reduce((acc, c) => acc + (c.population || 0), 0);
    DOM.statTotalPopulation.textContent = totalPop >= 1e9 
      ? (totalPop / 1e9).toFixed(2) + ' Billion'
      : totalPop.toLocaleString('en-US');

    // Distinct Continents
    const continentsSet = new Set();
    countries.forEach(c => {
      if (Array.isArray(c.continents)) {
        c.continents.forEach(cont => continentsSet.add(cont));
      } else if (c.region) {
        continentsSet.add(c.region);
      }
    });
    DOM.statTotalContinents.textContent = continentsSet.size || 7;

    // Sovereign Independent Countries
    const independentCount = countries.filter(c => c.independent === true).length;
    DOM.statIndependentCount.textContent = independentCount;
  }

  function populateSubregionOptions(countries) {
    const subregions = new Set();
    countries.forEach(c => {
      if (c.subregion) subregions.add(c.subregion);
    });

    const sortedSubregions = Array.from(subregions).sort();
    DOM.subregionSelect.innerHTML = '<option value="all">All Subregions</option>';
    sortedSubregions.forEach(sub => {
      const opt = document.createElement('option');
      opt.value = sub;
      opt.textContent = sub;
      DOM.subregionSelect.appendChild(opt);
    });
  }

  function updateSubregionsForRegion(region) {
    const subregions = new Set();
    const source = region === 'all' 
      ? state.allCountries 
      : state.allCountries.filter(c => c.region === region);

    source.forEach(c => {
      if (c.subregion) subregions.add(c.subregion);
    });

    const sorted = Array.from(subregions).sort();
    const currentVal = DOM.subregionSelect.value;
    
    DOM.subregionSelect.innerHTML = '<option value="all">All Subregions</option>';
    sorted.forEach(sub => {
      const opt = document.createElement('option');
      opt.value = sub;
      opt.textContent = sub;
      DOM.subregionSelect.appendChild(opt);
    });

    if (sorted.includes(currentVal)) {
      DOM.subregionSelect.value = currentVal;
    } else {
      DOM.subregionSelect.value = 'all';
      state.activeSubregion = 'all';
    }
  }

  /* ==========================================================================
     8. Filter, Search & Sorting Engine
     ========================================================================== */
  function applyFiltersAndSort() {
    let results = [...state.allCountries];

    // 1. Search Query Filter
    const query = state.searchQuery.trim().toLowerCase();
    if (query) {
      results = results.filter(country => {
        const commonName = (country?.name?.common || '').toLowerCase();
        const officialName = (country?.name?.official || '').toLowerCase();
        const cca2 = (country?.cca2 || '').toLowerCase();
        const cca3 = (country?.cca3 || '').toLowerCase();
        const capital = Array.isArray(country?.capital) ? country.capital.map(k => k.toLowerCase()).join(' ') : '';
        
        return commonName.includes(query) ||
               officialName.includes(query) ||
               cca2 === query ||
               cca3 === query ||
               capital.includes(query);
      });
    }

    // 2. Region Filter
    if (state.activeRegion !== 'all') {
      results = results.filter(c => c.region === state.activeRegion);
    }

    // 3. Subregion Filter
    if (state.activeSubregion !== 'all') {
      results = results.filter(c => c.subregion === state.activeSubregion);
    }

    // 4. Favourites Only Filter
    if (state.favouritesOnly) {
      results = results.filter(c => state.favourites.has(c.cca3));
    }

    // 5. Sorting
    results.sort((a, b) => {
      switch (state.activeSort) {
        case 'name-asc':
          return (a?.name?.common || '').localeCompare(b?.name?.common || '');
        case 'name-desc':
          return (b?.name?.common || '').localeCompare(a?.name?.common || '');
        case 'pop-desc':
          return (b?.population || 0) - (a?.population || 0);
        case 'pop-asc':
          return (a?.population || 0) - (b?.population || 0);
        case 'area-desc':
          return (b?.area || 0) - (a?.area || 0);
        case 'area-asc':
          return (a?.area || 0) - (b?.area || 0);
        default:
          return 0;
      }
    });

    state.filteredCountries = results;
    state.currentPage = 1;

    renderResultsMeta();
    renderCountriesGrid();
  }

  function renderResultsMeta() {
    DOM.resultsCount.textContent = state.filteredCountries.length;
    DOM.totalCount.textContent = state.allCountries.length;

    // Render active filter tags
    const tags = [];
    if (state.searchQuery) {
      tags.push({ label: `Search: "${state.searchQuery}"`, type: 'search' });
    }
    if (state.activeRegion !== 'all') {
      tags.push({ label: `Region: ${state.activeRegion}`, type: 'region' });
    }
    if (state.activeSubregion !== 'all') {
      tags.push({ label: `Subregion: ${state.activeSubregion}`, type: 'subregion' });
    }
    if (state.favouritesOnly) {
      tags.push({ label: 'Favourites Only', type: 'fav' });
    }

    DOM.activeFilterTags.innerHTML = tags.map(tag => `
      <span class="filter-tag">
        ${escapeHtml(tag.label)}
        <button data-tag-type="${tag.type}" aria-label="Remove filter">&times;</button>
      </span>
    `).join('');
  }

  /* ==========================================================================
     9. UI Rendering: Country Cards & Grid
     ========================================================================== */
  function renderCountriesGrid() {
    const list = state.filteredCountries;

    // Check empty state
    if (list.length === 0) {
      DOM.countriesGrid.classList.add('hidden');
      DOM.paginationNav.classList.add('hidden');
      DOM.emptyState.classList.remove('hidden');

      if (state.favouritesOnly) {
        DOM.emptyMessage.textContent = "You haven't added any countries to your favourites yet. Click the heart icon on any country card to save it!";
      } else if (state.searchQuery) {
        DOM.emptyMessage.textContent = `No countries match "${escapeHtml(state.searchQuery)}". Check the spelling or try searching by code (e.g. IN, USA, FR).`;
      } else {
        DOM.emptyMessage.textContent = "No countries match the selected filter combination. Click Reset to show all countries.";
      }
      return;
    }

    DOM.emptyState.classList.add('hidden');
    DOM.countriesGrid.classList.remove('hidden');

    // Pagination slice
    let pageItems = list;
    if (state.pageSize !== 'all') {
      const size = parseInt(state.pageSize, 10);
      const start = (state.currentPage - 1) * size;
      const end = start + size;
      pageItems = list.slice(start, end);
    }

    // Generate HTML for cards
    DOM.countriesGrid.innerHTML = pageItems.map(c => createCountryCardHtml(c)).join('');

    // Render Pagination Controls
    renderPagination();
  }

  function createCountryCardHtml(country) {
    const commonName = DataHelper.getName(country);
    const officialName = DataHelper.getOfficialName(country);
    const capital = DataHelper.getCapital(country);
    const region = DataHelper.getRegion(country);
    const population = DataHelper.getPopulation(country);
    const area = DataHelper.getArea(country);
    const flagSvg = DataHelper.getFlagSvg(country);
    const cca3 = country?.cca3 || '';
    const cca2 = country?.cca2 || '';
    
    const isFav = state.favourites.has(cca3);
    const isComparing = state.compareCodes.includes(cca3);

    return `
      <article class="country-card" data-cca3="${cca3}">
        <div class="card-flag-wrapper">
          <img 
            class="card-flag-img" 
            src="${flagSvg}" 
            alt="Flag of ${escapeHtml(commonName)}" 
            loading="lazy"
            onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 60\\'><rect width=\\'100\\' height=\\'60\\' fill=\\'%231e293b\\'/><text x=\\'50%\\' y=\\'50%\\' fill=\\'%2394a3b8\\' font-size=\\'12\\' text-anchor=\\'middle\\' dominant-baseline=\\'middle\\'>Flag Unavailable</text></svg>'"
          />
          <div class="card-floating-actions">
            <button 
              class="card-icon-btn fav-btn ${isFav ? 'is-fav' : ''}" 
              data-cca3="${cca3}" 
              aria-label="${isFav ? 'Remove from favourites' : 'Add to favourites'}"
              title="${isFav ? 'Remove favourite' : 'Add favourite'}"
            >
              <svg viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
            <button 
              class="card-icon-btn compare-btn ${isComparing ? 'is-comparing' : ''}" 
              data-cca3="${cca3}" 
              aria-label="Add to comparison"
              title="Compare Country"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"></path>
                <path d="M2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"></path>
                <path d="M7 21h10"></path>
                <path d="M12 3v18"></path>
              </svg>
            </button>
          </div>
          <span class="card-region-tag">${escapeHtml(region)}</span>
        </div>

        <div class="card-body">
          <div class="card-title-row">
            <h3 class="card-country-name">
              <span>${escapeHtml(commonName)}</span>
              <span class="card-code">${escapeHtml(cca3 || cca2)}</span>
            </h3>
            <p class="card-official-name" title="${escapeHtml(officialName)}">${escapeHtml(officialName)}</p>
          </div>

          <div class="card-stats-list">
            <div class="card-stat-item">
              <span class="stat-item-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                Capital
              </span>
              <span class="stat-item-value">${escapeHtml(capital)}</span>
            </div>

            <div class="card-stat-item">
              <span class="stat-item-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                </svg>
                Population
              </span>
              <span class="stat-item-value">${escapeHtml(population)}</span>
            </div>

            <div class="card-stat-item">
              <span class="stat-item-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                  <line x1="8" y1="2" x2="8" y2="18"></line>
                </svg>
                Area
              </span>
              <span class="stat-item-value">${escapeHtml(area)}</span>
            </div>
          </div>

          <div class="card-actions-row">
            <button class="btn-view-details" data-action="view-details" data-cca3="${cca3}">
              <span>View Details</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            <button class="btn-card-compare ${isComparing ? 'active' : ''}" data-action="compare" data-cca3="${cca3}" title="Compare country">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"></path>
                <path d="M2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"></path>
                <path d="M7 21h10"></path>
                <path d="M12 3v18"></path>
              </svg>
            </button>
          </div>
        </div>
      </article>
    `;
  }

  /* ==========================================================================
     10. Pagination Engine
     ========================================================================== */
  function renderPagination() {
    if (state.pageSize === 'all') {
      DOM.paginationNav.classList.add('hidden');
      return;
    }

    const total = state.filteredCountries.length;
    const size = parseInt(state.pageSize, 10);
    const totalPages = Math.ceil(total / size);

    if (totalPages <= 1) {
      DOM.paginationNav.classList.add('hidden');
      return;
    }

    DOM.paginationNav.classList.remove('hidden');
    DOM.prevPageBtn.disabled = state.currentPage === 1;
    DOM.nextPageBtn.disabled = state.currentPage === totalPages;

    // Generate pagination numbers with ellipsis
    const pages = [];
    const current = state.currentPage;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');

      const start = Math.max(2, current - 1);
      const end = Math.min(totalPages - 1, current + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (current < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    DOM.paginationPages.innerHTML = pages.map(p => {
      if (p === '...') {
        return '<span class="page-ellipsis">&hellip;</span>';
      }
      return `
        <button class="page-num-btn ${p === current ? 'active' : ''}" data-page="${p}">
          ${p}
        </button>
      `;
    }).join('');
  }

  function goToPage(pageNum) {
    const size = parseInt(state.pageSize, 10);
    const totalPages = Math.ceil(state.filteredCountries.length / size);

    if (pageNum < 1 || pageNum > totalPages) return;
    state.currentPage = pageNum;
    renderCountriesGrid();

    // Smooth scroll to top of main dashboard
    DOM.countriesGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ==========================================================================
     11. Live Autocomplete & Search Engine
     ========================================================================== */
  let searchDebounceTimer = null;

  function handleSearchInput(e) {
    const value = e.target.value;
    state.searchQuery = value;

    // Toggle clear button
    if (value.trim().length > 0) {
      DOM.clearSearchBtn.classList.remove('hidden');
    } else {
      DOM.clearSearchBtn.classList.add('hidden');
    }

    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      showAutocompleteSuggestions(value.trim());
      applyFiltersAndSort();
    }, CONFIG.SEARCH_DEBOUNCE_MS);
  }

  function showAutocompleteSuggestions(query) {
    if (!query || query.length < 1) {
      DOM.autocompleteDropdown.classList.add('hidden');
      DOM.autocompleteDropdown.innerHTML = '';
      return;
    }

    const q = query.toLowerCase();
    const matches = state.allCountries.filter(c => {
      const name = (c?.name?.common || '').toLowerCase();
      const official = (c?.name?.official || '').toLowerCase();
      const code2 = (c?.cca2 || '').toLowerCase();
      const code3 = (c?.cca3 || '').toLowerCase();
      const capital = Array.isArray(c?.capital) ? c.capital.map(k => k.toLowerCase()).join(' ') : '';
      return name.includes(q) || official.includes(q) || code2 === q || code3 === q || capital.includes(q);
    }).slice(0, CONFIG.MAX_SUGGESTIONS);

    if (matches.length === 0) {
      DOM.autocompleteDropdown.classList.add('hidden');
      DOM.autocompleteDropdown.innerHTML = '';
      return;
    }

    DOM.autocompleteDropdown.innerHTML = matches.map(c => {
      const common = DataHelper.getName(c);
      const capital = DataHelper.getCapital(c);
      const region = DataHelper.getRegion(c);
      const flag = DataHelper.getFlagSvg(c);
      const cca3 = c.cca3 || '';

      return `
        <div class="suggestion-item" data-cca3="${cca3}">
          <img class="suggestion-flag" src="${flag}" alt="Flag" loading="lazy">
          <div class="suggestion-info">
            <div class="suggestion-name">${highlightMatch(common, q)}</div>
            <div class="suggestion-meta">
              <span>Capital: ${highlightMatch(capital, q)}</span>
              <span class="suggestion-badge">${region}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    DOM.autocompleteDropdown.classList.remove('hidden');
  }

  function highlightMatch(text, query) {
    if (!text || !query) return escapeHtml(text || '');
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return escapeHtml(text);

    const before = text.substring(0, idx);
    const match = text.substring(idx, idx + query.length);
    const after = text.substring(idx + query.length);
    return `${escapeHtml(before)}<strong style="color:var(--accent-primary);">${escapeHtml(match)}</strong>${escapeHtml(after)}`;
  }

  function selectSuggestion(cca3) {
    DOM.autocompleteDropdown.classList.add('hidden');
    DOM.autocompleteDropdown.innerHTML = '';
    
    const country = state.countryCodeMap.get(cca3.toUpperCase());
    if (country) {
      DOM.searchInput.value = country.name.common;
      state.searchQuery = country.name.common;
      saveSearchHistory(country.name.common);
      openCountryDetailModal(country);
    }
  }

  /* ==========================================================================
     12. Country Detail Modal
     ========================================================================== */
  function openCountryDetailModal(country) {
    if (!country) return;
    state.currentModalCountry = country;

    const commonName = DataHelper.getName(country);
    const officialName = DataHelper.getOfficialName(country);
    const capital = DataHelper.getCapital(country);
    const region = DataHelper.getRegion(country);
    const subregion = DataHelper.getSubregion(country);
    const continents = DataHelper.getContinents(country);
    const population = DataHelper.getPopulation(country);
    const area = DataHelper.getArea(country);
    const currencies = DataHelper.getCurrencies(country);
    const languages = DataHelper.getLanguages(country);
    const timezones = DataHelper.getTimezones(country);
    const callingCode = DataHelper.getCallingCode(country);
    const drivingSide = country?.car?.side ? (country.car.side.charAt(0).toUpperCase() + country.car.side.slice(1)) : 'Right';
    const tld = Array.isArray(country?.tld) ? country.tld.join(', ') : 'N/A';
    const latlng = (Array.isArray(country?.latlng) && country.latlng.length === 2) 
      ? `${country.latlng[0].toFixed(2)}°, ${country.latlng[1].toFixed(2)}°` 
      : 'N/A';
    const landlocked = country?.landlocked ? 'Yes (No direct coastline)' : 'No (Has maritime coast)';

    // Header info
    DOM.modalCountryName.textContent = commonName;
    DOM.modalCountryOfficial.textContent = officialName;
    DOM.modalHeaderFlag.src = DataHelper.getFlagSvg(country);
    DOM.modalHeaderFlag.alt = `Flag of ${commonName}`;

    // Flag & Coat of Arms
    DOM.modalFlagImg.src = DataHelper.getFlagSvg(country);
    DOM.modalFlagImg.alt = `Flag of ${commonName}`;
    DOM.modalFlagCaption.textContent = country?.flags?.alt || `Official flag of ${commonName}`;

    const coatSvg = DataHelper.getCoatOfArmsSvg(country);
    if (coatSvg) {
      DOM.modalCoatCard.classList.remove('hidden');
      DOM.modalCoatImg.src = coatSvg;
      DOM.modalCoatImg.alt = `Coat of Arms of ${commonName}`;
    } else {
      DOM.modalCoatCard.classList.add('hidden');
    }

    // Status Badges & Codes
    DOM.modalCodeCca2.textContent = country?.cca2 || '-';
    DOM.modalCodeCca3.textContent = country?.cca3 || '-';
    DOM.modalCodeCcn3.textContent = country?.ccn3 || '-';

    DOM.modalStatusSovereign.textContent = country?.independent ? 'Sovereign State' : 'Territory / Dependency';
    DOM.modalStatusSovereign.className = country?.independent ? 'badge badge-success' : 'badge badge-info';

    DOM.modalStatusUn.textContent = country?.unMember ? 'UN Member' : 'Non-UN Member';
    DOM.modalStatusUn.className = country?.unMember ? 'badge badge-info' : 'badge code-badge';

    // Detailed metrics
    DOM.modalCapital.textContent = capital;
    DOM.modalRegion.textContent = region;
    DOM.modalSubregion.textContent = subregion;
    DOM.modalContinents.textContent = continents;
    DOM.modalLatlng.textContent = latlng;
    DOM.modalArea.textContent = area;
    DOM.modalLandlocked.textContent = landlocked;

    DOM.modalPopulation.textContent = population;
    DOM.modalLanguages.textContent = languages;
    DOM.modalCurrencies.textContent = currencies;
    DOM.modalCallingCode.textContent = callingCode;
    DOM.modalTld.textContent = tld;
    DOM.modalDrivingSide.textContent = drivingSide;
    DOM.modalTimezones.textContent = timezones;

    // Interactive Neighbouring Border Countries
    renderBordersList(country);

    // Maps Links
    DOM.modalGoogleMaps.href = DataHelper.getGoogleMapsUrl(country);
    DOM.modalOsmMaps.href = DataHelper.getOsmMapsUrl(country);

    // Favourites & Compare button status in Modal
    updateModalActionButtons(country);

    // Reveal Modal
    DOM.detailModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function renderBordersList(country) {
    DOM.modalBordersList.innerHTML = '';
    const borders = country?.borders;

    if (!Array.isArray(borders) || borders.length === 0) {
      DOM.modalBordersList.innerHTML = '<span class="no-borders-msg">Island nation or territory with no direct land borders.</span>';
      return;
    }

    borders.forEach(code => {
      const neighbor = state.countryCodeMap.get(code.toUpperCase());
      const btn = document.createElement('button');
      btn.className = 'border-pill-btn';
      btn.dataset.cca3 = code;

      if (neighbor) {
        const flag = DataHelper.getFlagSvg(neighbor);
        const name = DataHelper.getName(neighbor);
        btn.innerHTML = `<img src="${flag}" alt="Flag" loading="lazy"> <span>${escapeHtml(name)} (${code})</span>`;
      } else {
        btn.innerHTML = `<span>Country (${code})</span>`;
      }

      btn.addEventListener('click', () => {
        if (neighbor) {
          openCountryDetailModal(neighbor);
        } else {
          showToast(`Information for country code "${code}" is unavailable.`, 'info');
        }
      });

      DOM.modalBordersList.appendChild(btn);
    });
  }

  function updateModalActionButtons(country) {
    const cca3 = country?.cca3;
    const isFav = state.favourites.has(cca3);
    const isComparing = state.compareCodes.includes(cca3);

    DOM.modalFavBtn.className = `modal-action-btn ${isFav ? 'is-fav' : ''}`;
    DOM.modalFavBtn.title = isFav ? 'Remove from Favourites' : 'Add to Favourites';

    DOM.modalCompareActionBtn.className = `modal-action-btn ${isComparing ? 'is-fav' : ''}`;
    DOM.modalCompareActionBtn.title = isComparing ? 'Remove from Comparison' : 'Add to Comparison';
  }

  function closeDetailModal() {
    DOM.detailModal.classList.add('hidden');
    document.body.style.overflow = '';
    state.currentModalCountry = null;
  }

  /* ==========================================================================
     13. Country Comparison Engine & Modal
     ========================================================================== */
  function populateCompareSelects(countries) {
    const sorted = [...countries].sort((a, b) => (a?.name?.common || '').localeCompare(b?.name?.common || ''));

    const optionsHtml = '<option value="">-- Choose a country --</option>' + sorted.map(c => `
      <option value="${c.cca3}">${escapeHtml(c?.name?.common || '')} (${c.cca3})</option>
    `).join('');

    DOM.compareSelect1.innerHTML = optionsHtml;
    DOM.compareSelect2.innerHTML = optionsHtml;
  }

  function openCompareModal(country1 = null, country2 = null) {
    // If specific countries are passed, populate them
    if (country1) state.compareCodes[0] = country1.cca3;
    if (country2) state.compareCodes[1] = country2.cca3;

    // Set defaults if null
    if (!state.compareCodes[0] && state.allCountries.length >= 2) {
      state.compareCodes[0] = 'IND'; // India default
    }
    if (!state.compareCodes[1] && state.allCountries.length >= 2) {
      state.compareCodes[1] = 'USA'; // USA default
    }

    DOM.compareSelect1.value = state.compareCodes[0] || '';
    DOM.compareSelect2.value = state.compareCodes[1] || '';

    renderComparisonTable();

    DOM.compareModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeCompareModal() {
    DOM.compareModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function toggleCompareCountry(cca3) {
    if (!cca3) return;

    if (state.compareCodes[0] === cca3) {
      state.compareCodes[0] = null;
      showToast('Country removed from comparison.', 'info');
    } else if (state.compareCodes[1] === cca3) {
      state.compareCodes[1] = null;
      showToast('Country removed from comparison.', 'info');
    } else {
      if (!state.compareCodes[0]) {
        state.compareCodes[0] = cca3;
      } else {
        state.compareCodes[1] = cca3;
      }
      const c = state.countryCodeMap.get(cca3);
      showToast(`Added ${c?.name?.common || cca3} to comparison.`, 'success');
      
      // If both countries are set, open compare modal directly
      if (state.compareCodes[0] && state.compareCodes[1]) {
        openCompareModal();
      }
    }

    updateCompareBadges();
    renderCountriesGrid();
  }

  function updateCompareBadges() {
    const activeCount = state.compareCodes.filter(Boolean).length;
    DOM.compareCounterBadge.textContent = activeCount;
    DOM.mobileCompareCount.textContent = activeCount;
  }

  function swapComparisonCountries() {
    const temp = state.compareCodes[0];
    state.compareCodes[0] = state.compareCodes[1];
    state.compareCodes[1] = temp;

    DOM.compareSelect1.value = state.compareCodes[0] || '';
    DOM.compareSelect2.value = state.compareCodes[1] || '';

    renderComparisonTable();
  }

  function renderComparisonTable() {
    const c1 = state.countryCodeMap.get(state.compareCodes[0]);
    const c2 = state.countryCodeMap.get(state.compareCodes[1]);

    if (!c1 || !c2) {
      DOM.compareTableWrapper.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-secondary);">
          <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">Select two countries above to view their side-by-side comparison.</p>
          <p style="font-size: 0.88rem; color: var(--text-muted);">Compare demographics, landmass, economic currencies, and timezones in real time.</p>
        </div>
      `;
      return;
    }

    // Population bar comparison
    const maxPop = Math.max(c1.population || 0, c2.population || 0, 1);
    const popPct1 = Math.round(((c1.population || 0) / maxPop) * 100);
    const popPct2 = Math.round(((c2.population || 0) / maxPop) * 100);

    // Area bar comparison
    const maxArea = Math.max(c1.area || 0, c2.area || 0, 1);
    const areaPct1 = Math.round(((c1.area || 0) / maxArea) * 100);
    const areaPct2 = Math.round(((c2.area || 0) / maxArea) * 100);

    DOM.compareTableWrapper.innerHTML = `
      <div class="compare-grid">
        <!-- Country 1 Card Column -->
        <div class="compare-country-col">
          <div class="compare-flag-banner">
            <img src="${DataHelper.getFlagSvg(c1)}" alt="Flag of ${escapeHtml(c1.name.common)}">
          </div>
          <div class="compare-col-header">
            <h3 class="compare-col-name">${escapeHtml(c1.name.common)}</h3>
            <p class="compare-col-capital">Capital: ${escapeHtml(DataHelper.getCapital(c1))}</p>
          </div>

          <!-- Population Gauge -->
          <div class="compare-bar-container">
            <div class="compare-bar-label">
              <span>Population: ${DataHelper.getPopulation(c1)}</span>
              <span>${popPct1}%</span>
            </div>
            <div class="compare-progress-track">
              <div class="compare-progress-fill" style="width: ${popPct1}%;"></div>
            </div>
          </div>

          <!-- Area Gauge -->
          <div class="compare-bar-container">
            <div class="compare-bar-label">
              <span>Surface Area: ${DataHelper.getArea(c1)}</span>
              <span>${areaPct1}%</span>
            </div>
            <div class="compare-progress-track">
              <div class="compare-progress-fill" style="width: ${areaPct1}%; background: linear-gradient(135deg, #10b981, #06b6d4);"></div>
            </div>
          </div>

          <!-- Key Metrics -->
          <div class="detail-pairs" style="margin-top: 0.5rem;">
            <div class="detail-pair">
              <span class="detail-key">Region / Continent:</span>
              <span class="detail-val">${escapeHtml(c1.region)} (${escapeHtml(DataHelper.getContinents(c1))})</span>
            </div>
            <div class="detail-pair">
              <span class="detail-key">Subregion:</span>
              <span class="detail-val">${escapeHtml(DataHelper.getSubregion(c1))}</span>
            </div>
            <div class="detail-pair">
              <span class="detail-key">Official Languages:</span>
              <span class="detail-val">${escapeHtml(DataHelper.getLanguages(c1))}</span>
            </div>
            <div class="detail-pair">
              <span class="detail-key">Currencies:</span>
              <span class="detail-val">${escapeHtml(DataHelper.getCurrencies(c1))}</span>
            </div>
            <div class="detail-pair">
              <span class="detail-key">Timezones:</span>
              <span class="detail-val">${escapeHtml(DataHelper.getTimezones(c1))}</span>
            </div>
            <div class="detail-pair">
              <span class="detail-key">Calling Code:</span>
              <span class="detail-val">${escapeHtml(DataHelper.getCallingCode(c1))}</span>
            </div>
            <div class="detail-pair">
              <span class="detail-key">Driving Side:</span>
              <span class="detail-val">${c1.car?.side || 'Right'}</span>
            </div>
            <div class="detail-pair">
              <span class="detail-key">UN Member:</span>
              <span class="detail-val">${c1.unMember ? 'Yes' : 'No'}</span>
            </div>
          </div>

          <a href="${DataHelper.getGoogleMapsUrl(c1)}" target="_blank" rel="noopener noreferrer" class="map-link-btn google-maps-btn" style="margin-top: 1rem; text-align: center; justify-content: center;">
            <span>Explore in Google Maps</span>
          </a>
        </div>

        <!-- Country 2 Card Column -->
        <div class="compare-country-col">
          <div class="compare-flag-banner">
            <img src="${DataHelper.getFlagSvg(c2)}" alt="Flag of ${escapeHtml(c2.name.common)}">
          </div>
          <div class="compare-col-header">
            <h3 class="compare-col-name">${escapeHtml(c2.name.common)}</h3>
            <p class="compare-col-capital">Capital: ${escapeHtml(DataHelper.getCapital(c2))}</p>
          </div>

          <!-- Population Gauge -->
          <div class="compare-bar-container">
            <div class="compare-bar-label">
              <span>Population: ${DataHelper.getPopulation(c2)}</span>
              <span>${popPct2}%</span>
            </div>
            <div class="compare-progress-track">
              <div class="compare-progress-fill" style="width: ${popPct2}%;"></div>
            </div>
          </div>

          <!-- Area Gauge -->
          <div class="compare-bar-container">
            <div class="compare-bar-label">
              <span>Surface Area: ${DataHelper.getArea(c2)}</span>
              <span>${areaPct2}%</span>
            </div>
            <div class="compare-progress-track">
              <div class="compare-progress-fill" style="width: ${areaPct2}%; background: linear-gradient(135deg, #10b981, #06b6d4);"></div>
            </div>
          </div>

          <!-- Key Metrics -->
          <div class="detail-pairs" style="margin-top: 0.5rem;">
            <div class="detail-pair">
              <span class="detail-key">Region / Continent:</span>
              <span class="detail-val">${escapeHtml(c2.region)} (${escapeHtml(DataHelper.getContinents(c2))})</span>
            </div>
            <div class="detail-pair">
              <span class="detail-key">Subregion:</span>
              <span class="detail-val">${escapeHtml(DataHelper.getSubregion(c2))}</span>
            </div>
            <div class="detail-pair">
              <span class="detail-key">Official Languages:</span>
              <span class="detail-val">${escapeHtml(DataHelper.getLanguages(c2))}</span>
            </div>
            <div class="detail-pair">
              <span class="detail-key">Currencies:</span>
              <span class="detail-val">${escapeHtml(DataHelper.getCurrencies(c2))}</span>
            </div>
            <div class="detail-pair">
              <span class="detail-key">Timezones:</span>
              <span class="detail-val">${escapeHtml(DataHelper.getTimezones(c2))}</span>
            </div>
            <div class="detail-pair">
              <span class="detail-key">Calling Code:</span>
              <span class="detail-val">${escapeHtml(DataHelper.getCallingCode(c2))}</span>
            </div>
            <div class="detail-pair">
              <span class="detail-key">Driving Side:</span>
              <span class="detail-val">${c2.car?.side || 'Right'}</span>
            </div>
            <div class="detail-pair">
              <span class="detail-key">UN Member:</span>
              <span class="detail-val">${c2.unMember ? 'Yes' : 'No'}</span>
            </div>
          </div>

          <a href="${DataHelper.getGoogleMapsUrl(c2)}" target="_blank" rel="noopener noreferrer" class="map-link-btn google-maps-btn" style="margin-top: 1rem; text-align: center; justify-content: center;">
            <span>Explore in Google Maps</span>
          </a>
        </div>
      </div>
    `;
  }

  /* ==========================================================================
     14. Favourites & Random Country Discovery
     ========================================================================== */
  function toggleFavourite(cca3) {
    if (!cca3) return;

    if (state.favourites.has(cca3)) {
      state.favourites.delete(cca3);
      const c = state.countryCodeMap.get(cca3);
      showToast(`Removed ${c?.name?.common || cca3} from favourites.`, 'info');
    } else {
      state.favourites.add(cca3);
      const c = state.countryCodeMap.get(cca3);
      showToast(`Added ${c?.name?.common || cca3} to favourites!`, 'success');
    }

    saveFavourites();

    // If modal is open, update its favorite button
    if (state.currentModalCountry && state.currentModalCountry.cca3 === cca3) {
      updateModalActionButtons(state.currentModalCountry);
    }

    // Re-render
    if (state.favouritesOnly) {
      applyFiltersAndSort();
    } else {
      renderCountriesGrid();
    }
  }

  function discoverRandomCountry() {
    if (!state.allCountries || state.allCountries.length === 0) return;
    const randomIndex = Math.floor(Math.random() * state.allCountries.length);
    const country = state.allCountries[randomIndex];
    
    showToast(`Discovered ${country.name.common}! Exploring...`, 'info', 2500);
    openCountryDetailModal(country);
  }

  /* ==========================================================================
     15. View Mode (Grid vs Compact)
     ========================================================================== */
  function setViewMode(mode) {
    state.viewMode = mode;
    try {
      localStorage.setItem(CONFIG.STORAGE_KEYS.VIEW_MODE, mode);
    } catch (e) {}

    if (mode === 'compact') {
      DOM.countriesGrid.classList.add('compact-view');
      DOM.viewCompactBtn.classList.add('active');
      DOM.viewGridBtn.classList.remove('active');
    } else {
      DOM.countriesGrid.classList.remove('compact-view');
      DOM.viewGridBtn.classList.add('active');
      DOM.viewCompactBtn.classList.remove('active');
    }
  }

  /* ==========================================================================
     16. Reset Controls & Filters
     ========================================================================== */
  function resetAllFilters() {
    state.activeRegion = 'all';
    state.activeSubregion = 'all';
    state.activeSort = 'name-asc';
    state.searchQuery = '';
    state.favouritesOnly = false;
    state.currentPage = 1;

    // Reset UI
    DOM.searchInput.value = '';
    DOM.clearSearchBtn.classList.add('hidden');
    DOM.autocompleteDropdown.classList.add('hidden');
    DOM.sortSelect.value = 'name-asc';
    DOM.subregionSelect.value = 'all';

    DOM.regionPills.forEach(pill => {
      if (pill.dataset.region === 'all') {
        pill.classList.add('active');
        pill.setAttribute('aria-selected', 'true');
      } else {
        pill.classList.remove('active');
        pill.setAttribute('aria-selected', 'false');
      }
    });

    DOM.filterFavOnlyBtn.classList.remove('active');
    DOM.filterFavOnlyBtn.setAttribute('aria-pressed', 'false');

    updateSubregionsForRegion('all');
    applyFiltersAndSort();
    showToast('All filters have been reset.', 'info');
  }

  /* ==========================================================================
     17. UI State Handling (Loading, Error)
     ========================================================================== */
  function setLoadingState(isLoading) {
    state.isLoading = isLoading;
    if (isLoading) {
      DOM.skeletonGrid.classList.remove('hidden');
      DOM.countriesGrid.classList.add('hidden');
      DOM.emptyState.classList.add('hidden');
      DOM.errorState.classList.add('hidden');
      DOM.paginationNav.classList.add('hidden');
    } else {
      DOM.skeletonGrid.classList.add('hidden');
    }
  }

  function setErrorState(hasError, message = '') {
    state.hasError = hasError;
    if (hasError) {
      DOM.skeletonGrid.classList.add('hidden');
      DOM.countriesGrid.classList.add('hidden');
      DOM.emptyState.classList.add('hidden');
      DOM.paginationNav.classList.add('hidden');
      DOM.errorState.classList.remove('hidden');
      if (message) DOM.errorMessage.textContent = message;
    } else {
      DOM.errorState.classList.add('hidden');
    }
  }

  /* ==========================================================================
     18. Event Listeners & Binding
     ========================================================================== */
  function setupEventListeners() {
    // Theme toggle
    DOM.themeToggleBtn.addEventListener('click', () => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      showToast(`Switched to ${nextTheme} theme.`, 'info', 2000);
    });

    // Mobile menu toggle
    DOM.mobileMenuBtn.addEventListener('click', () => {
      const isOpen = DOM.mobileDrawer.classList.toggle('open');
      DOM.mobileMenuBtn.setAttribute('aria-expanded', isOpen);
    });

    // Mobile Navigation buttons
    DOM.mobileFavBtn.addEventListener('click', () => {
      DOM.mobileDrawer.classList.remove('open');
      state.favouritesOnly = !state.favouritesOnly;
      DOM.filterFavOnlyBtn.classList.toggle('active', state.favouritesOnly);
      applyFiltersAndSort();
    });

    DOM.mobileCompareBtn.addEventListener('click', () => {
      DOM.mobileDrawer.classList.remove('open');
      openCompareModal();
    });

    DOM.mobileRandomBtn.addEventListener('click', () => {
      DOM.mobileDrawer.classList.remove('open');
      discoverRandomCountry();
    });

    // Header Nav Action Buttons
    DOM.navFavouritesBtn.addEventListener('click', () => {
      state.favouritesOnly = !state.favouritesOnly;
      DOM.filterFavOnlyBtn.classList.toggle('active', state.favouritesOnly);
      DOM.filterFavOnlyBtn.setAttribute('aria-pressed', state.favouritesOnly);
      applyFiltersAndSort();
      if (state.favouritesOnly) {
        showToast('Viewing favourite countries.', 'info');
      }
    });

    DOM.navCompareBtn.addEventListener('click', () => openCompareModal());
    DOM.navRandomBtn.addEventListener('click', () => discoverRandomCountry());

    // Search Input & Autocomplete
    DOM.searchInput.addEventListener('input', handleSearchInput);

    DOM.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        DOM.autocompleteDropdown.classList.add('hidden');
        if (state.searchQuery.trim()) {
          saveSearchHistory(state.searchQuery);
          applyFiltersAndSort();
        }
      } else if (e.key === 'Escape') {
        DOM.autocompleteDropdown.classList.add('hidden');
      }
    });

    DOM.clearSearchBtn.addEventListener('click', () => {
      DOM.searchInput.value = '';
      state.searchQuery = '';
      DOM.clearSearchBtn.classList.add('hidden');
      DOM.autocompleteDropdown.classList.add('hidden');
      applyFiltersAndSort();
      DOM.searchInput.focus();
    });

    // Autocomplete click delegation
    DOM.autocompleteDropdown.addEventListener('click', (e) => {
      const item = e.target.closest('.suggestion-item');
      if (item && item.dataset.cca3) {
        selectSuggestion(item.dataset.cca3);
      }
    });

    // Document click to close autocomplete
    document.addEventListener('click', (e) => {
      if (!DOM.autocompleteDropdown.contains(e.target) && e.target !== DOM.searchInput) {
        DOM.autocompleteDropdown.classList.add('hidden');
      }
    });

    // Quick Search Chips
    DOM.quickChipsList.addEventListener('click', (e) => {
      const chip = e.target.closest('.quick-chip');
      if (chip && chip.dataset.query) {
        DOM.searchInput.value = chip.dataset.query;
        state.searchQuery = chip.dataset.query;
        DOM.clearSearchBtn.classList.remove('hidden');
        saveSearchHistory(chip.dataset.query);
        applyFiltersAndSort();
      }
    });

    // Recent Search Chips & Clear
    DOM.recentSearchChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.recent-chip');
      if (chip && chip.dataset.query) {
        DOM.searchInput.value = chip.dataset.query;
        state.searchQuery = chip.dataset.query;
        DOM.clearSearchBtn.classList.remove('hidden');
        applyFiltersAndSort();
      }
    });

    DOM.clearHistoryBtn.addEventListener('click', () => {
      state.searchHistory = [];
      try {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.HISTORY);
      } catch (e) {}
      renderSearchHistory();
      showToast('Search history cleared.', 'info');
    });

    // Region Pills Filtering
    DOM.regionPills.forEach(pill => {
      pill.addEventListener('click', () => {
        DOM.regionPills.forEach(p => {
          p.classList.remove('active');
          p.setAttribute('aria-selected', 'false');
        });
        pill.classList.add('active');
        pill.setAttribute('aria-selected', 'true');

        state.activeRegion = pill.dataset.region;
        updateSubregionsForRegion(state.activeRegion);
        applyFiltersAndSort();
      });
    });

    // Subregion filter dropdown
    DOM.subregionSelect.addEventListener('change', (e) => {
      state.activeSubregion = e.target.value;
      applyFiltersAndSort();
    });

    // Sort select
    DOM.sortSelect.addEventListener('change', (e) => {
      state.activeSort = e.target.value;
      applyFiltersAndSort();
    });

    // Page size select
    DOM.pageSizeSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      state.pageSize = val === 'all' ? 'all' : parseInt(val, 10);
      try {
        localStorage.setItem(CONFIG.STORAGE_KEYS.PAGE_SIZE, val);
      } catch (err) {}
      state.currentPage = 1;
      renderCountriesGrid();
    });

    // Favourites Only Button
    DOM.filterFavOnlyBtn.addEventListener('click', () => {
      state.favouritesOnly = !state.favouritesOnly;
      DOM.filterFavOnlyBtn.classList.toggle('active', state.favouritesOnly);
      DOM.filterFavOnlyBtn.setAttribute('aria-pressed', state.favouritesOnly);
      applyFiltersAndSort();
    });

    // Reset Filters Buttons
    DOM.resetFiltersBtn.addEventListener('click', resetAllFilters);
    DOM.emptyResetBtn.addEventListener('click', resetAllFilters);

    // Active filter tags removal delegation
    DOM.activeFilterTags.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const type = btn.dataset.tagType;

      if (type === 'search') {
        DOM.searchInput.value = '';
        state.searchQuery = '';
        DOM.clearSearchBtn.classList.add('hidden');
      } else if (type === 'region') {
        state.activeRegion = 'all';
        DOM.regionPills.forEach(p => p.classList.toggle('active', p.dataset.region === 'all'));
        updateSubregionsForRegion('all');
      } else if (type === 'subregion') {
        state.activeSubregion = 'all';
        DOM.subregionSelect.value = 'all';
      } else if (type === 'fav') {
        state.favouritesOnly = false;
        DOM.filterFavOnlyBtn.classList.remove('active');
        DOM.filterFavOnlyBtn.setAttribute('aria-pressed', 'false');
      }

      applyFiltersAndSort();
    });

    // View mode switchers (Grid / Compact)
    DOM.viewGridBtn.addEventListener('click', () => setViewMode('grid'));
    DOM.viewCompactBtn.addEventListener('click', () => setViewMode('compact'));

    // Card click delegation (View details, Favourite, Compare)
    DOM.countriesGrid.addEventListener('click', (e) => {
      const favBtn = e.target.closest('.fav-btn');
      if (favBtn) {
        e.stopPropagation();
        toggleFavourite(favBtn.dataset.cca3);
        return;
      }

      const compareBtn = e.target.closest('.compare-btn, .btn-card-compare');
      if (compareBtn) {
        e.stopPropagation();
        toggleCompareCountry(compareBtn.dataset.cca3);
        return;
      }

      const card = e.target.closest('.country-card');
      if (card && card.dataset.cca3) {
        const country = state.countryCodeMap.get(card.dataset.cca3);
        if (country) openCountryDetailModal(country);
      }
    });

    // Pagination events
    DOM.prevPageBtn.addEventListener('click', () => goToPage(state.currentPage - 1));
    DOM.nextPageBtn.addEventListener('click', () => goToPage(state.currentPage + 1));
    
    DOM.paginationPages.addEventListener('click', (e) => {
      const numBtn = e.target.closest('.page-num-btn');
      if (numBtn && numBtn.dataset.page) {
        goToPage(parseInt(numBtn.dataset.page, 10));
      }
    });

    // Detail Modal Events
    DOM.closeModalBtn.addEventListener('click', closeDetailModal);
    DOM.detailModalBackdrop.addEventListener('click', closeDetailModal);

    DOM.modalFavBtn.addEventListener('click', () => {
      if (state.currentModalCountry) {
        toggleFavourite(state.currentModalCountry.cca3);
      }
    });

    DOM.modalCompareActionBtn.addEventListener('click', () => {
      if (state.currentModalCountry) {
        toggleCompareCountry(state.currentModalCountry.cca3);
        updateModalActionButtons(state.currentModalCountry);
      }
    });

    // Compare Modal Events
    DOM.closeCompareBtn.addEventListener('click', closeCompareModal);
    DOM.compareModalBackdrop.addEventListener('click', closeCompareModal);
    DOM.swapCompareBtn.addEventListener('click', swapComparisonCountries);

    DOM.compareSelect1.addEventListener('change', (e) => {
      state.compareCodes[0] = e.target.value || null;
      updateCompareBadges();
      renderComparisonTable();
    });

    DOM.compareSelect2.addEventListener('change', (e) => {
      state.compareCodes[1] = e.target.value || null;
      updateCompareBadges();
      renderComparisonTable();
    });

    // Retry fetch button
    DOM.retryFetchBtn.addEventListener('click', fetchCountryData);

    // Back to top button & Scroll listener
    window.addEventListener('scroll', () => {
      if (window.scrollY > 350) {
        DOM.backToTopBtn.classList.remove('hidden');
      } else {
        DOM.backToTopBtn.classList.add('hidden');
      }
    }, { passive: true });

    DOM.backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Global Keyboard Shortcuts (Escape to close modals)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!DOM.detailModal.classList.contains('hidden')) {
          closeDetailModal();
        } else if (!DOM.compareModal.classList.contains('hidden')) {
          closeCompareModal();
        }
      }
    });
  }

  /* ==========================================================================
     19. Utility Functions
     ========================================================================== */
  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ==========================================================================
     20. App Initialization
     ========================================================================== */
  function init() {
    loadPersistedState();
    setupEventListeners();
    fetchCountryData();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
