// aiSearch.js - Advanced AI Search Functionality

class AdvancedAISearch {
  constructor() {
    this.filters = {
      dateRange: { start: null, end: null },
      companyType: [],
      projectStatus: [],
      teamSize: { min: null, max: null },
      keywords: []
    };
    this.searchResults = [];
    this.currentPage = 1;
    this.resultsPerPage = 10;
  }

  // Initialize the search interface
  init() {
    this.renderFilterUI();
    this.setupEventListeners();
  }

  // Render the filter UI components
  renderFilterUI() {
    const filterContainer = document.createElement('div');
    filterContainer.className = 'ai-search-filters';
    filterContainer.innerHTML = `
      <div class="filter-section">
        <h3>Date Range</h3>
        <input type="date" id="start-date" placeholder="Start date">
        <input type="date" id="end-date" placeholder="End date">
      </div>
      <div class="filter-section">
        <h3>Company Type</h3>
        <div class="checkbox-group">
          <label><input type="checkbox" value="startup"> Startup</label>
          <label><input type="checkbox" value="tech-hub"> Tech Hub</label>
          <label><input type="checkbox" value="executive-hq"> Executive HQ</label>
        </div>
      </div>
      <div class="filter-section">
        <h3>Project Status</h3>
        <div class="checkbox-group">
          <label><input type="checkbox" value="active"> Active</label>
          <label><input type="checkbox" value="completed"> Completed</label>
          <label><input type="checkbox" value="on-hold"> On Hold</label>
        </div>
      </div>
      <div class="filter-section">
        <h3>Team Size</h3>
        <input type="number" id="min-team" placeholder="Min size">
        <input type="number" id="max-team" placeholder="Max size">
      </div>
      <div class="filter-section">
        <h3>Keywords</h3>
        <input type="text" id="keywords" placeholder="Enter keywords">
        <button id="add-keyword">Add</button>
        <div id="keyword-tags"></div>
      </div>
      <button id="apply-filters">Apply Filters</button>
      <button id="reset-filters">Reset Filters</button>
    `;

    document.getElementById('search-container').appendChild(filterContainer);
    this.renderResultsContainer();
  }

  // Set up event listeners for filter interactions
  setupEventListeners() {
    document.getElementById('apply-filters').addEventListener('click', () => this.applyFilters());
    document.getElementById('reset-filters').addEventListener('click', () => this.resetFilters());
    document.getElementById('add-keyword').addEventListener('click', () => this.addKeyword());
    document.getElementById('keywords').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addKeyword();
    });
  }

  // Add a keyword to the filter
  addKeyword() {
    const keywordInput = document.getElementById('keywords');
    const keyword = keywordInput.value.trim();
    if (keyword && !this.filters.keywords.includes(keyword)) {
      this.filters.keywords.push(keyword);
      this.renderKeywordTags();
      keywordInput.value = '';
    }
  }

  // Render the keyword tags
  renderKeywordTags() {
    const tagsContainer = document.getElementById('keyword-tags');
    tagsContainer.innerHTML = '';
    this.filters.keywords.forEach((keyword, index) => {
      const tag = document.createElement('span');
      tag.className = 'keyword-tag';
      tag.textContent = keyword;
      const removeBtn = document.createElement('button');
      removeBtn.textContent = '×';
      removeBtn.addEventListener('click', () => this.removeKeyword(index));
      tag.appendChild(removeBtn);
      tagsContainer.appendChild(tag);
    });
  }

  // Remove a keyword from the filter
  removeKeyword(index) {
    this.filters.keywords.splice(index, 1);
    this.renderKeywordTags();
  }

  // Apply the selected filters
  applyFilters() {
    // Update filter values from UI
    this.filters.dateRange.start = document.getElementById('start-date').value;
    this.filters.dateRange.end = document.getElementById('end-date').value;

    this.filters.companyType = Array.from(
      document.querySelectorAll('.filter-section:nth-child(2) input[type="checkbox"]:checked')
    ).map(checkbox => checkbox.value);

    this.filters.projectStatus = Array.from(
      document.querySelectorAll('.filter-section:nth-child(3) input[type="checkbox"]:checked')
    ).map(checkbox => checkbox.value);

    this.filters.teamSize.min = document.getElementById('min-team').value;
    this.filters.teamSize.max = document.getElementById('max-team').value;

    // Perform the search with applied filters
    this.performSearch();
  }

  // Reset all filters to default values
  resetFilters() {
    this.filters = {
      dateRange: { start: null, end: null },
      companyType: [],
      projectStatus: [],
      teamSize: { min: null, max: null },
      keywords: []
    };

    // Reset UI elements
    document.getElementById('start-date').value = '';
    document.getElementById('end-date').value = '';
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = false;
    });
    document.getElementById('min-team').value = '';
    document.getElementById('max-team').value = '';
    document.getElementById('keywords').value = '';
    document.getElementById('keyword-tags').innerHTML = '';

    // Perform a search with no filters
    this.performSearch();
  }

  // Perform the search with current filters
  async performSearch() {
    try {
      // Show loading indicator
      this.showLoading(true);

      // Prepare search parameters
      const params = new URLSearchParams();
      if (this.filters.dateRange.start) params.append('start_date', this.filters.dateRange.start);
      if (this.filters.dateRange.end) params.append('end_date', this.filters.dateRange.end);
      if (this.filters.companyType.length) params.append('company_type', this.filters.companyType.join(','));
      if (this.filters.projectStatus.length) params.append('project_status', this.filters.projectStatus.join(','));
      if (this.filters.teamSize.min) params.append('min_team', this.filters.teamSize.min);
      if (this.filters.teamSize.max) params.append('max_team', this.filters.teamSize.max);
      if (this.filters.keywords.length) params.append('keywords', this.filters.keywords.join(','));

      // Make API request
      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();

      // Process and display results
      this.searchResults = data.results;
      this.renderResults();
    } catch (error) {
      console.error('Search error:', error);
      this.showError('Failed to perform search. Please try again.');
    } finally {
      this.showLoading(false);
    }
  }

  // Render the search results
  renderResults() {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';

    if (this.searchResults.length === 0) {
      resultsContainer.innerHTML = '<p>No results found. Try adjusting your filters.</p>';
      return;
    }

    // Calculate pagination
    const startIndex = (this.currentPage - 1) * this.resultsPerPage;
    const endIndex = Math.min(startIndex + this.resultsPerPage, this.searchResults.length);
    const paginatedResults = this.searchResults.slice(startIndex, endIndex);

    // Render each result
    paginatedResults.forEach(result => {
      const resultElement = document.createElement('div');
      resultElement.className = 'search-result';
      resultElement.innerHTML = `
        <h3>${result.title}</h3>
        <p>${result.description}</p>
        <div class="
