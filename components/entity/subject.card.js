/*
  Pharmora Subject Card Renderer Component
  v2.0.0
*/
(function() {
  function renderSubjectCard(entity) {
    if (!entity || entity.type !== "Subject") return "";

    const content = entity.content || {};
    const code = content.code || "N/A";
    const title = content.title || "Untitled Subject";
    const shortName = content.shortName || "";
    const semester = content.semester || "";
    const course = content.course || "";
    const credits = content.credits || 0;
    const description = content.description || "";
    const tags = entity.tags || [];

    const tagsHtml = tags.map(tag => `
      <span class="tag-badge" style="background:var(--primary-light); color:var(--primary); font-size:0.75rem; padding:2px 8px; border-radius:4px; margin-right:4px;">
        #${tag}
      </span>
    `).join("");

    return `
      <div class="subject-card card" data-uuid="${entity.uuid}" style="border:1px solid var(--border); border-radius:8px; padding:16px; background:var(--surface); box-shadow:0 2px 4px rgba(0,0,0,0.05); display:flex; flex-direction:column; gap:12px; transition: transform 0.2s; cursor:pointer;" onclick="location.hash='#subject/${entity.uuid}'">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-family:monospace; background:var(--border); font-weight:bold; font-size:0.8rem; padding:2px 6px; border-radius:4px; color:var(--text-secondary);">${code}</span>
          <span style="font-size:0.8rem; color:var(--text-secondary);">${credits} Credits</span>
        </div>
        <div>
          <h3 style="margin:0; font-size:1.15rem; color:var(--text);">${title} ${shortName ? `(${shortName})` : ''}</h3>
          <p style="margin:4px 0 0 0; font-size:0.85rem; color:var(--primary);">${course} • Semester ${semester}</p>
        </div>
        <p style="font-size:0.9rem; color:var(--text-secondary); line-height:1.4; margin:0; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">
          ${description}
        </p>
        <div style="margin-top:auto; display:flex; flex-wrap:wrap; gap:4px;">
          ${tagsHtml}
        </div>
      </div>
    `;
  }

  window.PharmoraSubjectCard = {
    render: renderSubjectCard
  };
})();
