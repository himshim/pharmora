/**
 * Pharmora Profile Setup Wizard
 * Step-by-step profile generation module built on Wizard Core.
 */
const PharmoraProfileWizard = (function () {
  'use strict';

  let currentProfileData = null;

  function initWizard(profileData) {
    currentProfileData = profileData;

    const steps = [
      {
        id: 'identity',
        label: 'Identity',
        validate: async (data) => {
          if (!data.displayName || !data.displayName.trim()) return 'Display name is required.';
          if (!data.username || !data.username.trim()) return 'Username is required.';
          return null;
        },
        render: (data) => `
          <h3>Step 1: Identity Details</h3>
          <div class="form-group">
            <label class="form-label">Display Name *</label>
            <input class="form-input" type="text" id="wz-displayName" value="${data.displayName || ''}" oninput="PharmoraProfileWizard.updateField('displayName', this.value)">
          </div>
          <div class="form-group">
            <label class="form-label">Username *</label>
            <input class="form-input" type="text" id="wz-username" value="${data.username || ''}" oninput="PharmoraProfileWizard.updateField('username', this.value)">
          </div>
          <div class="form-group">
            <label class="form-label">Avatar URL</label>
            <input class="form-input" type="text" id="wz-avatar" value="${data.avatar?.url || ''}" oninput="PharmoraProfileWizard.updateAvatar(this.value)">
          </div>
          <div class="form-group">
            <label class="form-label">Headline</label>
            <input class="form-input" type="text" id="wz-headline" value="${data.headline || ''}" oninput="PharmoraProfileWizard.updateField('headline', this.value)">
          </div>
          <div class="form-group">
            <label class="form-label">Bio</label>
            <textarea class="form-input" id="wz-bio" oninput="PharmoraProfileWizard.updateField('bio', this.value)">${data.bio || ''}</textarea>
          </div>
        `
      },
      {
        id: 'category',
        label: 'Role & Classification',
        validate: async () => null,
        render: (data) => {
          const type = data.types?.[0] || 'student';
          return `
            <h3>Step 2: Profile Classification</h3>
            <div class="form-group">
              <label class="form-label">Profile Category</label>
              <select class="form-input" id="wz-type" onchange="PharmoraProfileWizard.changeType(this.value)">
                <option value="student" ${type === 'student' ? 'selected' : ''}>Student</option>
                <option value="educator" ${type === 'educator' ? 'selected' : ''}>Educator</option>
                <option value="professional" ${type === 'professional' ? 'selected' : ''}>Professional</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Position / Suggestion</label>
              <select class="form-input" id="wz-position" onchange="PharmoraProfileWizard.changePosition(this.value)">
                ${getSuggestionsHTML(type, data.positions?.[0]?.title)}
              </select>
            </div>
            <div class="form-group" id="wz-customPositionBox" style="display:${data.positions?.[0]?.title === 'Other' ? 'block' : 'none'};">
              <label class="form-label">Specify Custom Position</label>
              <input class="form-input" type="text" id="wz-customPosition" value="${data.positions?.[0]?.title === 'Other' ? (data.customPosition || '') : ''}" oninput="PharmoraProfileWizard.updateCustomPosition(this.value)">
            </div>
          `;
        }
      },
      {
        id: 'academic',
        label: 'Academic Details',
        condition: (data) => data.types?.[0] === 'student',
        validate: async () => null,
        render: (data) => `
          <h3>Step 3: Education & Studies</h3>
          <div class="form-group">
            <label class="form-label">University / College</label>
            <input class="form-input" type="text" id="wz-college" value="${data.education?.[0]?.college || ''}" oninput="PharmoraProfileWizard.updateEducation('college', this.value)">
          </div>
          <div class="form-group">
            <label class="form-label">Course</label>
            <input class="form-input" type="text" id="wz-course" value="${data.education?.[0]?.course || ''}" oninput="PharmoraProfileWizard.updateEducation('course', this.value)">
          </div>
          <div class="form-group">
            <label class="form-label">Graduation Year</label>
            <input class="form-input" type="number" id="wz-gradYear" value="${data.education?.[0]?.year || ''}" oninput="PharmoraProfileWizard.updateEducation('year', this.value)">
          </div>
        `
      },
      {
        id: 'professional',
        label: 'Professional Profile',
        condition: (data) => data.types?.[0] !== 'student',
        validate: async () => null,
        render: (data) => `
          <h3>Step 3: Professional Experience</h3>
          <div class="form-group">
            <label class="form-label">Workplace / Organization</label>
            <input class="form-input" type="text" id="wz-org" value="${data.positions?.[0]?.organization || ''}" oninput="PharmoraProfileWizard.updatePositionField('organization', this.value)">
          </div>
        `
      },
      {
        id: 'specialization',
        label: 'Specialization',
        validate: async () => null,
        render: (data) => `
          <h3>Step 4: Specializations & Fields</h3>
          <div class="form-group">
            <label class="form-label">Fields of Interest (comma separated)</label>
            <input class="form-input" type="text" id="wz-specs" value="${(data.specializations || []).join(', ')}" placeholder="e.g. Pharmaceutics, Pharmacology" oninput="PharmoraProfileWizard.updateSpecs(this.value)">
          </div>
        `
      },
      {
        id: 'verification',
        label: 'Verification',
        validate: async () => null,
        render: (data) => {
          const status = data.verification?.verified ? '👑 Verified Account' : (data.verification?.status || 'Not Verified');
          return `
            <h3>Step 5: Verification Center</h3>
            <div class="card" style="padding:15px;margin-bottom:15px;">
              <p>Current Status: <strong>${status}</strong></p>
              ${data.verification?.verified ? '' : `
                <div class="form-group">
                  <label class="form-label">Registration / License Proof (Optional)</label>
                  <textarea class="form-input" placeholder="Enter Registration ID, staff URL, or reference proof" oninput="PharmoraProfileWizard.updateVerificationProof(this.value)">${data.verificationProof || ''}</textarea>
                </div>
              `}
            </div>
          `;
        }
      },
      {
        id: 'links',
        label: 'Social Links',
        validate: async () => null,
        render: (data) => `
          <h3>Step 6: Links & Contact Profiles</h3>
          <div class="form-group">
            <label class="form-label">LinkedIn URL</label>
            <input class="form-input" type="url" id="wz-linkedin" value="${data.contact?.linkedin?.value || ''}" oninput="PharmoraProfileWizard.updateContact('linkedin', this.value)">
          </div>
          <div class="form-group">
            <label class="form-label">Personal Website</label>
            <input class="form-input" type="url" id="wz-web" value="${data.contact?.website?.value || ''}" oninput="PharmoraProfileWizard.updateContact('website', this.value)">
          </div>
          <div class="form-group">
            <label><input type="checkbox" ${data.contact?.email?.visible ? 'checked' : ''} onchange="PharmoraProfileWizard.updateContactVisibility('email', this.checked)"> Show public email on profile</label>
          </div>
        `
      },
      {
        id: 'review',
        label: 'Review',
        validate: async () => null,
        render: (data) => `
          <h3>Step 7: Review & Finalize</h3>
          <p>Please double-check your profile configuration before saving.</p>
          <div class="card" style="padding:15px;line-height:1.6;">
            <div><strong>Display Name:</strong> ${data.displayName || ''}</div>
            <div><strong>Username:</strong> @${data.username || ''}</div>
            <div><strong>Profile Category:</strong> ${data.types?.[0] || 'member'}</div>
            <div><strong>Role Position:</strong> ${data.positions?.[0]?.title || 'Member'}</div>
            <div><strong>Specializations:</strong> ${(data.specializations || []).join(', ') || 'None'}</div>
          </div>
        `
      }
    ];

    PharmoraWizardCore.createWizard({
      id: 'profile',
      containerId: 'profile-wizard-root',
      steps,
      getInitialState: () => currentProfileData,
      dynamicSteps: (data, allSteps) => {
        // Dynamic filter based on role/condition
        return allSteps.filter(s => !s.condition || s.condition(data));
      },
      onComplete: async (finalData) => {
        // Connect profile fields with structured Organization/Course entities
        if (finalData.positions?.[0]?.organization) {
          const orgName = finalData.positions[0].organization;
          const matches = await getRecords('organizations', { name: orgName });
          if (!matches || matches.length === 0) {
            // suggest/create missing entity
            await createRecord('organizations', { name: orgName, type: 'institution' });
          }
        }

        // Apply changes reason if verified detail was updated
        const isVerified = finalData.verification?.verified;
        if (isVerified) {
          finalData.verification.status = 'pending';
          finalData.verification.verified = false;
        }

        await updateUserProfile(finalData);
        setTimeout(() => {
          location.href = `/profile.html?id=${finalData.userId}`;
        }, 700);
      }
    });
  }

  function getSuggestionsHTML(type, current) {
    const list = {
      student: ["D.Pharm Student", "B.Pharm Student", "Pharm.D Student", "M.Pharm Student", "PhD Scholar", "Other"],
      educator: ["Tutor", "Lecturer", "Assistant Professor", "Associate Professor", "Professor", "Head of Department", "Other"],
      professional: ["Community Pharmacist", "Hospital Pharmacist", "Clinical Pharmacist", "Production Chemist", "Other"]
    }[type] || ["Member", "Other"];

    return list.map(item => `<option value="${item}" ${current === item ? 'selected' : ''}>${item}</option>`).join('');
  }

  function updateField(key, value) {
    const inst = window.profileWizardInstance;
    if (inst) {
      inst.state.data[key] = value;
      inst.saveDraft();
    }
  }

  function updateAvatar(url) {
    const inst = window.profileWizardInstance;
    if (inst) {
      if (!inst.state.data.avatar) inst.state.data.avatar = {};
      inst.state.data.avatar.url = url;
      inst.saveDraft();
    }
  }

  function changeType(type) {
    const inst = window.profileWizardInstance;
    if (inst) {
      inst.state.data.types = [type];
      if (!inst.state.data.positions) inst.state.data.positions = [{}];
      inst.state.data.positions[0].title = type === 'student' ? 'B.Pharm Student' : 'Tutor';
      inst.saveDraft();
      // Force redraw of current step
      PharmoraWizardCore.createWizard(window.profileWizardInstance.config || {
        id: 'profile',
        containerId: 'profile-wizard-root',
        steps: inst.config?.steps || [],
        getInitialState: () => inst.state.data,
        onComplete: inst.config?.onComplete
      });
    }
  }

  function changePosition(val) {
    const inst = window.profileWizardInstance;
    if (inst) {
      if (!inst.state.data.positions) inst.state.data.positions = [{}];
      inst.state.data.positions[0].title = val;
      const customBox = document.getElementById('wz-customPositionBox');
      if (customBox) {
        customBox.style.display = val === 'Other' ? 'block' : 'none';
      }
      inst.saveDraft();
    }
  }

  function updateCustomPosition(val) {
    const inst = window.profileWizardInstance;
    if (inst) {
      inst.state.data.customPosition = val;
      if (inst.state.data.positions?.[0]) {
        inst.state.data.positions[0].title = val;
      }
      inst.saveDraft();
    }
  }

  function updateEducation(key, val) {
    const inst = window.profileWizardInstance;
    if (inst) {
      if (!inst.state.data.education) inst.state.data.education = [{}];
      inst.state.data.education[0][key] = val;
      inst.saveDraft();
    }
  }

  function updatePositionField(key, val) {
    const inst = window.profileWizardInstance;
    if (inst) {
      if (!inst.state.data.positions) inst.state.data.positions = [{}];
      inst.state.data.positions[0][key] = val;
      inst.saveDraft();
    }
  }

  function updateSpecs(val) {
    const inst = window.profileWizardInstance;
    if (inst) {
      inst.state.data.specializations = val.split(',').map(x => x.trim()).filter(Boolean);
      inst.saveDraft();
    }
  }

  function updateVerificationProof(val) {
    const inst = window.profileWizardInstance;
    if (inst) {
      inst.state.data.verificationProof = val;
      inst.saveDraft();
    }
  }

  function updateContact(key, val) {
    const inst = window.profileWizardInstance;
    if (inst) {
      if (!inst.state.data.contact) inst.state.data.contact = {};
      if (!inst.state.data.contact[key]) inst.state.data.contact[key] = {};
      inst.state.data.contact[key].value = val;
      inst.saveDraft();
    }
  }

  function updateContactVisibility(key, checked) {
    const inst = window.profileWizardInstance;
    if (inst) {
      if (!inst.state.data.contact) inst.state.data.contact = {};
      if (!inst.state.data.contact[key]) inst.state.data.contact[key] = {};
      inst.state.data.contact[key].visible = checked;
      inst.saveDraft();
    }
  }

  return {
    initWizard,
    updateField,
    updateAvatar,
    changeType,
    changePosition,
    updateCustomPosition,
    updateEducation,
    updatePositionField,
    updateSpecs,
    updateVerificationProof,
    updateContact,
    updateContactVisibility
  };
})();

window.PharmoraProfileWizard = PharmoraProfileWizard;
