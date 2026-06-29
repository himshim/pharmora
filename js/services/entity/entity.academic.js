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
    "Resource",
    "Regulation",
    "Exam",
    "Job",
    "Drug",
    "Event",
    "Certification",
    "Research"
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
          required: ["name", "code", "type", "durationYears", "termType"],
          properties: {
            name: { type: "string" },
            code: { type: "string" },
            type: { type: "string" },
            durationYears: { type: "number" },
            termType: { type: "string", enum: ["semester", "year"] },
            regulationTag: { type: "string" }
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
    },
    "Regulation": {
      required: [],
      properties: {
        content: {
          required: ["name", "code", "year", "authority"],
          properties: {
            name: { type: "string" },
            code: { type: "string" },
            year: { type: "number" },
            authority: { type: "string" }
          }
        }
      }
    },
    "Exam": {
      required: [],
      properties: {
        content: {
          required: ["title", "code", "description"],
          properties: {
            title: { type: "string" },
            code: { type: "string" },
            description: { type: "string" }
          }
        }
      }
    },
    "Job": {
      required: [],
      properties: {
        content: {
          required: ["title", "company", "location", "description"],
          properties: {
            title: { type: "string" },
            company: { type: "string" },
            location: { type: "string" },
            description: { type: "string" }
          }
        }
      }
    },
    "Drug": {
      required: [],
      properties: {
        content: {
          required: ["name", "indications", "dosage"],
          properties: {
            name: { type: "string" },
            indications: { type: "string" },
            dosage: { type: "string" }
          }
        }
      }
    },
    "Event": {
      required: [],
      properties: {
        content: {
          required: ["title", "date", "speaker"],
          properties: {
            title: { type: "string" },
            date: { type: "string" },
            speaker: { type: "string" }
          }
        }
      }
    },
    "Certification": {
      required: [],
      properties: {
        content: {
          required: ["title", "provider", "duration"],
          properties: {
            title: { type: "string" },
            provider: { type: "string" },
            duration: { type: "string" }
          }
        }
      }
    },
    "Research": {
      required: [],
      properties: {
        content: {
          required: ["title", "investigator", "abstract"],
          properties: {
            title: { type: "string" },
            investigator: { type: "string" },
            abstract: { type: "string" }
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
    },
    "Regulation": {
      titleField: "content.name",
      subtitleField: "content.code",
      badgeField: "content.authority",
      metadataFields: [{ label: "Year", value: "content.year" }]
    },
    "Exam": {
      titleField: "content.title",
      subtitleField: "content.code",
      descriptionField: "content.description"
    },
    "Job": {
      titleField: "content.title",
      subtitleField: "content.company",
      badgeField: "content.location",
      descriptionField: "content.description"
    },
    "Drug": {
      titleField: "content.name",
      subtitleField: "content.dosage",
      descriptionField: "content.indications"
    },
    "Event": {
      titleField: "content.title",
      subtitleField: "content.date",
      badgeField: "content.speaker"
    },
    "Certification": {
      titleField: "content.title",
      subtitleField: "content.provider",
      badgeField: "content.duration"
    },
    "Research": {
      titleField: "content.title",
      subtitleField: "content.investigator",
      descriptionField: "content.abstract"
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
