/*
  Pharmora Academic Entity Model Setup
  v2.0.0
*/
(function() {
  const academicEntityTypes = [
    "University",
    "Program",
    "Course",
    "Semester",
    "Unit",
    "Topic",
    "Practical",
    "QuestionBank",
    "MCQ",
    "Resource"
  ];

  const defaultSchemas = {
    "University": {
      required: [],
      properties: {
        content: {
          required: ["name", "code", "location", "description"],
          properties: {
            name: { type: "string" },
            code: { type: "string" },
            location: { type: "string" },
            description: { type: "string" }
          }
        }
      }
    },
    "Program": {
      required: [],
      properties: {
        content: {
          required: ["name", "code", "department", "duration"],
          properties: {
            name: { type: "string" },
            code: { type: "string" },
            department: { type: "string" },
            duration: { type: "string" }
          }
        }
      }
    },
    "Course": {
      required: [],
      properties: {
        content: {
          required: ["name", "code", "type", "durationYears"],
          properties: {
            name: { type: "string" },
            code: { type: "string" },
            type: { type: "string" },
            durationYears: { type: "number" }
          }
        }
      }
    },
    "Semester": {
      required: [],
      properties: {
        content: {
          required: ["number", "code"],
          properties: {
            number: { type: "number" },
            code: { type: "string" }
          }
        }
      }
    },
    "Unit": {
      required: [],
      properties: {
        content: {
          required: ["number", "title", "description"],
          properties: {
            number: { type: "number" },
            title: { type: "string" },
            description: { type: "string" }
          }
        }
      }
    },
    "Topic": {
      required: [],
      properties: {
        content: {
          required: ["title", "description"],
          properties: {
            title: { type: "string" },
            description: { type: "string" }
          }
        }
      }
    },
    "Practical": {
      required: [],
      properties: {
        content: {
          required: ["title", "aim", "principle", "procedure"],
          properties: {
            title: { type: "string" },
            aim: { type: "string" },
            principle: { type: "string" },
            procedure: { type: "string" }
          }
        }
      }
    },
    "QuestionBank": {
      required: [],
      properties: {
        content: {
          required: ["title", "year", "exam"],
          properties: {
            title: { type: "string" },
            year: { type: "number" },
            exam: { type: "string" }
          }
        }
      }
    },
    "MCQ": {
      required: [],
      properties: {
        content: {
          required: ["question", "options", "answer"],
          properties: {
            question: { type: "string" },
            options: { type: "array", items: { type: "string" } },
            answer: { type: "string" }
          }
        }
      }
    },
    "Resource": {
      required: [],
      properties: {
        content: {
          required: ["title", "type", "url"],
          properties: {
            title: { type: "string" },
            type: { type: "string" },
            url: { type: "string" }
          }
        }
      }
    }
  };

  const renderConfigs = {
    "University": {
      titleField: "content.name",
      subtitleField: "content.location",
      badgeField: "content.code",
      descriptionField: "content.description"
    },
    "Program": {
      titleField: "content.name",
      subtitleField: "content.department",
      badgeField: "content.code",
      descriptionField: "content.duration"
    },
    "Course": {
      titleField: "content.name",
      subtitleField: "content.type",
      badgeField: "content.code",
      metadataFields: [{ label: "Duration (Years)", value: "content.durationYears" }]
    },
    "Semester": {
      titleField: "content.code",
      subtitleField: (ent) => `Semester ${ent.content?.number || ""}`,
      badgeField: "content.code"
    },
    "Unit": {
      titleField: "content.title",
      subtitleField: (ent) => `Unit ${ent.content?.number || ""}`,
      descriptionField: "content.description"
    },
    "Topic": {
      titleField: "content.title",
      descriptionField: "content.description"
    },
    "Practical": {
      titleField: "content.title",
      descriptionField: "content.aim",
      sections: [
        { label: "Principle", value: "content.principle" },
        { label: "Procedure", value: "content.procedure" }
      ]
    },
    "QuestionBank": {
      titleField: "content.title",
      subtitleField: "content.exam",
      metadataFields: [{ label: "Year", value: "content.year" }]
    },
    "MCQ": {
      titleField: "content.question",
      sections: [
        { label: "Options", value: "content.options" },
        { label: "Correct Answer", value: "content.answer" }
      ]
    },
    "Resource": {
      titleField: "content.title",
      subtitleField: "content.type",
      metadataFields: [{ label: "URL", value: "content.url" }]
    }
  };

  // Register each entity types, schemas, and configurations
  academicEntityTypes.forEach(type => {
    if (typeof PharmoraEntityRegistry !== "undefined") {
      PharmoraEntityRegistry.registerType(type);
      PharmoraEntityRegistry.registerSchema(type, defaultSchemas[type]);
    }
    if (typeof PharmoraUniversalRenderer !== "undefined") {
      PharmoraUniversalRenderer.registerTypeConfig(type, renderConfigs[type]);
    }
  });

  console.log("Academic Entity System modules successfully registered inside UES.");
})();
