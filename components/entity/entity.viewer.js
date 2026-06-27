/*
  Pharmora Universal Entity Viewer Coordinator
  v2.0.0
*/
(function() {
  async function renderViewer(containerId, entityUuid) {
    const root = document.getElementById(containerId);
    if (!root) return;

    if (typeof PharmoraEntityAPI === "undefined") {
      root.innerHTML = `<div style="padding:20px; color:red;">PharmoraEntityAPI not available</div>`;
      return;
    }

    root.innerHTML = `<div style="padding:20px; color:var(--text-muted);">Loading entity...</div>`;

    try {
      const entity = await PharmoraEntityAPI.getEntity(entityUuid);
      if (!entity) {
        root.innerHTML = `<div style="padding:20px; color:var(--text-muted);"><h3>Entity not found</h3><p>UUID: ${entityUuid}</p></div>`;
        return;
      }

      // Build breadcrumbs dynamically from routes/registry
      const breadcrumbsHtml = `
        <nav class="breadcrumbs" style="font-size:0.85rem; color:var(--text-muted); margin-bottom:16px;">
          <a href="#dashboard" style="color:var(--primary); text-decoration:none;">Dashboard</a>
          <span style="margin:0 6px;">/</span>
          <a href="#${entity.type.toLowerCase()}s" style="color:var(--primary); text-decoration:none; text-transform:capitalize;">${entity.type}s</a>
          <span style="margin:0 6px;">/</span>
          <span style="color:var(--text);">${entity.content?.title || entity.content?.name || entity.publicId}</span>
        </nav>
      `;

      // Render main content using Universal Renderer
      let contentHtml = "";
      if (typeof PharmoraUniversalRenderer !== "undefined") {
        // Resolve registered type config or fall back to auto
        const config = PharmoraUniversalRenderer.getTypeConfig(entity.type);
        contentHtml = PharmoraUniversalRenderer.render(entity, "page", config);
      } else {
        contentHtml = `
          <div style="background:var(--surface); border:1px solid var(--border); padding:20px; border-radius:8px;">
            <h2>${entity.content?.title || entity.content?.name || "Untitled Entity"}</h2>
            <pre>${JSON.stringify(entity.content, null, 2)}</pre>
          </div>
        `;
      }

      // Render side details
      const relationsHtml = typeof PharmoraEntityRelationsComponent !== "undefined"
        ? await PharmoraEntityRelationsComponent.render(entity)
        : "";

      const timelineHtml = typeof PharmoraEntityTimeline !== "undefined"
        ? PharmoraEntityTimeline.render(entity)
        : "";

      const referencesHtml = typeof PharmoraEntityReferences !== "undefined"
        ? PharmoraEntityReferences.render(entity)
        : "";

      const attachmentsHtml = typeof PharmoraEntityAttachments !== "undefined"
        ? PharmoraEntityAttachments.render(entity)
        : "";

      root.innerHTML = `
        <div class="entity-viewer" style="display:flex; flex-direction:column; gap:20px; font-family:sans-serif;">
          ${breadcrumbsHtml}
          
          <!-- Split Grid Layout -->
          <div style="display:grid; grid-template-columns: 2.5fr 1fr; gap:30px; align-items:start; flex-wrap:wrap;">
            
            <!-- Left Panel: Content -->
            <div style="display:flex; flex-direction:column; gap:24px;">
              <div id="viewer-main-content">
                ${contentHtml}
              </div>
              
              <hr style="border:0; border-top:1px solid var(--border); margin:0;">
              
              <div id="viewer-timeline-section" style="background:var(--surface); border:1px solid var(--border); border-radius:8px; padding:20px;">
                ${timelineHtml}
              </div>
            </div>

            <!-- Right Panel: Metadata & Resources -->
            <div style="display:flex; flex-direction:column; gap:20px; background:var(--bg-body); border:1px solid var(--border); border-radius:8px; padding:20px;">
              <div id="viewer-relations-section">
                ${relationsHtml}
              </div>
              <hr style="border:0; border-top:1px solid var(--border); margin:0;">
              <div id="viewer-attachments-section">
                ${attachmentsHtml}
              </div>
              <hr style="border:0; border-top:1px solid var(--border); margin:0;">
              <div id="viewer-references-section">
                ${referencesHtml}
              </div>
            </div>

          </div>
        </div>
      `;

    } catch (err) {
      console.error("[Viewer] Render failed:", err);
      root.innerHTML = `<div style="padding:20px; color:red;">Failed to render entity viewer.</div>`;
    }
  }

  window.PharmoraEntityViewer = {
    render: renderViewer
  };
})();
