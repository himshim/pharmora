/**
 * Pharmora Wizard Core
 * A reusable state machine & layout generator for multi-step guided wizards.
 */
const PharmoraWizardCore = (function () {
  'use strict';

  function createWizard(config) {
    const {
      id,                  // Unique ID (e.g. 'profile', 'contribute')
      containerId,         // HTML element ID to render into
      steps = [],          // Array of Step Definitions: { id, label, fields: [...], render, validate }
      getInitialState,    // Function returning initial state
      onComplete,          // Async save/complete callback
      onStepChange,        // Optional hook
      autosave = true,     // Persist drafts locally
      dynamicSteps         // Optional function: (state, steps) => steps
    } = config;

    const storageKey = `pharmora_draft_wizard_${id}`;

    let state = {
      currentStepIndex: 0,
      data: {}
    };

    // Load draft or initial state
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        state = JSON.parse(saved);
      } else if (getInitialState) {
        state.data = getInitialState();
      }
    } catch (e) {
      console.warn('Failed to load draft state', e);
      if (getInitialState) state.data = getInitialState();
    }

    function saveDraft() {
      if (!autosave) return;
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch (e) {
        console.warn('Autosave failed', e);
      }
    }

    function clearDraft() {
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {}
    }

    function getSteps() {
      if (typeof dynamicSteps === 'function') {
        return dynamicSteps(state.data, steps);
      }
      return steps;
    }

    function getProgress() {
      const currentSteps = getSteps();
      if (currentSteps.length <= 1) return 100;
      return Math.round((state.currentStepIndex / (currentSteps.length - 1)) * 100);
    }

    async function next() {
      const currentSteps = getSteps();
      const currentStep = currentSteps[state.currentStepIndex];

      // Step-specific validation
      if (currentStep && typeof currentStep.validate === 'function') {
        const error = await currentStep.validate(state.data);
        if (error) {
          if (typeof showToast === 'function') showToast(error, 'warning');
          else alert(error);
          return;
        }
      }

      if (state.currentStepIndex < currentSteps.length - 1) {
        state.currentStepIndex++;
        saveDraft();
        render();
        if (onStepChange) onStepChange(state);
      } else {
        // Final completion check
        if (confirm('Are you sure you want to finalize and submit?')) {
          try {
            await onComplete(state.data);
            clearDraft();
            if (typeof showToast === 'function') showToast('Success!', 'success');
          } catch (err) {
            console.error('Wizard completion failed', err);
            if (typeof showToast === 'function') showToast('Submission failed. Try again.', 'error');
          }
        }
      }
    }

    function back() {
      if (state.currentStepIndex > 0) {
        state.currentStepIndex--;
        saveDraft();
        render();
        if (onStepChange) onStepChange(state);
      }
    }

    function renderProgressPills(currentSteps) {
      return `
        <div class="wizard-progress" style="display:flex;align-items:center;margin-bottom:30px;user-select:none;flex-wrap:wrap;gap:8px;">
          ${currentSteps.map((s, idx) => {
            let statusClass = '';
            if (idx === state.currentStepIndex) statusClass = 'active';
            else if (idx < state.currentStepIndex) statusClass = 'done';
            
            const numBg = statusClass === 'active' ? 'var(--primary)' : (statusClass === 'done' ? '#22c55e' : 'var(--border)');
            const numColor = statusClass === 'active' ? '#000' : '#fff';
            const labelColor = statusClass === 'active' ? 'var(--text)' : 'var(--text-muted)';
            
            return `
              <div class="wizard-pill ${statusClass}" style="display:flex;align-items:center;gap:8px;font-size:0.85rem;font-weight:600;color:${labelColor};">
                <span style="width:22px;height:22px;border-radius:50%;background:${numBg};color:${numColor};display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;">${idx + 1}</span>
                ${s.label}
              </div>
              ${idx < currentSteps.length - 1 ? '<div style="flex:1;height:1px;background:var(--border);min-width:10px;max-width:30px;"></div>' : ''}
            `;
          }).join('')}
        </div>
      `;
    }

    function render() {
      const container = document.getElementById(containerId);
      if (!container) return;

      const currentSteps = getSteps();
      const currentStep = currentSteps[state.currentStepIndex];

      if (!currentStep) return;

      // Render step HTML via config render function
      const stepContent = currentStep.render(state.data);

      container.innerHTML = `
        <div class="wizard-card card" style="max-width:820px;margin:0 auto;padding:30px;">
          ${renderProgressPills(currentSteps)}
          <div class="wizard-step-content" style="min-height:200px;">
            ${stepContent}
          </div>
          <div class="wizard-nav" style="display:flex;justify-content:space-between;align-items:center;margin-top:30px;padding-top:20px;border-top:1px solid var(--border);">
            <button class="btn" style="${state.currentStepIndex === 0 ? 'visibility:hidden;' : ''}" onclick="window.${id}WizardInstance.back()">← Back</button>
            <button class="btn btn-primary" onclick="window.${id}WizardInstance.next()">
              ${state.currentStepIndex === currentSteps.length - 1 ? '🚀 Finish & Save' : 'Continue →'}
            </button>
          </div>
        </div>
      `;
    }

    // Attach to global instance for onclick handlers
    window[`${id}WizardInstance`] = { next, back, state, saveDraft };

    // Initial render
    render();
  }

  return { createWizard };
})();

window.PharmoraWizardCore = PharmoraWizardCore;
