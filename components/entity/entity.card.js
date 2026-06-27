/*
  Pharmora Universal Card Component
  v2.0.0
*/
(function() {
  function renderCard(entity, config) {
    const resolve = PharmoraUniversalRenderer.resolveField;
    const title = resolve(entity, config.titleField) || "Untitled Entity";
    const subtitle = resolve(entity, config.subtitleField) || "";
    const badge = resolve(entity, config.badgeField) || "";
    const description = resolve(entity, config.descriptionField) || "";
    const tags = entity.tags || [];
    
    // Custom extra subtitle logic if passed in config
    let extraSub = "";
    if (typeof config.extraSubtitle === "function") {
      extraSub = config.extraSubtitle(entity);
    }

    const tagsHtml = tags.map(tag => `
      <span class="tag-badge" style="background:var(--primary-light); color:var(--primary); font-size:0.75rem; padding:2px 8px; border-radius:4px; margin-right:4px;">
        #${tag}
      </span>
    `).join("");

    return `
      <div class="universal-card card" data-uuid="${entity.uuid}" style="border:1px solid var(--border); border-radius:8px; padding:16px; background:var(--surface); box-shadow:0 2px 4px rgba(0,0,0,0.05); display:flex; flex-direction:column; gap:12px; transition: transform 0.2s; cursor:pointer;" onclick="location.hash='#${entity.type.toLowerCase()}/${entity.uuid}'">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          ${badge ? `<span style="font-family:monospace; background:var(--border); font-weight:bold; font-size:0.8rem; padding:2px 6px; border-radius:4px; color:var(--text-secondary);">${badge}</span>` : ''}
          <span style="font-size:0.8rem; color:var(--text-muted); text-transform:capitalize;">${entity.type}</span>
        </div>
        <div>
          <h3 style="margin:0; font-size:1.15rem; color:var(--text);">${title}</h3>
          ${subtitle || extraSub ? `<p style="margin:4px 0 0 0; font-size:0.85rem; color:var(--primary);">${subtitle} ${extraSub ? `• ${extraSub}` : ''}</p>` : ''}
        </div>
        ${description ? `<p style="font-size:0.9rem; color:var(--text-secondary); line-height:1.4; margin:0; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">${description}</p>` : ''}
        ${tagsHtml ? `<div style="margin-top:auto; display:flex; flex-wrap:wrap; gap:4px;">${tagsHtml}</div>` : ''}
      </div>
    `;
  }

  window.PharmoraUniversalCard = {
    render: renderCard
  };
})();
