/*
 Pharmora Field Registry v2
 --------------------------
 Global field definitions and content schemas.
 This file defines all canonical fields (PharmoraFields) and content schemas,
 using window.PharmoraSchema.register() for each type.

 **Global Fields**:
  - title, description, tags, file, link, author, moderation (common to all types)
  - subject, course, unit, drug, instrument, organization (common references)

 **Fallback**: fieldConfig() returns a default config if key is missing.
 **Helpers**:
  - build(keys)               - field entries for an array of global field keys
  - buildField(key, overrides) - a single global field, with per-schema overrides
    (e.g. a different group/help/placeholder) without duplicating the whole
    field object. Prefer this over copy-pasting a field definition.

 Schemas remove common fields; each type schema only lists its type-specific fields.

 **Schema Engine v2 note**: any field object (in PharmoraFields or inline in a
 schema's `fields` array) can also use the following optional properties,
 understood by schema.engine.js. None of this requires changes here — it's
 just plain JS object properties available the next time a field is defined
 or edited:
   default       - pre-filled value when no existing value is supplied
   min / max     - numeric bounds (type:"number") or string length otherwise
   pattern       - RegExp or regex string the value must match
   email         - true to validate as an email address (or use type:"email")
   url           - true to validate as a URL (or use type:"url")
   validate      - (value, data) => true | false | "custom error message"
   visibleIf     - (data) => boolean, hide/show this field based on the rest of the form
   requiredIf    - (data) => boolean, dynamically require this field
   disabledIf    - (data) => boolean, dynamically disable this field
   description   - short helper text rendered above the input
   help          - short hint text rendered below the input
   placeholder   - input placeholder text
   group/section - groups consecutive fields under a labeled fieldset
*/


// Global field definitions (universal fields)
window.PharmoraFields = {
  title: {
    label: "Title",
    type: "text",
    required: true
  },
  description: {
    label: "Description",
    type: "textarea"
  },
  tags: {
    label: "Tags",
    type: "chips",
    allowCustom: true
  },
  file: {
    label: "Attachment",
    type: "file"
  },
  link: {
    label: "Link",
    type: "url"
  },
  author: {
    label: "Author",
    type: "text"
  },
  moderation: {
    label: "Moderation Notes",
    type: "textarea"
  },
  // Common reference fields
  subject: {
    label: "Subject",
    type: "reference",
    collection: "subjects"
  },
  course: {
    label: "Course",
    type: "reference",
    collection: "courses"
  },
  unit: {
    label: "Unit",
    type: "reference",
    collection: "units"
  },
  drug: {
    label: "Drug",
    type: "reference",
    collection: "drugs",
    allowSuggest: true
  },
  instrument: {
    label: "Instrument",
    type: "reference",
    collection: "instruments",
    allowSuggest: true
  },
  organization: {
    label: "Organization",
    type: "reference",
    collection: "organizations",
    allowSuggest: true
  }
};

// Fallback for unknown fields
window.fieldConfig = function(key) {
  return (
    window.PharmoraFields[key] ||
    { key: key, label: key, type: "text", allowCustom: true }
  );
};

// Helper: reuse a single global field, optionally overriding/adding
// properties (e.g. group, help, placeholder) for this schema only —
// without duplicating the whole field definition.
function buildField(key, overrides) {
  return Object.assign({ key: key }, window.fieldConfig(key), overrides || {});
}

// Helper: build schema fields list from an array of keys
function build(keys) {
  return keys.map(k => buildField(k));
}

// Queue for schemas if PharmoraSchema is not loaded
window._pendingSchemas = window._pendingSchemas || [];

// Helper to register or queue schemas
function defineSchema(type, schema) {
  if (window.PharmoraSchema && typeof window.PharmoraSchema.register === "function") {
    window.PharmoraSchema.register(type, schema);
  } else {
    window._pendingSchemas.push({ type, schema });
  }
}

/* =====================
   CONTENT SCHEMAS (type-specific fields only)
   Common fields (title, description, etc.) are omitted here.
===================== */

defineSchema("research", {
  version: 1,
  fields: [
    ...build(["subject", "drug", "instrument", "organization"]),
    { key: "references", label: "References", type: "textarea" },
    { key: "doi", label: "DOI", type: "text", placeholder: "Digital Object Identifier" }
  ]
});

