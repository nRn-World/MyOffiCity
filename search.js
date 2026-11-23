// search.js
// Avancerad sökfunktion för MyOffiCity

// Sökfilter
const searchFilters = {
  type: ['company', 'project', 'person'],
  status: ['active', 'inactive', 'pending'],
  location: ['local', 'remote', 'hybrid'],
  date: ['today', 'week', 'month', 'year']
};

// Sökfunktion
function search(query, filters = {}) {
  // Kombinera sökfråga och filter
  const combinedQuery = `${query} ${Object.entries(filters).map(([key, value]) => `${key}:${value}`).join(' ')}`;

  // Simulera sökning (ersätt med riktig API-anrop)
  const results = simulateSearch(combinedQuery);

  // Sortera resultat baserat på relevans
  const sortedResults = sortResults(results);

  return sortedResults;
}

// Simulera sökning
function simulateSearch(query) {
  // Här skulle du normalt göra ett API-anrop
  console.log(`Söker efter: ${query}`);

  // Exempelresultat
  return [
    { id: 1, name: 'AI Innovations', type: 'company', relevance: 0.95 },
    { id: 2, name: 'Web Development Project', type: 'project', relevance: 0.88 },
    { id: 3, name: 'Jane Doe', type: 'person', relevance: 0.85 }
  ];
}

// Sortera resultat
function sortResults(results) {
  return results.sort((a, b) => b.relevance - a.relevance);
}

// Exportera funktioner
export { search, searchFilters };
