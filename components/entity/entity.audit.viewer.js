/*
  Pharmora Universal Entity Audit Viewer Component
  v3.0.0
*/
(function() {
  function renderAuditViewer(entity, containerId) {
    const root = document.getElementById(containerId);
    if (!root) return;

    const statusColors = {
      "draft": "#4b5563",
      "pending_review": "#d97706",
      "needs_changes": "#dc2626",
      "approved": "#2563eb",
      "published": "#16a34a",
      "archived": "#7c3aed"
    };

    const statusColor = statusColors[entity.status] || "#1f2937";
    const reviewer = entity.metadata?.reviewer || "Not Assigned";
    const reviewedAt = entity.metadata?.reviewedAt ? new Date(entity.metadata.reviewedAt).toLocaleDateString() : "N/A";
    const versions = entity.metadata?.versions || [];
    const versionCount = versions.length;

    // Build version dropdown selections for comparison
    const versionOptions = versions.map(v => `<option value="${v.version}">Version ${v.version} (${new Date(v.metadata?.timestamp).toLocaleDateString()})</option>`).join("");

    root.innerHTML = `
      <div class="entity-audit-viewer-panel" style="display:flex; flex-direction:column; gap:20px; padding:20px; font-family:sans-serif; background:var(--surface); border:1px solid var(--border); border-radius:8px;">
        <!-- Status & Reviewer Summary -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; border-bottom:1px solid var(--border); padding-bottom:12px;">
          <div>
            <h3 style="margin:0; font-size:1.15rem; color:var(--text);">Status & Workflow Panel</h3>
            <p style="margin:4px 0 0 0; font-size:0.85rem; color:var(--text-muted);">Current Entity Version: <strong>${entity.version}</strong> (Snapshots: ${versionCount})</p>
          </div>
          <span style="background:${statusColor}; color:white; font-size:0.85rem; padding:4px 10px; border-radius:4px; font-weight:bold; text-transform:uppercase;">
            ${entity.status}
          </span>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; font-size:0.9rem; color:var(--text-secondary);">
          <div><strong>Moderator/Reviewer:</strong> ${reviewer}</div>
          <div><strong>Reviewed Date:</strong> ${reviewedAt}</div>
        </div>

        <hr style="border:0; border-top:1px solid var(--border); margin:0;">

        <!-- Version Diff Tool -->
        <div>
          <h4 style="margin:0 0 10px 0; color:var(--text); font-size:1rem;">Version Comparison & Rollback</h4>
          ${versionCount < 2 ? `<p style="font-size:0.85rem; color:var(--text-muted); margin:0;">Need at least two version snapshots to compare.</p>` : `
            <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin-bottom:12px;">
              <select id="diff-v1" style="padding:6px; border-radius:4px; border:1px solid var(--border);">
                ${versionOptions}
              </select>
              <span>to</span>
              <select id="diff-v2" style="padding:6px; border-radius:4px; border:1px solid var(--border);">
                ${versionOptions}
              </select>
              <button id="btn-run-diff" style="padding:6px 12px; border:none; background:var(--primary); color:white; border-radius:4px; cursor:pointer;">Compare</button>
              <button id="btn-rollback" style="padding:6px 12px; border:none; background:red; color:white; border-radius:4px; cursor:pointer;">Rollback to V1</button>
            </div>
            <div id="diff-results-box" style="font-size:0.85rem; background:var(--bg-body); border:1px solid var(--border); border-radius:4px; padding:10px; min-height:40px; overflow-x:auto;">
              Select versions and click Compare.
            </div>
          `}
        </div>

        <hr style="border:0; border-top:1px solid var(--border); margin:0;">

        <!-- Chronological Timeline Hook -->
        <div id="audit-timeline-container">
          <!-- Handled by PharmoraEntityTimeline if available -->
        </div>
      </div>
    `;

    // Render timeline
    if (typeof PharmoraEntityTimeline !== "undefined") {
      const container = document.getElementById("audit-timeline-container");
      if (container) {
        container.innerHTML = PharmoraEntityTimeline.render(entity);
      }
    }

    // Attach Diff click handler
    const runDiffBtn = document.getElementById("btn-run-diff");
    if (runDiffBtn) {
      runDiffBtn.addEventListener("click", () => {
        const v1 = parseInt(document.getElementById("diff-v1").value);
        const v2 = parseInt(document.getElementById("diff-v2").value);
        
        if (typeof PharmoraEntityVersioning !== "undefined") {
          const diff = PharmoraEntityVersioning.compareVersions(entity, v1, v2);
          const box = document.getElementById("diff-results-box");
          if (box) {
            box.innerHTML = `<pre style="margin:0;">${JSON.stringify(diff, null, 2)}</pre>`;
          }
        }
      });
    }

    // Attach Rollback click handler
    const rollbackBtn = document.getElementById("btn-rollback");
    if (rollbackBtn) {
      rollbackBtn.addEventListener("click", async () => {
        const v1 = parseInt(document.getElementById("diff-v1").value);
        if (confirm(`Are you sure you want to rollback to Version ${v1}?`)) {
          if (typeof PharmoraEntityVersioning !== "undefined") {
            const actor = (typeof currentUser === "function" ? currentUser()?.id : "admin") || "admin";
            await PharmoraEntityVersioning.rollbackVersion(entity.uuid, v1, actor);
            alert(`Rolled back successfully to Version ${v1}!`);
            location.reload();
          }
        }
      });
    }
  }

  window.PharmoraEntityAuditViewer = {
    render: renderAuditViewer
  };
})();
