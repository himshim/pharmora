/*
  Pharmora Universal Search Facets
  v3.0.0
*/
(function() {
  function computeFacets(results) {
    const facets = {
      types: {},
      tags: {},
      statuses: {}
    };

    results.forEach(item => {
      // Type facets
      if (item.type) {
        facets.types[item.type] = (facets.types[item.type] || 0) + 1;
      }

      // Status facets
      if (item.status) {
        facets.statuses[item.status] = (facets.statuses[item.status] || 0) + 1;
      }

      // Tag facets
      if (Array.isArray(item.tags)) {
        item.tags.forEach(tag => {
          facets.tags[tag] = (facets.tags[tag] || 0) + 1;
        });
      }
    });

    return facets;
  }

  window.PharmoraSearchFacets = {
    computeFacets
  };
})();
