    // ── Schema Form Fields Renderers ──
    function renderField(name, prop, requiredFields, formData) {
      const label = name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1');
      const isRequired = requiredFields.includes(name);
      const requiredStar = isRequired ? '<span style="color:#ef4444;margin-left:4px;">*</span>' : '';
      const val = formData[name] !== undefined ? formData[name] : '';

      if (prop.type === 'array') {
        const arrayVal = Array.isArray(val) ? val.join(', ') : val;
        return `
          <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px;">
            <label style="font-size:0.82rem;font-weight:700;">${label}${requiredStar} <span style="font-weight:normal;color:var(--text-soft);font-size:0.75rem;">(comma-separated)</span></label>
            <input type="text" id="wz-field-${name}" value="${arrayVal}" placeholder="e.g. value1, value2" style="padding:8px;border-radius:6px;border:1px solid var(--border);background:var(--background);color:var(--text);" ${isRequired ? 'required' : ''}>
          </div>
        `;
      } else if (prop.enum) {
        return `
          <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px;">
            <label style="font-size:0.82rem;font-weight:700;">${label}${requiredStar}</label>
            <select id="wz-field-${name}" style="padding:8px;border-radius:6px;border:1px solid var(--border);background:var(--background);color:var(--text);" ${isRequired ? 'required' : ''}>
              <option value="">Select...</option>
              ${prop.enum.map(opt => `<option value="${opt}" ${opt === val ? 'selected' : ''}>${opt}</option>`).join('')}
            </select>
          </div>
        `;
      } else if (prop.type === 'boolean') {
        return `
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;padding:6px 0;">
            <input type="checkbox" id="wz-field-${name}" ${val ? 'checked' : ''} style="transform:scale(1.2);">
            <label style="font-size:0.82rem;font-weight:700;cursor:pointer;" for="wz-field-${name}">${label}${requiredStar}</label>
          </div>
        `;
      } else if (name === 'description' || name === 'objectives' || name === 'outcomes' || (prop.type === 'string' && prop.maxLength > 100)) {
        return `
          <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px;">
            <label style="font-size:0.82rem;font-weight:700;">${label}${requiredStar}</label>
            <textarea id="wz-field-${name}" rows="4" style="padding:8px;border-radius:6px;border:1px solid var(--border);background:var(--background);color:var(--text);" ${isRequired ? 'required' : ''}>${val}</textarea>
          </div>
        `;
      } else if (prop.type === 'number') {
        return `
          <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px;">
            <label style="font-size:0.82rem;font-weight:700;">${label}${requiredStar}</label>
            <input type="number" id="wz-field-${name}" value="${val}" style="padding:8px;border-radius:6px;border:1px solid var(--border);background:var(--background);color:var(--text);" ${isRequired ? 'required' : ''}>
          </div>
        `;
      }
      return `
        <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px;">
          <label style="font-size:0.82rem;font-weight:700;">${label}${requiredStar}</label>
          <input type="text" id="wz-field-${name}" value="${val}" style="padding:8px;border-radius:6px;border:1px solid var(--border);background:var(--background);color:var(--text);" ${isRequired ? 'required' : ''}>
        </div>
      `;
    }

    function renderForm(schema, formData) {
      const contentProps = schema?.properties?.content?.properties || {};
      const requiredFields = schema?.properties?.content?.required || [];
      return Object.entries(contentProps)
        .map(([name, prop]) => renderField(name, prop, requiredFields, formData))
        .join('');
    }