/*
  Pharmora Universal Search Filters
  v3.0.0
*/
(function() {
  function applyFilters(results, filterOpts = {}) {
    return results.filter(item => {
      // 1. Permission checks
      if (filterOpts.user) {
        const user = filterOpts.user;
        const roles = item.permissions?.roles || {};
        const users = item.permissions?.users || {};
        
        // If unlisted/restricted and user is not admin/owner, check specific permissions
        if (item.visibility === "restricted" && user.role !== "admin" && user.role !== "owner") {
          const allowedRole = roles[user.role];
          const allowedUser = users[user.id];
          if (!allowedRole && !allowedUser && item.owner !== user.id) {
            return false;
          }
        }
      }

      // 2. Type filtering
      if (filterOpts.type && item.type !== filterOpts.type) return false;

      // 3. Status filtering
      if (filterOpts.status && item.status !== filterOpts.status) return false;

      // 4. Visibility filtering
      if (filterOpts.visibility && item.visibility !== filterOpts.visibility) return false;

      // 5. Tags matching
      if (filterOpts.tags && filterOpts.tags.length > 0) {
        const hasTags = filterOpts.tags.every(t => item.tags.includes(t));
        if (!hasTags) return false;
      }

      // 6. Owner matching
      if (filterOpts.owner && item.owner !== filterOpts.owner) return false;

      return true;
    });
  }

  function sortResults(results, sortBy = "relevance") {
    return results.sort((a, b) => {
      if (sortBy === "relevance") {
        return (b.score || 0) - (a.score || 0);
      } else if (sortBy === "popularity") {
        return b.popularity - a.popularity;
      } else if (sortBy === "recent") {
        return b.recentActivity - a.recentActivity;
      } else if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }

  window.PharmoraSearchFilters = {
    applyFilters,
    sortResults
  };
})();
