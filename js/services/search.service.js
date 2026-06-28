/*
  Pharmora Search UI Glue
  Integrated with Universal Search (UES v3)
*/

async function pharmoraSearch(query) {
  let box = document.getElementById("search-results");
  if (!box) return;

  if (!query || !query.trim()) {
    box.innerHTML = "";
    return;
  }

  if (typeof PharmoraUniversalSearch === "undefined") {
    return;
  }

  const searchRes = await PharmoraUniversalSearch.executeSearch(query);
  const categories = Object.keys(searchRes.groupedResults);

  let html = "";
  categories.forEach(cat => {
    const list = searchRes.groupedResults[cat];
    if (list.length === 0) return;

    html += `
      <div class="search-category-group" style="width: 100%; margin-bottom: 20px;">
        <h4 style="margin: 0 0 10px 0; color: var(--text-soft); font-size: 0.95rem; border-bottom: 1px solid var(--border); padding-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em;">${cat}</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
          ${list.map(item => `
            <a href="/pages/entity/index.html#entity/${item.uuid}" class="card glass search-result" style="text-decoration: none; color: inherit; display: block; padding: 15px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                <h3 style="margin: 0; font-size: 1.05rem; color: var(--text);">${PharmoraUniversalSearch.highlightMatch(item.title, query)}</h3>
                <span style="font-size: 0.75rem; text-transform: uppercase; background: var(--primary-light); color: var(--primary); padding: 2px 6px; border-radius: 4px; font-weight: bold;">${item.type}</span>
              </div>
              <p style="margin: 0; font-size: 0.85rem; color: var(--text-soft);">${PharmoraUniversalSearch.highlightMatch(item.description, query)}</p>
            </a>
          `).join("")}
        </div>
      </div>
    `;
  });

  box.innerHTML = html || `<p style="padding: 10px; color: var(--text-soft);">No matches found for "${query}"</p>`;
}

window.pharmoraSearch = pharmoraSearch;
