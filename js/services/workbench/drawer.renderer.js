    // ── Reusable Drawer Sub-components ──
    function renderDrawerHeader(title, subtitle = '', onCloseClick = 'PharmoraWorkbench._wb.closeDrawer()') {
      return `
        <div style="padding:20px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;
                    position:sticky;top:0;background:var(--surface);z-index:1;">
          <div>
            <div style="font-size:1.15rem;font-weight:800;color:var(--text);">${title}</div>
            ${subtitle ? `<span style="font-size:0.7rem;text-transform:uppercase;background:rgba(34,211,238,.12);color:var(--primary);
                         padding:2px 8px;border-radius:6px;font-weight:700;">${subtitle}</span>` : ''}
          </div>
          <button onclick="${onCloseClick}"
            style="border:none;background:var(--surface-light);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:1rem;color:var(--text);">✕</button>
        </div>
      `;
    }

    function renderDrawerBody(contentHtml) {
      return `
        <div style="padding:20px 24px;display:flex;flex-direction:column;gap:18px;overflow-y:auto;flex:1;">
          ${contentHtml}
        </div>
      `;
    }

    function renderDrawerFooter(buttonsHtml) {
      return `
        <div style="padding:16px 24px;border-top:1px solid var(--border);background:var(--surface);display:flex;justify-content:flex-end;gap:10px;">
          ${buttonsHtml}
        </div>
      `;
    }

    function renderDrawer(title, subtitle, bodyHtml, footerHtml, onCloseClick) {
      return `
        ${renderDrawerHeader(title, subtitle, onCloseClick)}
        ${renderDrawerBody(bodyHtml)}
        ${renderDrawerFooter(footerHtml)}
      `;
    }