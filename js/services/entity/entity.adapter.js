/*
  Pharmora Universal Entity Adapter Layer
  v2.0.0
*/
(function() {
  const registeredAdapters = new Map();

  function registerLegacyAdapter(legacyServiceName, adapterConfig) {
    registeredAdapters.set(legacyServiceName, adapterConfig);
    
    // Inject adapter wrappers into the target service object if it exists
    if (window[legacyServiceName]) {
      const originalService = window[legacyServiceName];
      window[legacyServiceName] = {
        ...originalService,
        ...adapterConfig
      };
    } else {
      window[legacyServiceName] = adapterConfig;
    }
  }

  // Define default Subject legacy adapter mapping
  const SubjectAdapter = {
    getSubjects: async () => {
      if (typeof PharmoraSubjectService !== "undefined") {
        const entities = await PharmoraSubjectService.listSubjects();
        return entities.map(ent => ({
          ...ent.content,
          id: ent.uuid,
          uuid: ent.uuid
        }));
      }
      return [];
    },
    renderSubjects: async (containerId) => {
      if (typeof PharmoraSubjectService !== "undefined" && typeof PharmoraUniversalRenderer !== "undefined") {
        const entities = await PharmoraSubjectService.listSubjects();
        const root = document.getElementById(containerId);
        if (root) {
          root.innerHTML = PharmoraUniversalRenderer.render(entities, "list", PharmoraSubjectRenderer.config);
        }
      }
    }
  };

  // Define default Books legacy adapter mapping
  const BooksAdapter = {
    getBooks: async () => {
      if (typeof PharmoraEntityAPI !== "undefined") {
        const entities = await PharmoraEntityAPI.listEntities({ type: "Book" });
        return entities.map(ent => ({
          ...ent.content,
          id: ent.uuid,
          uuid: ent.uuid
        }));
      }
      return [];
    },
    renderBooks: async (containerId) => {
      if (typeof PharmoraEntityAPI !== "undefined" && typeof PharmoraUniversalRenderer !== "undefined") {
        const entities = await PharmoraEntityAPI.listEntities({ type: "Book" });
        const root = document.getElementById(containerId);
        if (root) {
          root.innerHTML = PharmoraUniversalRenderer.render(entities, "list");
        }
      }
    }
  };

  // Auto register default adapters on script load
  registerLegacyAdapter("PharmoraSubjects", SubjectAdapter);
  registerLegacyAdapter("PharmoraBooks", BooksAdapter);

  window.PharmoraEntityAdapter = {
    registerLegacyAdapter,
    getRegisteredAdapters: () => Array.from(registeredAdapters.keys())
  };
})();
