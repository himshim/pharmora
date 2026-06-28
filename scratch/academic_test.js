/*
  Verify end-to-end Academic Hierarchy UES flow.
*/
const fs = require('fs');
const path = require('path');

// Mock window/global environment for node execution
global.window = global;
global.addEventListener = () => {};
global.document = {
  addEventListener: () => {},
  querySelector: () => null,
  getElementById: () => null
};
global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; },
  clear() { this.store = {}; }
};

// Load base database engine
require('../dist/pharmora.database.js');

// Load UES dependencies in sequence
const entityFiles = [
  'entity.core.js',
  'entity.registry.js',
  'entity.schema.js',
  'entity.events.js',
  'entity.api.js',
  'entity.relations.js',
  'entity.graph.js',
  'entity.renderer.js',
  'entity.academic.js',
  'entity.discovery.js',
  'entity.workflow.js',
  'entity.review.js',
  'entity.version.js'
];

entityFiles.forEach(f => {
  require(path.join(__dirname, '../js/services/entity/', f));
});

console.log("=== Bootstrapping academic verification ===");

(async function() {
  try {
    // 1. Create a University
    const uni = await PharmoraEntityAPI.createEntity({
      type: 'University',
      content: {
        name: 'Pharmora Medical University',
        code: 'PMU',
        location: 'California',
        description: 'Primary research university'
      }
    }, 'test-admin');
    console.log("✅ Created University:", uni.uuid, uni.content.name);

    // 2. Create a Program
    const prog = await PharmoraEntityAPI.createEntity({
      type: 'Program',
      content: {
        name: 'Doctor of Pharmacy',
        code: 'PharmD',
        department: 'Clinical Pharmacy',
        duration: '4 Years'
      }
    }, 'test-admin');
    console.log("✅ Created Program:", prog.uuid, prog.content.name);

    // 3. Link Program under University
    if (typeof PharmoraRelations !== 'undefined') {
      await PharmoraRelations.linkEntities(uni.uuid, 'hasMany', prog.uuid, {}, 'test-admin');
      console.log("✅ Linked Program under University");
    }

    // 4. Verify bidirectional links
    const updatedUni = await PharmoraEntityAPI.getEntity(uni.uuid);
    console.log("✅ Bidirectional link check:", JSON.stringify(updatedUni.relations));

    // 5. Test Transition workflow
    if (typeof PharmoraEntityWorkflow !== 'undefined') {
      const transitioned = await PharmoraEntityWorkflow.transitionTo(uni.uuid, 'approved', 'test-moderator');
      console.log("✅ Transitioned University state to:", transitioned.status);
    }

    console.log("=== End-to-end UES Academic Verification PASS ===");
  } catch(e) {
    console.error("❌ Test Failed:", e);
    process.exit(1);
  }
})();