defineSchema("drugs", {
  version: 1,
  fields: [
    {
      key: "drugClass",
      label: "Drug Class",
      type: "reference",
      collection: "drugClasses",
      required: true
    },
    { key: "mechanism", label: "Mechanism of Action", type: "textarea" },
    { key: "uses", label: "Uses", type: "textarea" },
    { key: "adverseEffects", label: "Adverse Effects", type: "textarea" }
  ]
});

defineSchema("documents", {
  version: 1,
  fields: [
    { key: "organization", label: "Organization", type: "reference", collection: "organizations" },
    { key: "revision", label: "Revision", type: "text" },
    { key: "fileLink", label: "Document Link", type: "url" }
  ]
});

defineSchema("jobs", {
  version: 1,
  fields: [
    { key: "organization", label: "Company/Organization", type: "reference", collection: "organizations" },
    { key: "qualification", label: "Qualification", type: "text" },
    { key: "experience", label: "Experience (years)", type: "number" },
    { key: "applyLink", label: "Apply Link", type: "url" }
  ]
});

defineSchema("practicals", {
  version: 1,
  fields: [
    ...build(["subject"]),
    { key: "aim", label: "Aim", type: "textarea", required: true },
    { key: "procedure", label: "Procedure", type: "textarea" },
    { key: "result", label: "Result", type: "textarea" }
  ]
});

defineSchema("questions", {
  version: 1,
  fields: [
    ...build(["subject"]),
    { key: "question", label: "Question Text", type: "textarea", required: true },
    { key: "answer", label: "Answer", type: "text" },
    { key: "explanation", label: "Explanation (optional)", type: "textarea" }
  ]
});

defineSchema("tests", {
  version: 1,
  fields: [
    ...build(["subject"]),
    { key: "totalQuestions", label: "Total Questions", type: "number" },
    { key: "duration", label: "Duration (minutes)", type: "number" }
  ]
});

defineSchema("resources", {
  version: 1,
  fields: [
    ...build(["subject", "unit"])
  ]
});

defineSchema("books", {
  version: 1,
  fields: [
    { key: "publisher", label: "Publisher", type: "text" },
    { key: "isbn", label: "ISBN", type: "text" },
    { key: "year", label: "Year", type: "number" }
  ]
});

defineSchema("industry", {
  version: 1,
  fields: [
    { key: "sector", label: "Industry Sector", type: "text" },
    { key: "organization", label: "Company", type: "reference", collection: "organizations" }
  ]
});

defineSchema("roadmaps", {
  version: 1,
  fields: [
    { key: "course", label: "Course", type: "reference", collection: "courses" },
    { key: "semester", label: "Semester", type: "text" }
  ]
});

defineSchema("certifications", {
  version: 1,
  fields: [
    { key: "organization", label: "Issuing Organization", type: "reference", collection: "organizations" },
    { key: "validity", label: "Validity Period", type: "text" }
  ]
});

defineSchema("news", {
  version: 1,
  fields: [
    { key: "source", label: "News Source", type: "text" },
    { key: "date", label: "Date", type: "date" }
  ]
});

defineSchema("events", {
  version: 1,
  fields: [
    { key: "date", label: "Event Date", type: "date" },
    { key: "location", label: "Location", type: "text" },
    { key: "organization", label: "Organizer", type: "reference", collection: "organizations" }
  ]
});

// Register any queued schemas once the schema engine is ready
document.addEventListener("pharmora-ready", function() {
  if (window._pendingSchemas) {
    window._pendingSchemas.forEach(item => {
      window.PharmoraSchema.register(item.type, item.schema);
    });
    window._pendingSchemas = [];
  }
});

console.log("✓ Field Registry Loaded");

// Example: Define a new content schema below using defineSchema()
// defineSchema("myType", { version: 1, fields: build(["field1","field2"]) });

// Example: reuse a global field but add schema-only metadata via buildField()
// defineSchema("myType", {
//   version: 1,
//   fields: [
//     buildField("organization", { group: "Reference Info", help: "Pick the manufacturer" }),
//     { key: "field1", label: "Field 1", type: "text", placeholder: "e.g. value" }
//   ]
// });