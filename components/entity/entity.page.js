/*
  Pharmora Universal Page Component
  v2.0.0
*/
(function() {
  function renderPage(entity, config) {
    const resolve = PharmoraUniversalRenderer.resolveField;
    const title = resolve(entity, config.titleField) || "Untitled Entity";
    const subtitle = resolve(entity, config.subtitleField) || "";
    const badge = resolve(entity, config.badgeField) || "";
    const description = resolve(entity, config.descriptionField) || "";
    const tags = entity.tags || [];
    const relations = entity.relations || [];

    // Custom extra subtitle logic
    let extraSub = "";
    if (typeof config.extraSubtitle === "function") {
      extraSub = config.extraSubtitle(entity);
    }

    // Dynamic metadata fields rendering
    let metaHtml = "";
    if (Array.isArray(config.metadataFields)) {
      metaHtml = config.metadataFields.map(m => {
        const val = resolve(entity, m.value);
        return `<p style="margin:4px 0; font-size:0.95rem;"><strong>${m.label}:</strong> ${val}</p>`;
      }).join("");
    }

    // Render sections dynamically if specified in config (e.g. objectives, outcomes)
    let sectionsHtml = "";
    if (Array.isArray(config.sections)) {
      sectionsHtml = config.sections.map(sec => {
        const items = resolve(entity, sec.value) || [];
        if (!Array.isArray(items) || items.length === 0) return "";
        const listItems = items.map(item => `<li>${item}</li>`).join("");
        return `
          <section style="margin-bottom: 32px;">
            <h2 style="font-size: 1.4rem; color: var(--text); margin: 0 0 12px 0;">${sec.label}</h2>
            <ul style="color: var(--text-secondary); line-height: 1.6; padding-left: 20px; margin: 0;">
              ${listItems}
            </ul>
          </section>
        `;
      }).join("");
    }

    // Group relations
    const relationsGroup = {};
    relations.forEach(rel => {
      const type = rel.targetType;
      if (!relationsGroup[type]) {
        relationsGroup[type] = [];
      }
      relationsGroup[type].push(rel);
    });

    let relationsHtml = "";
    if (relations.length > 0) {
      relationsHtml = Object.entries(relationsGroup).map(([type, list]) => `
        <div style="margin-bottom: 16px;">
          <h4 style="text-transform: capitalize; margin: 0 0 8px 0; color: var(--text); border-bottom: 1px solid var(--border); padding-bottom: 4px;">${type}s</h4>
          <ul style="margin: 0; padding-left: 20px; font-size: 0.9rem; color: var(--text-secondary);">
            ${list.map(item => `
              <li style="margin-bottom: 4px;">
                <a href="#${item.targetType}/${item.targetUuid}" style="color: var(--primary); text-decoration: none;">
                  ${item.metadata?.name || item.metadata?.title || `${item.targetType} (ID: ${item.targetUuid.substring(0,8)})`}
                </a>
                <span style="font-size:0.75rem; color:var(--text-muted); margin-left: 8px;">(${item.relationType})</span>
              </li>
            `).join("")}
          </ul>
        </div>
      `).join("");
    } else {
      relationsHtml = `<p style="font-size: 0.9rem; color: var(--text-secondary); margin: 0;">No linked resources yet.</p>`;
    }

    return `
      <div class="container universal-detail-page" style="max-width: 1000px; margin: 0 auto; padding: 24px;">
        <div style="margin-bottom: 24px;">
          <a href="#${entity.type.toLowerCase()}s" style="color: var(--primary); text-decoration: none; font-size: 0.9rem;">&larr; Back to List</a>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; border-bottom: 1px solid var(--border); padding-bottom: 20px; margin-bottom: 24px;">
          <div>
            ${badge ? `<span style="font-family: monospace; font-size: 0.9rem; background: var(--border); padding: 4px 8px; border-radius: 4px; font-weight: bold; color: var(--text-secondary);">${badge}</span>` : ''}
            <h1 style="margin: 8px 0 4px 0; font-size: 2.2rem; color: var(--text);">${title}</h1>
            <p style="margin: 0; color: var(--primary); font-size: 1.1rem; font-weight: 500;">
              ${subtitle} ${extraSub ? `&bull; ${extraSub}` : ''}
            </p>
          </div>
          <div style="display: flex; gap: 8px;">
            ${tags.map(tag => `<span style="background:var(--primary-light); color:var(--primary); font-size:0.8rem; padding:4px 10px; border-radius:4px;">#${tag}</span>`).join("")}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 32px;">
          <div>
            ${description ? `
              <section style="margin-bottom: 32px;">
                <h2 style="font-size: 1.4rem; color: var(--text); margin: 0 0 12px 0;">Description</h2>
                <p style="color: var(--text-secondary); font-size: 1rem; line-height: 1.6; margin: 0;">
                  ${description}
                </p>
              </section>
            ` : ''}

            ${sectionsHtml}
          </div>

          <div style="display: flex; flex-direction: column; gap: 20px;">
            <div style="background: var(--bg-body); border: 1px solid var(--border); border-radius: 8px; padding: 20px;">
              <h3 style="font-size: 1.1rem; color: var(--text); margin: 0 0 12px 0;">Information</h3>
              ${metaHtml || `<p style="margin:0; font-size:0.9rem; color:var(--text-muted);">No additional info.</p>`}
              <hr style="border:0; border-top:1px solid var(--border); margin:12px 0;">
              <p style="margin:4px 0; font-size:0.85rem; color:var(--text-muted);"><strong>Status:</strong> ${entity.status}</p>
              <p style="margin:4px 0; font-size:0.85rem; color:var(--text-muted);"><strong>Version:</strong> ${entity.version}</p>
            </div>

            <div style="background: var(--bg-body); border: 1px solid var(--border); border-radius: 8px; padding: 20px;">
              <h3 style="font-size: 1.1rem; color: var(--text); margin: 0 0 12px 0;">Connected Resources</h3>
              ${relationsHtml}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  window.PharmoraUniversalPage = {
    render: renderPage
  };
})();
