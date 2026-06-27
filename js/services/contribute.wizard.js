/**
 * Pharmora Universal Contribution Wizard
 * Schema-driven submission flow.
 * v2.0.0
 */

const PharmoraContribute = (function () {
  'use strict';

  let state = {
    step: 1,
    selectedType: null,
    uploadedFile: null,
    formData: {}
  };

  function el(id) {
    return document.getElementById(id);
  }

  function renderTypePicker() {
    const container = el('wizard-step-1');
    if (!container) return;

    // Read types from Entity Registry
    let registeredTypes = [];
    if (typeof PharmoraEntityRegistry !== "undefined") {
      registeredTypes = PharmoraEntityRegistry.getRegisteredTypes();
    }
    
    // In case registry is not populated yet, fallback to Subject and Drug
    if (registeredTypes.length === 0) {
      registeredTypes = ["Subject", "Drug"];
    }

    const typeDetails = {
      "Subject": { label: "Subject Monograph", icon: "📚", desc: "Syllabus, topics, objectives, outcomes, and academic classification" },
      "Drug": { label: "Drug Monograph", icon: "💊", desc: "Chemical information, schedule, brand names, indications, and dosages" }
    };

    container.innerHTML = `
      <div class="type-picker-header" style="text-align:center; margin-bottom:24px;">
        <h2>What are you contributing?</h2>
        <p style="color:var(--text-muted);">Select the Universal Entity Type you want to submit.</p>
      </div>
      <div class="type-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:20px;">
        ${registeredTypes.map(t => {
          const detail = typeDetails[t] || { label: t, icon: "📋", desc: `Submit a new ${t} entity monograph` };
          return `
            <div class="type-card" id="type-card-${t}" onclick="PharmoraContribute.selectType('${t}')" style="border:1px solid var(--border); border-radius:8px; padding:16px; background:var(--surface); cursor:pointer; text-align:center; transition: transform 0.2s;">
              <div class="type-icon" style="font-size:2rem; margin-bottom:8px;">${detail.icon}</div>
              <div class="type-label" style="font-weight:bold; font-size:1.1rem; color:var(--text); margin-bottom:6px;">${detail.label}</div>
              <div class="type-desc" style="font-size:0.85rem; color:var(--text-secondary);">${detail.desc}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function selectType(typeId) {
    state.selectedType = typeId;

    document.querySelectorAll('.type-card').forEach(c => {
      c.style.borderColor = "var(--border)";
      c.style.background = "var(--surface)";
    });
    const card = el('type-card-' + typeId);
    if (card) {
      card.style.borderColor = "var(--primary)";
      card.style.background = "var(--primary-light)";
    }

    const nextBtn = el('wizard-next');
    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.textContent = 'Continue →';
    }
  }

  function generateFieldHTML(name, prop) {
    const isRequired = false; // Resolved at schema level
    const label = name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1');

    if (prop.type === "array") {
      return `
        <div class="form-group" style="margin-bottom:16px; display:flex; flex-direction:column; gap:6px;">
          <label style="font-weight:600; font-size:0.9rem; color:var(--text);">${label} <span style="font-weight:normal; color:var(--text-secondary); font-size:0.8rem;">(comma separated)</span></label>
          <input type="text" id="sf-${name}" class="form-input" placeholder="e.g. Value 1, Value 2" style="padding:8px; border-radius:4px; border:1px solid var(--border);">
        </div>
      `;
    }

    if (prop.enum) {
      return `
        <div class="form-group" style="margin-bottom:16px; display:flex; flex-direction:column; gap:6px;">
          <label style="font-weight:600; font-size:0.9rem; color:var(--text);">${label}</label>
          <select id="sf-${name}" class="form-input" style="padding:8px; border-radius:4px; border:1px solid var(--border);">
            <option value="">Select option...</option>
            ${prop.enum.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
          </select>
        </div>
      `;
    }

    if (name === "description" || name === "objectives" || name === "outcomes") {
      return `
        <div class="form-group" style="margin-bottom:16px; display:flex; flex-direction:column; gap:6px;">
          <label style="font-weight:600; font-size:0.9rem; color:var(--text);">${label}</label>
          <textarea id="sf-${name}" class="form-input" rows="4" style="padding:8px; border-radius:4px; border:1px solid var(--border);"></textarea>
        </div>
      `;
    }

    return `
      <div class="form-group" style="margin-bottom:16px; display:flex; flex-direction:column; gap:6px;">
        <label style="font-weight:600; font-size:0.9rem; color:var(--text);">${label}</label>
        <input type="${prop.type === 'number' ? 'number' : 'text'}" id="sf-${name}" class="form-input" style="padding:8px; border-radius:4px; border:1px solid var(--border);">
      </div>
    `;
  }

  function renderSmartForm() {
    const container = el('wizard-step-2');
    if (!container || !state.selectedType) return;

    let schema = null;
    if (typeof PharmoraEntityRegistry !== "undefined") {
      schema = PharmoraEntityRegistry.getSchema(state.selectedType);
    }

    const contentProps = schema?.properties?.content?.properties || {};

    const fieldsHtml = Object.entries(contentProps).map(([name, prop]) => {
      return generateFieldHTML(name, prop);
    }).join('');

    container.innerHTML = `
      <div class="smart-form-header" style="margin-bottom:20px;">
        <h2>Add Details for ${state.selectedType}</h2>
        <p style="color:var(--text-secondary); font-size:0.9rem;">Fill out the properties required by the universal schema.</p>
      </div>
      <div style="background:var(--surface); border:1px solid var(--border); padding:20px; border-radius:8px;">
        ${fieldsHtml}
      </div>
    `;
  }

  function getFormData() {
    let schema = null;
    if (typeof PharmoraEntityRegistry !== "undefined") {
      schema = PharmoraEntityRegistry.getSchema(state.selectedType);
    }
    const contentProps = schema?.properties?.content?.properties || {};

    const content = {};
    Object.entries(contentProps).forEach(([name, prop]) => {
      const field = el(`sf-${name}`);
      if (!field) return;

      let value = field.value.trim();
      if (prop.type === "array") {
        content[name] = value ? value.split(',').map(s => s.trim()) : [];
      } else if (prop.type === "number") {
        content[name] = value ? parseFloat(value) : 0;
      } else if (prop.type === "boolean") {
        content[name] = field.checked;
      } else {
        content[name] = value;
      }
    });

    return {
      type: state.selectedType,
      content,
      status: "pending_review"
    };
  }

  function renderPreview() {
    const container = el('wizard-step-3');
    if (!container) return;

    const data = getFormData();
    
    // Auto populate basic wrapper
    const entityMock = new PharmoraEntityCore.BaseEntity(data);

    let previewHtml = "";
    if (typeof PharmoraUniversalRenderer !== "undefined") {
      const config = typeof PharmoraSubjectRenderer !== "undefined" && state.selectedType === "Subject"
        ? PharmoraSubjectRenderer.config
        : PharmoraUniversalRenderer.getAutoConfig(entityMock);
      previewHtml = PharmoraUniversalRenderer.render(entityMock, "card", config);
    } else {
      previewHtml = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    }

    container.innerHTML = `
      <div class="review-header" style="margin-bottom:20px; text-align:center;">
        <h2>Review & Submit</h2>
        <p style="color:var(--text-secondary);">Here is how your contribution will look. Verify everything is correct.</p>
      </div>
      <div style="max-width:400px; margin:0 auto 20px auto;">
        ${previewHtml}
      </div>
    `;
  }

  function setStep(n) {
    state.step = n;

    for (let i = 1; i <= 3; i++) {
      const panel = el('wizard-step-' + i);
      if (panel) {
        panel.style.display = i === n ? 'block' : 'none';
      }
    }

    const backBtn = el('wizard-back');
    const nextBtn = el('wizard-next');
    const submitBtn = el('wizard-submit');

    if (backBtn) backBtn.style.display = n === 1 ? 'none' : 'block';
    if (nextBtn) {
      nextBtn.style.display = n === 3 ? 'none' : 'block';
      nextBtn.textContent = n === 2 ? 'Review & Preview' : 'Continue →';
    }
    if (submitBtn) submitBtn.style.display = n === 3 ? 'block' : 'none';
  }

  async function next() {
    if (state.step === 1 && !state.selectedType) {
      alert("Please select a contribution type first.");
      return;
    }

    if (state.step === 1) {
      renderSmartForm();
      setStep(2);
    } else if (state.step === 2) {
      // Validate
      const data = getFormData();
      const entityMock = new PharmoraEntityCore.BaseEntity(data);
      let schema = null;
      if (typeof PharmoraEntityRegistry !== "undefined") {
        schema = PharmoraEntityRegistry.getSchema(state.selectedType);
      }
      const valResult = PharmoraEntitySchema.validate(entityMock, schema);
      if (!valResult.valid) {
        alert("Validation error:\n" + valResult.errors.join("\n"));
        return;
      }
      renderPreview();
      setStep(3);
    }
  }

  function back() {
    if (state.step > 1) {
      setStep(state.step - 1);
    }
  }

  async function submit() {
    const submitBtn = el('wizard-submit');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
    }

    try {
      const data = getFormData();
      const actor = (typeof currentUser === "function" ? currentUser()?.id : "contributor") || "contributor";
      
      const created = await PharmoraEntityAPI.createEntity(data, actor);
      console.log("[Contribute] Submission successful:", created);
      
      alert("✅ Submitted for review! You'll be notified when it's approved.");
      resetWizard();
    } catch (err) {
      console.error("[Contribute] Submission error:", err);
      alert("Submission failed. Please verify fields and try again.");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = '🚀 Submit Contribution';
      }
    }
  }

  function resetWizard() {
    state = { step: 1, selectedType: null, uploadedFile: null, formData: {} };
    renderTypePicker();
    setStep(1);
    const nextBtn = el('wizard-next');
    if (nextBtn) {
      nextBtn.disabled = true;
      nextBtn.textContent = 'Continue →';
    }
  }

  function loadCascade() { return Promise.resolve(); }
  function handleFile() {}

  function init() {
    try {
      const user = typeof currentUser === 'function' ? currentUser() : null;
      const authGate = el('auth-gate');
      const wizardSection = el('wizard-section');

      if (!user) {
        if (authGate) authGate.style.display = 'block';
        if (wizardSection) wizardSection.style.display = 'none';
        return;
      }

      if (authGate) authGate.style.display = 'none';
      if (wizardSection) wizardSection.style.display = 'block';

      renderTypePicker();
      setStep(1);

      const nextBtn = el('wizard-next');
      if (nextBtn) nextBtn.disabled = true;
    } catch (err) {
      console.error("Contribute Wizard init failed:", err);
    }
  }

  const publicApi = { init, selectType, loadCascade, handleFile, next, back, submit };
  window.PharmoraContribute = publicApi;
  return publicApi;
})();
