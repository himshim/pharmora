/*
  Pharmora Subject Full Page Component
  v2.0.0
*/
(function() {
  function renderSubjectPage(entity) {
    if (!entity || entity.type !== "Subject") {
      return `<div class="container" style="padding:20px;"><h3>Subject not found</h3></div>`;
    }

    const content = entity.content || {};
    const code = content.code || "N/A";
    const title = content.title || "Untitled Subject";
    const shortName = content.shortName || "";
    const semester = content.semester || "";
    const course = content.course || "";
    const credits = content.credits || 0;
    const description = content.description || "";
    const objectives = content.objectives || [];
    const outcomes = content.outcomes || [];
    const tags = entity.tags || [];
    const relations = entity.relations || [];

    // Objectives HTML
    const objectivesHtml = objectives.map(obj => `<li>${obj}</li>`).join("");

    // Outcomes HTML
    const outcomesHtml = outcomes.map(out => `<li>${out}</li>`).join("");

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
      <div class="container subject-detail-page" style="max-width: 1000px; margin: 0 auto; padding: 24px;">
        <div style="margin-bottom: 24px;">
          <a href="#subjects" style="color: var(--primary); text-decoration: none; font-size: 0.9rem;">&larr; Back to Subjects</a>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; border-bottom: 1px solid var(--border); padding-bottom: 20px; margin-bottom: 24px;">
          <div>
            <span style="font-family: monospace; font-size: 0.9rem; background: var(--border); padding: 4px 8px; border-radius: 4px; font-weight: bold; color: var(--text-secondary);">${code}</span>
            <h1 style="margin: 8px 0 4px 0; font-size: 2.2rem; color: var(--text);">${title} ${shortName ? `(${shortName})` : ''}</h1>
            <p style="margin: 0; color: var(--primary); font-size: 1.1rem; font-weight: 500;">
              ${course} &bull; Semester ${semester} &bull; ${credits} Credits
            </p>
          </div>
          <div style="display: flex; gap: 8px;">
            ${tags.map(tag => `<span style="background:var(--primary-light); color:var(--primary); font-size:0.8rem; padding:4px 10px; border-radius:4px;">#${tag}</span>`).join("")}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 32px;">
          <div>
            <section style="margin-bottom: 32px;">
              <h2 style="font-size: 1.4rem; color: var(--text); margin: 0 0 12px 0;">Description</h2>
              <p style="color: var(--text-secondary); font-size: 1rem; line-height: 1.6; margin: 0;">
                ${description}
              </p>
            </section>

            <section style="margin-bottom: 32px;">
              <h2 style="font-size: 1.4rem; color: var(--text); margin: 0 0 12px 0;">Course Objectives</h2>
              <ul style="color: var(--text-secondary); line-height: 1.6; padding-left: 20px; margin: 0;">
                ${objectivesHtml || "<li>No objectives defined.</li>"}
              </ul>
            </section>

            <section style="margin-bottom: 32px;">
              <h2 style="font-size: 1.4rem; color: var(--text); margin: 0 0 12px 0;">Expected Outcomes</h2>
              <ul style="color: var(--text-secondary); line-height: 1.6; padding-left: 20px; margin: 0;">
                ${outcomesHtml || "<li>No outcomes defined.</li>"}
              </ul>
            </section>
          </div>

          <div style="background: var(--bg-body); border: 1px solid var(--border); border-radius: 8px; padding: 20px; height: fit-content;">
            <h3 style="font-size: 1.2rem; color: var(--text); margin: 0 0 16px 0;">Connected Resources</h3>
            ${relationsHtml}
          </div>
        </div>
      </div>
    `;
  }

  window.PharmoraSubjectPage = {
    render: renderSubjectPage
  };
})();
