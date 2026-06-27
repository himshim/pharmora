/*
  Pharmora Universal List Component
  v2.0.0
*/
(function() {
  function renderList(entities = [], config) {
    if (!Array.isArray(entities) || entities.length === 0) {
      return `<div style="padding:20px; color:var(--text-muted); font-size:0.95rem;">No items found.</div>`;
    }

    const cardsHtml = entities.map(entity => {
      if (typeof PharmoraUniversalCard !== "undefined") {
        return PharmoraUniversalCard.render(entity, config);
      }
      return `<div>${entity.uuid}</div>`;
    }).join("");

    return `
      <div class="universal-entity-list" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:20px; padding:20px;">
        ${cardsHtml}
      </div>
    `;
  }

  window.PharmoraUniversalList = {
    render: renderList
  };
})();
