/*
  Pharmora Universal Search History
  v3.0.0
*/
(function() {
  const HistoryKey = "pharmora_search_history";
  const ViewedKey = "pharmora_search_recently_viewed";
  const MaxItems = 10;

  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem(HistoryKey)) || [];
    } catch (e) {
      return [];
    }
  }

  function addHistory(query) {
    if (!query || !query.trim()) return;
    const clean = query.trim().toLowerCase();
    let list = getHistory();
    list = list.filter(item => item !== clean);
    list.unshift(clean);
    list = list.slice(0, MaxItems);
    localStorage.setItem(HistoryKey, JSON.stringify(list));
  }

  function clearHistory() {
    localStorage.removeItem(HistoryKey);
  }

  function getRecentlyViewed() {
    try {
      return JSON.parse(localStorage.getItem(ViewedKey)) || [];
    } catch (e) {
      return [];
    }
  }

  function addRecentlyViewed(entityUuid, title, type) {
    let list = getRecentlyViewed();
    list = list.filter(item => item.uuid !== entityUuid);
    list.unshift({ uuid: entityUuid, title, type, timestamp: Date.now() });
    list = list.slice(0, MaxItems);
    localStorage.setItem(ViewedKey, JSON.stringify(list));
  }

  function getPopularSearches() {
    // Dynamic fallback, or hardcoded fallbacks
    return [
      "pharmacology",
      "aspirin",
      "dolo 650",
      "b.pharm semester 1",
      "anatomy",
      "dpsru"
    ];
  }

  window.PharmoraSearchHistory = {
    getHistory,
    addHistory,
    clearHistory,
    getRecentlyViewed,
    addRecentlyViewed,
    getPopularSearches
  };
})();
