/*
  Pharmora Universal Search Orchestrator
  v3.0.0
*/
(function() {
  let isIndexReady = false;

  async function initSearch() {
    if (typeof PharmoraSearchIndex !== "undefined") {
      await PharmoraSearchIndex.buildIndex();
      isIndexReady = true;
    }
  }

  function getCategory(type) {
    const academic = ["University", "Program", "Course", "Semester", "Subject", "Unit", "Topic"];
    const pharmaceutical = ["Drug", "Brand", "Manufacturer", "Disease", "Mechanism", "TherapeuticClass", "PharmacologicalClass", "DosageForm", "Excipient", "AdverseEffect", "Interaction", "Contraindication"];
    const learning = ["Resource", "Practical", "QuestionBank", "MCQ", "Book", "Research"];
    
    if (academic.includes(type)) return "Academic";
    if (pharmaceutical.includes(type)) return "Pharmaceutical";
    if (learning.includes(type)) return "Learning Resources";
    
    if (type === "admin" || type === "configuration") return "Administration";
    return "Community";
  }

  function highlightMatch(text, query) {
    if (!text || !query) return text || "";
    const cleanQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${cleanQuery})`, 'gi');
    return text.toString().replace(regex, '<mark class="search-highlight" style="background:var(--primary-light); color:var(--primary); font-weight:bold;">$1</mark>');
  }

  async function executeSearch(query, options = {}) {
    if (!isIndexReady) {
      await initSearch();
    }

    const index = PharmoraSearchIndex.getIndex();
    
    // Save query to history
    if (query && query.trim()) {
      PharmoraSearchHistory.addHistory(query);
    }

    // 1. Compute relevance scores
    const userRole = options.user?.role || "guest";
    const scored = index.map(item => {
      const score = query ? PharmoraSearchRanking.computeRelevanceScore(item, query, userRole) : 0;
      return { ...item, score };
    });

    // 2. Filter matches
    let filtered = scored;
    if (query) {
      filtered = scored.filter(item => item.score > 0);
    }

    // Apply additional facet filters
    filtered = PharmoraSearchFilters.applyFilters(filtered, options);

    // 3. Sort results
    const sorted = PharmoraSearchFilters.sortResults(filtered, options.sortBy || "relevance");

    // 4. Group results by category
    const grouped = {
      "Academic": [],
      "Pharmaceutical": [],
      "Learning Resources": [],
      "Community": [],
      "Administration": []
    };

    sorted.forEach(item => {
      const cat = getCategory(item.type);
      if (cat === "Administration") {
        // Permission check: only admin/owner can see administration results
        if (userRole !== "admin" && userRole !== "owner") {
          return;
        }
      }
      if (grouped[cat]) {
        grouped[cat].push(item);
      } else {
        grouped["Community"].push(item);
      }
    });

    // 5. Empty State recommendations using UES Discovery Engine
    let recommendations = [];
    if (query === "" && typeof PharmoraDiscoveryEngine !== "undefined") {
      recommendations = await PharmoraDiscoveryEngine.getPopularEntities(5);
    }

    // Compute dynamic facets for the active result set
    const facets = PharmoraSearchFacets.computeFacets(sorted);

    return {
      query,
      resultsCount: sorted.length,
      groupedResults: grouped,
      facets,
      recommendations
    };
  }

  window.PharmoraUniversalSearch = {
    initSearch,
    executeSearch,
    highlightMatch
  };
})();
