/**
 * Pharmora Contribution Wizard
 * Guided 3-step submission flow for pharmacy knowledge contributions.
 * Step 1 — Type Picker | Step 2 — Smart Form | Step 3 — Review & Submit
 */

const PharmoraContribute = (function () {
  'use strict';

  // ─── CONTENT TYPE DEFINITIONS ──────────────────────────────────────────────

  const TYPES = [
    {
      id: 'resources',
      label: 'Study Notes',
      icon: '📚',
      desc: 'Notes, PDFs, presentations, lecture slides',
      academic: true
    },
    {
      id: 'drugs',
      label: 'Drug Monograph',
      icon: '💊',
      desc: 'Drug info, mechanism, Indian brands, CDSCO schedule',
      academic: false
    },
    {
      id: 'practicals',
      label: 'Practical File',
      icon: '🧪',
      desc: 'Aim, principle, procedure, observations, conclusion',
      academic: true
    },
    {
      id: 'question-bank',
      label: 'Question / MCQ',
      icon: '❓',
      desc: 'University, GPAT, State PET, NIPER exam questions',
      academic: true
    },
    {
      id: 'books',
      label: 'Book Reference',
      icon: '📖',
      desc: 'Textbooks, reference books, recommended reads',
      academic: false
    },
    {
      id: 'research',
      label: 'Research Paper',
      icon: '🔬',
      desc: 'Published papers, thesis, review articles',
      academic: false
    },
    {
      id: 'jobs',
      label: 'Job / Internship',
      icon: '💼',
      desc: 'Industry, hospital, government pharmacy openings',
      academic: false
    },
    {
      id: 'events',
      label: 'Event / Webinar',
      icon: '📅',
      desc: 'Conferences, workshops, seminars, competitions',
      academic: false
    },
    {
      id: 'documents',
      label: 'Document / SOP',
      icon: '📋',
      desc: 'SOPs, guidelines, regulatory documents, formularies',
      academic: false
    },
    {
      id: 'teaching-materials',
      label: 'Teaching Material',
      icon: '👨‍🏫',
      desc: 'Lesson plans, teaching aids for educators',
      academic: true
    }
  ];

  // ─── TYPE-SPECIFIC FORM FIELDS (pharmacy-aware labels) ────────────────────

  const TYPE_FIELDS = {

    'resources': [
      {
        name: 'resourceType', label: 'Content Type *', type: 'select', required: true,
        options: ['', 'Notes', 'Lecture Notes', 'Previous Year Question Paper',
          'Presentation (PPT)', 'Assignment', 'Video Link', 'Study Guide', 'Other']
      },
      {
        name: 'difficulty', label: 'Difficulty Level', type: 'select',
        options: ['', 'Beginner', 'Intermediate', 'Advanced']
      }
    ],

    'drugs': [
      {
        name: 'genericName', label: 'Generic Name (INN) *', type: 'text', required: true,
        placeholder: 'e.g. Paracetamol, Ibuprofen, Atorvastatin'
      },
      {
        name: 'brandNames', label: 'Indian Brand Names', type: 'text',
        placeholder: 'e.g. Crocin, Dolo 650, Combiflam (comma separated)'
      },
      {
        name: 'drugClass', label: 'Drug Class / Category *', type: 'text', required: true,
        placeholder: 'e.g. NSAID, Aminoglycoside Antibiotic, HMG-CoA Reductase Inhibitor'
      },
      {
        name: 'scheduleType', label: 'CDSCO Drug Schedule *', type: 'select', required: true,
        options: [
          '', 'Schedule H (Rx Only)', 'Schedule H1 (Rx + Record Mandatory)',
          'Schedule X (Narcotic / Psychotropic)', 'Schedule G (Self-Medication)',
          'OTC (No Prescription Required)', 'Not Scheduled'
        ]
      },
      {
        name: 'mechanism', label: 'Mechanism of Action *', type: 'textarea', required: true,
        placeholder: 'How the drug works at the molecular / receptor level'
      },
      {
        name: 'indications', label: 'Therapeutic Uses / Indications *', type: 'textarea', required: true,
        placeholder: 'Clinical uses — fever, infection, hypertension etc.'
      },
      {
        name: 'dose', label: 'Standard Dose & Route', type: 'textarea',
        placeholder: 'e.g. 500mg PO Q6H (Max 4g/day); IV 1g Q8H. Reduce dose in renal failure.'
      },
      {
        name: 'sideEffects', label: 'Adverse Drug Reactions (ADRs)', type: 'textarea',
        placeholder: 'Common and serious side effects'
      },
      {
        name: 'contraindications', label: 'Contraindications & Precautions', type: 'textarea'
      },
      {
        name: 'interactions', label: 'Important Drug Interactions', type: 'textarea',
        placeholder: 'e.g. Warfarin + NSAIDs → increased bleeding risk'
      },
      {
        name: 'pharmacokinetics', label: 'Pharmacokinetics (ADME)', type: 'textarea',
        placeholder: 'Absorption, Distribution, Metabolism (enzyme), Excretion (half-life, route)'
      },
      {
        name: 'ipStandard', label: 'Pharmacopoeia Standard', type: 'text',
        placeholder: 'e.g. IP 2022, BP 2024, USP-NF'
      },
      {
        name: 'nlemListed', label: 'Listed in NLEM 2022 (National Essential Medicines)?', type: 'select',
        options: ['', 'Yes', 'No', 'Not Sure']
      },
      {
        name: 'janAushadhi', label: 'Available under Jan Aushadhi Scheme?', type: 'select',
        options: ['', 'Yes', 'No', 'Not Sure']
      }
    ],

    'practicals': [
      {
        name: 'aim', label: 'Aim / Objective *', type: 'textarea', required: true,
        placeholder: 'To determine / To prepare / To analyse...'
      },
      {
        name: 'principle', label: 'Principle *', type: 'textarea', required: true,
        placeholder: 'The scientific basis or theory behind this practical'
      },
      {
        name: 'materials', label: 'Requirements / Apparatus / Chemicals', type: 'textarea',
        placeholder: 'List of reagents, instruments, and equipment required'
      },
      {
        name: 'procedure', label: 'Procedure *', type: 'textarea', required: true,
        placeholder: 'Step-by-step procedure'
      },
      {
        name: 'observations', label: 'Observations / Results / Tabulation', type: 'textarea',
        placeholder: 'Observed results, readings, or data table format'
      },
      {
        name: 'calculations', label: 'Calculations', type: 'textarea',
        placeholder: 'Any formulae or calculations involved'
      },
      {
        name: 'conclusion', label: 'Conclusion / Inference', type: 'textarea',
        placeholder: 'What was concluded from this practical'
      }
    ],

    'question-bank': [
      {
        name: 'question', label: 'Question *', type: 'textarea', required: true,
        placeholder: 'Write the full question text here'
      },
      {
        name: 'questionType', label: 'Question Type *', type: 'select', required: true,
        options: ['', 'MCQ (Single Correct)', 'Short Answer (2-5 marks)',
          'Long Answer (10+ marks)', 'Numerical / Calculation', 'Viva Voce', 'Match the Following']
      },
      {
        name: 'examType', label: 'Exam Category', type: 'select',
        options: ['', 'University Exam', 'GPAT', 'State PET', 'NIPER Entrance', 'Viva Voce', 'Internal Assessment', 'Other']
      },
      { name: 'optionA', label: 'Option A (for MCQ)', type: 'text' },
      { name: 'optionB', label: 'Option B (for MCQ)', type: 'text' },
      { name: 'optionC', label: 'Option C (for MCQ)', type: 'text' },
      { name: 'optionD', label: 'Option D (for MCQ)', type: 'text' },
      {
        name: 'difficulty', label: 'Difficulty Level', type: 'select',
        options: ['', 'Easy', 'Medium', 'Hard']
      },
      {
        name: 'answer', label: 'Correct Answer / Answer Key *', type: 'textarea', required: true,
        placeholder: 'e.g. Option B — Ibuprofen. Brief rationale: ...'
      }
    ],

    'books': [
      {
        name: 'author', label: 'Author(s) *', type: 'text', required: true,
        placeholder: 'e.g. K.D. Tripathi, Rang & Dale, S.K. Bhavsar'
      },
      { name: 'publisher', label: 'Publisher', type: 'text', placeholder: 'e.g. Jaypee Brothers, Elsevier' },
      { name: 'edition', label: 'Latest / Recommended Edition', type: 'text', placeholder: 'e.g. 9th Edition, 2023' },
      { name: 'isbn', label: 'ISBN (optional)', type: 'text' }
    ],

    'research': [
      {
        name: 'authors', label: 'Author(s) *', type: 'text', required: true,
        placeholder: 'Surname A, Surname B, et al.'
      },
      {
        name: 'journal', label: 'Journal / Publication', type: 'text',
        placeholder: 'e.g. Indian Journal of Pharmaceutical Sciences, J Pharm Pharmacol'
      },
      { name: 'year', label: 'Year Published', type: 'text', placeholder: 'e.g. 2023' },
      { name: 'doi', label: 'DOI / PubMed ID', type: 'text', placeholder: 'e.g. 10.1016/...' },
      {
        name: 'abstract', label: 'Abstract / Summary', type: 'textarea',
        placeholder: 'Paste the abstract or write a brief summary'
      }
    ],

    'jobs': [
      {
        name: 'company', label: 'Company / Hospital / Institution *', type: 'text', required: true,
        placeholder: 'e.g. Sun Pharma, AIIMS Delhi, Apollo Hospitals'
      },
      {
        name: 'location', label: 'Location (City, State) *', type: 'text', required: true,
        placeholder: 'e.g. Mumbai, Maharashtra'
      },
      {
        name: 'jobType', label: 'Employment Type', type: 'select',
        options: ['', 'Full-time', 'Part-time', 'Internship (Stipend)', 'Contract', 'Government (UPSC/PSC)', 'Consultant']
      },
      {
        name: 'sector', label: 'Sector', type: 'select',
        options: ['', 'Pharmaceutical Industry', 'Hospital / Clinical Pharmacy',
          'Community / Retail Pharmacy', 'Academics / Teaching', 'Research & Development',
          'Government / Regulatory (CDSCO/PCI)', 'Jan Aushadhi', 'Other']
      },
      { name: 'applyLink', label: 'Apply Link / Contact Email', type: 'text' },
      { name: 'deadline', label: 'Last Date to Apply', type: 'date' }
    ],

    'events': [
      { name: 'date', label: 'Event Date *', type: 'date', required: true },
      {
        name: 'mode', label: 'Mode', type: 'select',
        options: ['', 'Online', 'Offline', 'Hybrid']
      },
      { name: 'venue', label: 'Venue / Platform', type: 'text', placeholder: 'e.g. Zoom, PCI Bhawan New Delhi' },
      { name: 'organizer', label: 'Organizer', type: 'text', placeholder: 'e.g. IPA, APTI, Pharmora Community' },
      { name: 'registrationLink', label: 'Registration Link', type: 'text' },
      {
        name: 'fee', label: 'Registration Fee', type: 'text',
        placeholder: 'e.g. Free, Rs. 200 (Students), Rs. 500 (Professionals)'
      }
    ],

    'documents': [
      {
        name: 'documentType', label: 'Document Type', type: 'select',
        options: ['', 'SOP', 'Guideline', 'Regulatory Document', 'Hospital Formulary',
          'Drug Schedule / List', 'Protocol', 'Policy Document', 'Other']
      },
      {
        name: 'issuingAuthority', label: 'Issuing Authority', type: 'text',
        placeholder: 'e.g. CDSCO, PCI, WHO, Ministry of Health, IP Commission'
      },
      { name: 'documentRef', label: 'Document Reference / Number', type: 'text' }
    ],

    'teaching-materials': [
      {
        name: 'materialType', label: 'Material Type *', type: 'select', required: true,
        options: ['', 'Lecture Notes', 'Lesson Plan', 'Presentation (PPT)', 'Practical Manual', 'Teaching Aid', 'Video Link', 'Other']
      }
    ]
  };

  // Types that allow file upload
  const FILE_TYPES = new Set(['resources', 'practicals', 'documents', 'teaching-materials', 'books']);

  // ─── STATE ────────────────────────────────────────────────────────────────

  let state = {
    step: 1,
    selectedType: null,
    uploadedFile: null
  };

  // ─── DOM HELPERS ──────────────────────────────────────────────────────────

  function el(id) {
    return document.getElementById(id);
  }

  function val(id) {
    const e = el(id);
    return e ? e.value.trim() : '';
  }

  function optionText(id) {
    const e = el(id);
    if (!e || !e.value) return '';
    const opt = e.options[e.selectedIndex];
    return opt ? opt.text : e.value;
  }

  // ─── STEP MANAGEMENT ──────────────────────────────────────────────────────

  function setStep(n) {
    state.step = n;

    // Show/hide step panels
    for (let i = 1; i <= 3; i++) {
      const panel = el('wizard-step-' + i);
      if (panel) panel.classList.toggle('hidden', i !== n);
    }

    // Update progress pills
    document.querySelectorAll('.wizard-pill').forEach(p => {
      const pn = parseInt(p.dataset.step || '0');
      p.classList.toggle('active', pn === n);
      p.classList.toggle('done', pn < n);
    });

    // Navigation buttons
    const backBtn = el('wizard-back');
    const nextBtn = el('wizard-next');

    if (backBtn) backBtn.style.display = n === 1 ? 'none' : '';
    if (nextBtn) nextBtn.style.display = n === 3 ? 'none' : '';
  }

  // ─── STEP 1: TYPE PICKER ──────────────────────────────────────────────────

  function renderTypePicker() {
    const container = el('wizard-step-1');
    if (!container) return;

    container.innerHTML = `
      <div class="type-picker-header">
        <h2>What are you contributing?</h2>
        <p>Select the type of pharmacy knowledge you want to share.</p>
      </div>
      <div class="type-grid">
        ${TYPES.map(t => `
          <div class="type-card" id="type-card-${t.id}" onclick="PharmoraContribute.selectType('${t.id}')">
            <div class="type-icon">${t.icon}</div>
            <div class="type-label">${t.label}</div>
            <div class="type-desc">${t.desc}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function selectType(typeId) {
    state.selectedType = typeId;

    // Highlight selected
    document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
    const card = el('type-card-' + typeId);
    if (card) card.classList.add('selected');

    // Activate Continue button
    const nextBtn = el('wizard-next');
    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.textContent = 'Continue →';
    }
  }

  // ─── STEP 2: SMART FORM ───────────────────────────────────────────────────

  async function renderSmartForm() {
    const container = el('wizard-step-2');
    if (!container || !state.selectedType) return;

    const type = TYPES.find(t => t.id === state.selectedType);
    if (!type) return;

    const fields = TYPE_FIELDS[state.selectedType] || [];
    const showFile = FILE_TYPES.has(state.selectedType);

    container.innerHTML = `
      <div class="smart-form-header">
        <div class="type-badge">${type.icon} ${type.label}</div>
        <h2>Add Details</h2>
      </div>

      <div class="form-group">
        <label class="form-label">Title *</label>
        <input id="cf-title" class="form-input"
          placeholder="${getTitlePlaceholder(state.selectedType)}" autocomplete="off">
      </div>

      ${type.academic ? renderAcademicCascadeHTML() : ''}

      <div id="type-specific-fields">
        ${fields.map(f => renderField(f)).join('')}
      </div>

      <div class="form-group">
        <label class="form-label">Description / Additional Notes</label>
        <textarea id="cf-description" class="form-input"
          placeholder="Any additional context, notes, or details about this contribution..."
          rows="4"></textarea>
      </div>

      ${showFile ? `
      <div class="upload-zone" id="upload-zone" onclick="document.getElementById('cf-file').click()">
        <input type="file" id="cf-file" style="display:none"
          onchange="PharmoraContribute.handleFile(this)"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg">
        <div class="upload-icon">📎</div>
        <div class="upload-label">Upload File <span class="upload-optional">(optional)</span></div>
        <div class="upload-hint">PDF, PPT, DOC, Images — Max 20MB</div>
        <div id="file-name-display" class="file-name-display"></div>
      </div>` : ''}

      <div class="form-group">
        <label class="form-label">External Link <span style="color:var(--text-muted);font-weight:400">(optional)</span></label>
        <input id="cf-link" class="form-input" type="url"
          placeholder="https://...  (Google Drive, PubMed, Official source)">
      </div>

      <div class="form-group">
        <label class="form-label">Tags <span style="color:var(--text-muted);font-weight:400">(comma separated)</span></label>
        <input id="cf-tags" class="form-input"
          placeholder="e.g. Pharmacology, B.Pharm, GPAT, Unit 3, Important">
      </div>
    `;

    // Load academic cascade if needed
    if (type.academic) {
      await loadCascade('course');
    }
  }

  function getTitlePlaceholder(typeId) {
    const map = {
      'resources': 'e.g. BP503T Pharmacology Unit 2 — Autacoids Notes',
      'drugs': 'e.g. Paracetamol (Acetaminophen) Monograph',
      'practicals': 'e.g. Determination of Melting Point of Aspirin',
      'question-bank': 'e.g. Which drug is first-line for Type 2 DM? (GPAT 2023)',
      'books': 'e.g. Essentials of Medical Pharmacology — KD Tripathi',
      'research': 'e.g. Formulation and Evaluation of Paracetamol Tablets',
      'jobs': 'e.g. Pharmacovigilance Executive — Sun Pharma Mumbai',
      'events': 'e.g. National Pharmacy Students Convention 2026',
      'documents': 'e.g. SOP for Preparation of Sterile Eye Drops',
      'teaching-materials': 'e.g. Lesson Plan: Antihypertensive Drugs — B.Pharm Sem 5'
    };
    return map[typeId] || 'Enter title or name';
  }

  function renderAcademicCascadeHTML() {
    return `
      <div class="academic-cascade">
        <div class="cascade-header">📍 Academic Classification</div>
        <div class="form-group">
          <label class="form-label">Course</label>
          <select id="cf-course" class="form-input"
            onchange="PharmoraContribute.loadCascade('curriculum')">
            <option value="">Select Course...</option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Curriculum</label>
            <select id="cf-curriculum" class="form-input"
              onchange="PharmoraContribute.loadCascade('semester')">
              <option value="">Select Curriculum...</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Semester / Year</label>
            <select id="cf-semester" class="form-input"
              onchange="PharmoraContribute.loadCascade('subject')">
              <option value="">Select Semester...</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Subject</label>
            <select id="cf-subject" class="form-input"
              onchange="PharmoraContribute.loadCascade('unit')">
              <option value="">Select Subject...</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Unit / Chapter <span style="color:var(--text-muted);font-weight:400">(optional)</span></label>
            <select id="cf-unit" class="form-input">
              <option value="">Select Unit...</option>
            </select>
          </div>
        </div>
      </div>
    `;
  }

  function renderField(f) {
    const id = 'cf-field-' + f.name;
    const req = f.required ? 'required' : '';
    const ph = f.placeholder || '';

    if (f.type === 'text') {
      return `<div class="form-group">
        <label class="form-label">${f.label}</label>
        <input id="${id}" class="form-input" placeholder="${ph}" ${req}>
      </div>`;
    }

    if (f.type === 'textarea') {
      return `<div class="form-group">
        <label class="form-label">${f.label}</label>
        <textarea id="${id}" class="form-input" placeholder="${ph}" rows="3" ${req}></textarea>
      </div>`;
    }

    if (f.type === 'select') {
      const opts = (f.options || [])
        .map(o => `<option value="${o}">${o || 'Select...'}</option>`)
        .join('');
      return `<div class="form-group">
        <label class="form-label">${f.label}</label>
        <select id="${id}" class="form-input" ${req}>${opts}</select>
      </div>`;
    }

    if (f.type === 'date') {
      return `<div class="form-group">
        <label class="form-label">${f.label}</label>
        <input id="${id}" class="form-input" type="date" ${req}>
      </div>`;
    }

    return '';
  }

  // ─── ACADEMIC CASCADE ─────────────────────────────────────────────────────

  async function loadCascade(level) {
    const CASCADE = {
      course:      { selectId: 'cf-course',      collection: 'courses',    parentId: null,          parentField: null,         nameField: 'name' },
      curriculum:  { selectId: 'cf-curriculum',  collection: 'curriculums', parentId: 'cf-course',   parentField: 'course',     nameField: 'name' },
      semester:    { selectId: 'cf-semester',    collection: 'semesters',  parentId: 'cf-curriculum', parentField: 'curriculum', nameField: 'name' },
      subject:     { selectId: 'cf-subject',     collection: 'subjects',   parentId: 'cf-semester', parentField: 'semester',   nameField: 'name' },
      unit:        { selectId: 'cf-unit',        collection: 'units',      parentId: 'cf-subject',  parentField: 'subject',    nameField: 'name' }
    };

    const ORDER = ['course', 'curriculum', 'semester', 'subject', 'unit'];

    // Reset all downstream selects
    const startIdx = ORDER.indexOf(level);
    for (let i = startIdx + 1; i < ORDER.length; i++) {
      const downstream = el('cf-' + ORDER[i]);
      if (downstream) downstream.innerHTML = '<option value="">Select...</option>';
    }

    const config = CASCADE[level];
    if (!config) return;

    const select = el(config.selectId);
    if (!select) return;

    // Check parent value
    let records = [];
    try {
      records = await getRecords(config.collection);
    } catch (e) {
      console.warn('[Cascade] Could not load', config.collection, e);
      return;
    }

    // Filter by parent
    if (config.parentId) {
      const parentSel = el(config.parentId);
      const parentVal = parentSel ? parentSel.value : '';
      if (!parentVal) {
        select.innerHTML = '<option value="">Select...</option>';
        return;
      }
      records = records.filter(r => {
        const fv = r[config.parentField];
        if (!fv) return false;
        return fv === parentVal || fv.id === parentVal || String(fv) === parentVal;
      });
    }

    select.innerHTML = '<option value="">Select...</option>' +
      records.map(r => {
        const label = r[config.nameField] || r.name || r.code || r.title || r.id;
        return `<option value="${r.id}">${label}</option>`;
      }).join('');
  }

  // ─── FILE HANDLER ─────────────────────────────────────────────────────────

  function handleFile(input) {
    if (input && input.files && input.files[0]) {
      state.uploadedFile = input.files[0];
      const display = el('file-name-display');
      if (display) {
        display.textContent = '✓ ' + input.files[0].name;
        display.style.display = 'block';
      }
    }
  }

  // ─── STEP 3: REVIEW ───────────────────────────────────────────────────────

  function renderReview() {
    const container = el('wizard-step-3');
    if (!container || !state.selectedType) return;

    const type = TYPES.find(t => t.id === state.selectedType);
    const user = typeof currentUser === 'function' ? currentUser() : null;
    const title = val('cf-title') || '(No title)';

    // Build field summary rows
    const fields = TYPE_FIELDS[state.selectedType] || [];
    const fieldRows = fields
      .filter(f => {
        const e = el('cf-field-' + f.name);
        return e && e.value;
      })
      .map(f => {
        const e = el('cf-field-' + f.name);
        const displayLabel = f.label.replace(' *', '');
        const displayVal = e.tagName === 'SELECT'
          ? (e.options[e.selectedIndex] ? e.options[e.selectedIndex].text : e.value)
          : e.value;
        return `<div class="review-row">
          <span class="review-key">${displayLabel}</span>
          <span class="review-val">${displayVal}</span>
        </div>`;
      })
      .join('');

    // Academic summary
    let academicHTML = '';
    if (type.academic) {
      const rows = [
        ['Course',        'cf-course'],
        ['Curriculum',    'cf-curriculum'],
        ['Semester',      'cf-semester'],
        ['Subject',       'cf-subject'],
        ['Unit / Chapter','cf-unit']
      ]
        .filter(([, id]) => el(id) && el(id).value)
        .map(([label, id]) => `<div class="review-row">
          <span class="review-key">${label}</span>
          <span class="review-val">${optionText(id)}</span>
        </div>`)
        .join('');

      if (rows) {
        academicHTML = `<div class="review-section">
          <div class="review-section-title">Academic Classification</div>
          ${rows}
        </div>`;
      }
    }

    const description = val('cf-description');
    const link = val('cf-link');
    const tags = val('cf-tags');
    const userName = user ? user.name : 'You';
    const userRole = user ? (user.role || 'Member') : '';

    container.innerHTML = `
      <div class="review-header">
        <h2>Review Your Contribution</h2>
        <p>Please check everything before submitting.</p>
      </div>

      <div class="review-card">
        <div class="review-type-badge">${type.icon} ${type.label}</div>
        <div class="review-title">${title}</div>

        ${academicHTML}

        ${fieldRows ? `<div class="review-section">
          <div class="review-section-title">Details</div>
          ${fieldRows}
        </div>` : ''}

        ${description ? `<div class="review-section">
          <div class="review-section-title">Description</div>
          <p style="font-size:0.9rem;line-height:1.6">${description}</p>
        </div>` : ''}

        ${link ? `<div class="review-section">
          <div class="review-section-title">External Link</div>
          <a href="${link}" target="_blank" rel="noopener" style="color:var(--primary);word-break:break-all">${link}</a>
        </div>` : ''}

        ${tags ? `<div class="review-section">
          <div class="review-section-title">Tags</div>
          <div class="review-tags">
            ${tags.split(',').map(t => t.trim()).filter(Boolean)
              .map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
        </div>` : ''}

        ${state.uploadedFile ? `<div class="review-section">
          <div class="review-section-title">File Attached</div>
          <span>📎 ${state.uploadedFile.name}</span>
        </div>` : ''}

        <div class="review-credit">
          <div>👤 Credited to <strong>${userName}</strong>${userRole ? ` · ${userRole}` : ''}</div>
          <div class="review-note">⏳ This submission will be reviewed by our team before publishing on Pharmora.</div>
        </div>
      </div>

      <button class="btn btn-primary btn-submit" id="wizard-submit-final"
        onclick="PharmoraContribute.submit()">
        🚀 Submit Contribution
      </button>
    `;
  }

  // ─── NAVIGATION ───────────────────────────────────────────────────────────

  async function next() {

    if (state.step === 1) {
      if (!state.selectedType) {
        showToast('Please select a contribution type first', 'error');
        return;
      }
      await renderSmartForm();
      setStep(2);

    } else if (state.step === 2) {

      // Validate title
      const titleEl = el('cf-title');
      if (!titleEl || !titleEl.value.trim()) {
        showToast('Please enter a title', 'error');
        if (titleEl) titleEl.focus();
        return;
      }

      // Validate required type-specific fields
      const fields = TYPE_FIELDS[state.selectedType] || [];
      for (const f of fields) {
        if (f.required) {
          const input = el('cf-field-' + f.name);
          if (input && !input.value.trim()) {
            const label = f.label.replace(' *', '');
            showToast(`"${label}" is required`, 'error');
            input.focus();
            return;
          }
        }
      }

      renderReview();
      setStep(3);
    }
  }

  function back() {
    if (state.step === 2) setStep(1);
    else if (state.step === 3) setStep(2);
  }

  // ─── SUBMIT ───────────────────────────────────────────────────────────────

  async function submit() {
    const submitBtn = el('wizard-submit-final');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = '⏳ Submitting...';
    }

    try {
      const user = typeof currentUser === 'function' ? currentUser() : null;
      if (!user) {
        showToast('Please login to submit', 'error');
        location.href = '/auth/login.html';
        return;
      }

      // Get permissions — determine auto-approve
      const permissions = typeof userPermissions === 'function'
        ? await userPermissions().catch(() => [])
        : (user.permissions || []);

      const roles = [user.role, user.type, user.accountType, user.position]
        .map(x => String(x || '').toLowerCase());

      const isOwner = roles.includes('owner') || roles.includes('admin') || roles.includes('superadmin');
      const autoApprove = isOwner
        || permissions.includes('*')
        || permissions.includes('content.autoapprove')
        || permissions.includes('verified.creator');

      // Upload file if attached
      let uploaded = null;
      if (state.uploadedFile && typeof uploadFile === 'function') {
        try {
          uploaded = await uploadFile(state.uploadedFile, state.selectedType + '/');
        } catch (e) {
          console.warn('[Contribute] File upload failed:', e);
          showToast('File upload failed — saving without file', 'warning');
        }
      }

      // Collect all type-specific field values
      const fields = TYPE_FIELDS[state.selectedType] || [];
      const fieldData = {};
      fields.forEach(f => {
        const input = el('cf-field-' + f.name);
        if (input) fieldData[f.name] = input.value;
      });

      const type = TYPES.find(t => t.id === state.selectedType);
      const title = val('cf-title');
      const description = val('cf-description');
      const link = val('cf-link');
      const tags = val('cf-tags')
        .split(',').map(t => t.trim()).filter(Boolean);

      // Academic classification (for academic types)
      const academicData = {};
      if (type && type.academic) {
        academicData.course = val('cf-course');
        academicData.curriculum = val('cf-curriculum');
        academicData.semester = val('cf-semester');
        academicData.subject = val('cf-subject');
        academicData.unit = val('cf-unit');
      }

      const contribution = {
        title,
        description,
        link,
        tags,
        ...academicData,
        ...fieldData,
        content: {
          file: uploaded,
          link
        },
        author: {
          id: user.id,
          name: user.name,
          role: user.role || 'member'
        },
        moderation: {
          status: autoApprove ? 'approved' : 'pending'
        },
        lifecycle: {
          status: autoApprove ? 'published' : 'draft'
        },
        review: { comments: [] },
        stats: { views: 0, downloads: 0, likes: 0 },
        createdAt: new Date().toISOString()
      };

      await createRecord(state.selectedType, contribution);

      if (typeof trackEvent === 'function') {
        trackEvent('contribution_submitted', state.selectedType);
      }

      const message = autoApprove
        ? '✅ Published successfully!'
        : '✅ Submitted for review! You\'ll be notified when it\'s approved.';

      showToast(message, 'success');
      resetWizard();

    } catch (err) {
      console.error('[Contribute] Submit error:', err);
      showToast('Submission failed. Please try again.', 'error');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = '🚀 Submit Contribution';
      }
    }
  }

  // ─── RESET ────────────────────────────────────────────────────────────────

  function resetWizard() {
    state = { step: 1, selectedType: null, uploadedFile: null };
    renderTypePicker();
    setStep(1);
    const nextBtn = el('wizard-next');
    if (nextBtn) {
      nextBtn.disabled = true;
      nextBtn.textContent = 'Continue →';
    }
  }

  // ─── INIT ─────────────────────────────────────────────────────────────────

  function init() {
    const user = typeof currentUser === 'function' ? currentUser() : null;
    const authGate = el('auth-gate');
    const wizardSection = el('wizard-section');

    if (!user) {
      // Show login prompt, hide wizard
      if (authGate) authGate.style.display = '';
      if (wizardSection) wizardSection.style.display = 'none';
      return;
    }

    // Any logged-in user → show wizard directly (submissions go to moderation)
    if (authGate) authGate.style.display = 'none';
    if (wizardSection) wizardSection.style.display = '';

    renderTypePicker();
    setStep(1);

    // Disable Continue until a type is selected
    const nextBtn = el('wizard-next');
    if (nextBtn) nextBtn.disabled = true;
  }

  // ─── PUBLIC API ───────────────────────────────────────────────────────────

  return { init, selectType, loadCascade, handleFile, next, back, submit };

})();
