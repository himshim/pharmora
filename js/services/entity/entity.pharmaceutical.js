/*
  Pharmora Pharmaceutical Knowledge Layer Registration
  v2.0.0
*/
(function() {
  const pharmaEntityTypes = [
    "Drug",
    "Brand",
    "Manufacturer",
    "Disease",
    "Mechanism",
    "TherapeuticClass",
    "PharmacologicalClass",
    "DosageForm",
    "Excipient",
    "AdverseEffect",
    "Interaction",
    "Contraindication"
  ];

  const defaultSchemas = {
    "Drug": {
      required: [],
      properties: {
        content: {
          required: ["genericName", "chemicalClass", "description"],
          properties: {
            genericName: { type: "string" },
            chemicalClass: { type: "string" },
            description: { type: "string" }
          }
        }
      }
    },
    "Brand": {
      required: [],
      properties: {
        content: {
          required: ["brandName", "strength", "price"],
          properties: {
            brandName: { type: "string" },
            strength: { type: "string" },
            price: { type: "number" }
          }
        }
      }
    },
    "Manufacturer": {
      required: [],
      properties: {
        content: {
          required: ["name", "country", "licenseNumber"],
          properties: {
            name: { type: "string" },
            country: { type: "string" },
            licenseNumber: { type: "string" }
          }
        }
      }
    },
    "Disease": {
      required: [],
      properties: {
        content: {
          required: ["name", "icd10Code", "symptoms"],
          properties: {
            name: { type: "string" },
            icd10Code: { type: "string" },
            symptoms: { type: "array", items: { type: "string" } }
          }
        }
      }
    },
    "Mechanism": {
      required: [],
      properties: {
        content: {
          required: ["description", "targetReceptor"],
          properties: {
            description: { type: "string" },
            targetReceptor: { type: "string" }
          }
        }
      }
    },
    "TherapeuticClass": {
      required: [],
      properties: {
        content: {
          required: ["className", "clinicalFocus"],
          properties: {
            className: { type: "string" },
            clinicalFocus: { type: "string" }
          }
        }
      }
    },
    "PharmacologicalClass": {
      required: [],
      properties: {
        content: {
          required: ["className", "mechanismOfAction"],
          properties: {
            className: { type: "string" },
            mechanismOfAction: { type: "string" }
          }
        }
      }
    },
    "DosageForm": {
      required: [],
      properties: {
        content: {
          required: ["formName", "routeOfAdministration"],
          properties: {
            formName: { type: "string" },
            routeOfAdministration: { type: "string" }
          }
        }
      }
    },
    "Excipient": {
      required: [],
      properties: {
        content: {
          required: ["name", "functionalCategory", "safetyLimit"],
          properties: {
            name: { type: "string" },
            functionalCategory: { type: "string" },
            safetyLimit: { type: "string" }
          }
        }
      }
    },
    "AdverseEffect": {
      required: [],
      properties: {
        content: {
          required: ["effectName", "severity", "frequency"],
          properties: {
            effectName: { type: "string" },
            severity: { type: "string", enum: ["Mild", "Moderate", "Severe", "Life-threatening"] },
            frequency: { type: "string" }
          }
        }
      }
    },
    "Interaction": {
      required: [],
      properties: {
        content: {
          required: ["severity", "description"],
          properties: {
            severity: { type: "string", enum: ["Minor", "Moderate", "Major", "Contraindicated"] },
            description: { type: "string" }
          }
        }
      }
    },
    "Contraindication": {
      required: [],
      properties: {
        content: {
          required: ["conditionType", "rationale"],
          properties: {
            conditionType: { type: "string" },
            rationale: { type: "string" }
          }
        }
      }
    }
  };

  const renderConfigs = {
    "Drug": {
      titleField: "content.genericName",
      subtitleField: "content.chemicalClass",
      descriptionField: "content.description"
    },
    "Brand": {
      titleField: "content.brandName",
      subtitleField: "content.strength",
      metadataFields: [{ label: "Price (INR)", value: "content.price" }]
    },
    "Manufacturer": {
      titleField: "content.name",
      subtitleField: "content.country",
      metadataFields: [{ label: "Licence", value: "content.licenseNumber" }]
    },
    "Disease": {
      titleField: "content.name",
      badgeField: "content.icd10Code",
      sections: [{ label: "Common Symptoms", value: "content.symptoms" }]
    },
    "Mechanism": {
      titleField: "content.targetReceptor",
      descriptionField: "content.description"
    },
    "TherapeuticClass": {
      titleField: "content.className",
      descriptionField: "content.clinicalFocus"
    },
    "PharmacologicalClass": {
      titleField: "content.className",
      descriptionField: "content.mechanismOfAction"
    },
    "DosageForm": {
      titleField: "content.formName",
      subtitleField: "content.routeOfAdministration"
    },
    "Excipient": {
      titleField: "content.name",
      subtitleField: "content.functionalCategory",
      metadataFields: [{ label: "Safety Threshold", value: "content.safetyLimit" }]
    },
    "AdverseEffect": {
      titleField: "content.effectName",
      subtitleField: "content.severity",
      metadataFields: [{ label: "Occurrence Frequency", value: "content.frequency" }]
    },
    "Interaction": {
      titleField: "content.severity",
      descriptionField: "content.description"
    },
    "Contraindication": {
      titleField: "content.conditionType",
      descriptionField: "content.rationale"
    }
  };

  // Register each entity types, schemas, and configurations
  pharmaEntityTypes.forEach(type => {
    if (typeof PharmoraEntityRegistry !== "undefined") {
      PharmoraEntityRegistry.registerType(type);
      PharmoraEntityRegistry.registerSchema(type, defaultSchemas[type]);
    }
    if (typeof PharmoraUniversalRenderer !== "undefined") {
      PharmoraUniversalRenderer.registerTypeConfig(type, renderConfigs[type]);
    }
  });

  console.log("Pharmaceutical Knowledge Layer modules successfully registered inside UES.");
})();
