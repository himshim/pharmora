/**
 * Pharmora Workbench - Form Plugin
 * Handles schema-driven form rendering and data gathering.
 */
(function () {
  'use strict';

  if (!window.PharmoraWorkbenchForm) {
    window.PharmoraWorkbenchForm = {};
  }

  function renderField(name, prop, requiredFields, formData) {
    const label = name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1');
    const isRequired = requiredFields.includes(name);
    const requiredStar = isRequired ? '<span style="color:var(--danger);margin-left:var(--space-xs);">*</span>' : '';
    const val = formData[name] !== undefined ? formData[name] : '';

    if (prop.type === 'array') {
      const arrayVal = Array.isArray(val) ? val.join(', ') : val;
      return `
        <div class="form-group" style="display:flex;flex-direction:column;gap:var(--space-xs);margin-bottom:var(--space-md);">
          <label style="font-size:var(--font-sm);font-weight:700;">${label}${requiredStar} <span style="font-weight:normal;color:var(--text-soft);font-size:var(--font-xs);">(comma-separated)</span></label>
          <input type="text" id="wz-field-${name}" value="${arrayVal}" placeholder="e.g. value1, value2" style="padding:10px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--background);color:var(--text);" ${isRequired ? 'required' : ''}>
        </div>
      `;
    } else if (prop.enum) {
      return `
        <div class="form-group" style="display:flex;flex-direction:column;gap:var(--space-xs);margin-bottom:var(--space-md);">
          <label style="font-size:var(--font-sm);font-weight:700;">${label}${requiredStar}</label>
          <select id="wz-field-${name}" style="padding:10px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--background);color:var(--text);" ${isRequired ? 'required' : ''}>
            <option value="">Select...</option>
            ${prop.enum.map(opt => `<option value="${opt}" ${opt === val ? 'selected' : ''}>${opt}</option>`).join('')}
          </select>
        </div>
      `;
    } else if (prop.type === 'boolean') {
      return `
        <div class="form-group" style="display:flex;align-items:center;gap:var(--space-sm);margin-bottom:var(--space-md);padding:var(--space-xs) 0;">
          <input type="checkbox" id="wz-field-${name}" ${val ? 'checked' : ''} style="transform:scale(1.2);">
          <label style="font-size:var(--font-sm);font-weight:700;cursor:pointer;margin:0;" for="wz-field-${name}">${label}${requiredStar}</label>
        </div>
      `;
    } else if (name === 'description' || name === 'objectives' || name === 'outcomes' || (prop.type === 'string' && prop.maxLength > 100)) {
      return `
        <div class="form-group" style="display:flex;flex-direction:column;gap:var(--space-xs);margin-bottom:var(--space-md);">
          <label style="font-size:var(--font-sm);font-weight:700;">${label}${requiredStar}</label>
          <textarea id="wz-field-${name}" rows="4" style="padding:10px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--background);color:var(--text);" ${isRequired ? 'required' : ''}>${val}</textarea>
        </div>
      `;
    } else if (prop.type === 'number') {
      return `
        <div class="form-group" style="display:flex;flex-direction:column;gap:var(--space-xs);margin-bottom:var(--space-md);">
          <label style="font-size:var(--font-sm);font-weight:700;">${label}${requiredStar}</label>
          <input type="number" id="wz-field-${name}" value="${val}" style="padding:10px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--background);color:var(--text);" ${isRequired ? 'required' : ''}>
        </div>
      `;
    }
    return `
      <div class="form-group" style="display:flex;flex-direction:column;gap:var(--space-xs);margin-bottom:var(--space-md);">
        <label style="font-size:var(--font-sm);font-weight:700;">${label}${requiredStar}</label>
        <input type="text" id="wz-field-${name}" value="${val}" style="padding:10px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--background);color:var(--text);" ${isRequired ? 'required' : ''}>
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

  function gatherWzFormData(workbench) {
    const type = workbench._createWizardState.type;
    let schema = null;
    if (typeof PharmoraEntityRegistry !== 'undefined') {
      schema = PharmoraEntityRegistry.getSchema(type);
    }
    const contentProps = schema?.properties?.content?.properties || {};
    const content = {};

    Object.entries(contentProps).forEach(([name, prop]) => {
      const input = document.getElementById(`wz-field-${name}`);
      if (!input) return;

      if (prop.type === 'boolean') {
        content[name] = input.checked;
      } else if (prop.type === 'number') {
        content[name] = input.value !== '' ? Number(input.value) : 0;
      } else if (prop.type === 'array') {
        const val = input.value.trim();
        content[name] = val ? val.split(',').map(s => s.trim()).filter(Boolean) : [];
      } else {
        content[name] = input.value.trim();
      }
    });
    return content;
  }

  function _saveCreateDraft(workbench) {
    const content = gatherWzFormData(workbench);
    workbench._createWizardState.formData = content;
    if (typeof showToast === 'function') showToast('Draft saved successfully.', 'success');
  }

  function init(workbench, config) {
    workbench._gatherWzFormData = () => gatherWzFormData(workbench);
    workbench._saveCreateDraft = () => _saveCreateDraft(workbench);
  }

  window.PharmoraWorkbenchForm.renderForm = renderForm;
  window.PharmoraWorkbenchForm.init = init;
})();
