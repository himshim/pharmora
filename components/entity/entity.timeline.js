/*
  Pharmora Entity Timeline Component
  v2.0.0
*/
(function() {
  function renderTimeline(entity) {
    if (!entity || !Array.isArray(entity.auditTrail) || entity.auditTrail.length === 0) {
      return `<p style="font-size:0.9rem; color:var(--text-muted); margin:0;">No history recorded.</p>`;
    }

    const itemsHtml = entity.auditTrail.map(log => {
      const date = new Date(log.timestamp).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      let changesHtml = "";
      if (log.changes) {
        try {
          // Safe serialization to prevent circular structure errors
          const cleanChanges = {};
          for (const [k, v] of Object.entries(log.changes)) {
            if (["auditTrail", "relations"].includes(k)) continue; // ignore heavy/circular fields
            cleanChanges[k] = v;
          }
          if (Object.keys(cleanChanges).length > 0) {
            changesHtml = `<pre style="font-size:0.75rem; background:var(--bg-body); padding:4px 8px; border-radius:4px; margin:4px 0 0 0; overflow-x:auto;">${JSON.stringify(cleanChanges, null, 2)}</pre>`;
          }
        } catch (e) {
          changesHtml = `<pre style="font-size:0.75rem; background:var(--bg-body); padding:4px 8px; border-radius:4px; margin:4px 0 0 0; overflow-x:auto;">[Complex Changes]</pre>`;
        }
      }

      return `
        <div style="position:relative; padding-left:24px; margin-bottom:16px; border-left: 2px solid var(--border);">
          <div style="position:absolute; left:-7px; top:4px; width:12px; height:12px; border-radius:50%; background:var(--primary); border:2px solid var(--surface);"></div>
          <div style="font-size:0.85rem; color:var(--text-muted);">${date}</div>
          <div style="font-size:0.9rem; color:var(--text); font-weight:500;">
            <span style="text-transform:capitalize;">${log.action}</span> by <strong>${log.actor}</strong>
          </div>
          ${changesHtml}
        </div>
      `;
    }).join("");

    return `
      <div class="entity-timeline" style="display:flex; flex-direction:column; gap:12px;">
        <h3 style="font-size:1.1rem; margin:0 0 8px 0; color:var(--text);">Audit History & Timeline</h3>
        <div style="padding-left:8px;">
          ${itemsHtml}
        </div>
      </div>
    `;
  }

  window.PharmoraEntityTimeline = {
    render: renderTimeline
  };
})();
