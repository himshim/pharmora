/*
  Pharmora Subject Entity Registration and Logic
  v2.0.0
*/
(function() {
  const schemaPath = "/config/entities/subject.json";

  // Register with default schema structure
  const defaultSubjectSchema = {
    required: [],
    properties: {
      content: {
        required: ["code", "title", "shortName", "semester", "course", "credits", "description", "objectives", "outcomes"],
        properties: {
          code: { type: "string" },
          title: { type: "string" },
          shortName: { type: "string" },
          semester: { type: "string" },
          course: { type: "string" },
          credits: { type: "number" },
          description: { type: "string" },
          objectives: { type: "array", items: { type: "string" } },
          outcomes: { type: "array", items: { type: "string" } }
        }
      }
    }
  };

  // Register in the registry immediately
  if (typeof PharmoraEntityRegistry !== "undefined") {
    PharmoraEntityRegistry.registerType("Subject", { label: "Subject Entity" });
    PharmoraEntityRegistry.registerSchema("Subject", defaultSubjectSchema);
  }

  // Load from server asynchronously
  if (typeof fetch === "function") {
    fetch(schemaPath)
      .then(resp => {
        if (resp.ok) return resp.json();
      })
      .then(loadedSchema => {
        if (loadedSchema && typeof PharmoraEntityRegistry !== "undefined") {
          PharmoraEntityRegistry.registerSchema("Subject", loadedSchema);
          PharmoraSubjectService.schema = loadedSchema;
        }
      })
      .catch(e => console.warn("Could not fetch subject schema, using fallback", e));
  }

  // Helper APIs for CRUD and Relationship validation
  async function createSubject(data, actor) {
    if (data.type !== "Subject") data.type = "Subject";
    return await PharmoraEntityAPI.createEntity(data, actor);
  }

  async function updateSubject(uuid, updates, actor) {
    return await PharmoraEntityAPI.updateEntity(uuid, updates, actor);
  }

  async function deleteSubject(uuid, actor) {
    return await PharmoraEntityAPI.deleteEntity(uuid, actor);
  }

  async function getSubject(uuid) {
    const entity = await PharmoraEntityAPI.getEntity(uuid);
    if (entity && entity.type === "Subject") return entity;
    return null;
  }

  async function listSubjects(filters = {}) {
    filters.type = "Subject";
    return await PharmoraEntityAPI.listEntities(filters);
  }

  async function searchSubjects(query) {
    const list = await listSubjects();
    if (!query) return list;
    const lowerQuery = query.toLowerCase();
    return list.filter(sub => {
      const title = sub.content?.title || "";
      const code = sub.content?.code || "";
      const desc = sub.content?.description || "";
      return title.toLowerCase().includes(lowerQuery) ||
             code.toLowerCase().includes(lowerQuery) ||
             desc.toLowerCase().includes(lowerQuery);
    });
  }

  window.PharmoraSubjectService = {
    createSubject,
    updateSubject,
    deleteSubject,
    getSubject,
    listSubjects,
    searchSubjects,
    schema: defaultSubjectSchema
  };
})();
