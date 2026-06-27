/*
  Pharmora Subject Renderer Registry Hook - Universal Delegation
  v2.0.0
*/
(function() {
  const subjectRenderConfig = {
    titleField: "content.title",
    subtitleField: "content.course",
    extraSubtitle: (ent) => `Semester ${ent.content?.semester || ""}`,
    badgeField: "content.code",
    descriptionField: "content.description",
    metadataFields: [
      { label: "Credits", value: "content.credits" },
      { label: "Short Name", value: "content.shortName" }
    ],
    sections: [
      { label: "Course Objectives", value: "content.objectives" },
      { label: "Expected Outcomes", value: "content.outcomes" }
    ]
  };

  function renderSubject(entity, viewType = "card") {
    if (!entity || entity.type !== "Subject") return "";
    
    if (typeof PharmoraUniversalRenderer !== "undefined") {
      return PharmoraUniversalRenderer.render(entity, viewType, subjectRenderConfig);
    }
    
    // Fallback if Universal Renderer is not ready
    if (viewType === "card" && typeof PharmoraSubjectCard !== "undefined") {
      return PharmoraSubjectCard.render(entity);
    } else if (viewType === "page" && typeof PharmoraSubjectPage !== "undefined") {
      return PharmoraSubjectPage.render(entity);
    }
    return `<div>Subject: ${entity.uuid}</div>`;
  }

  // Register the configuration inside the Universal Renderer
  if (typeof PharmoraUniversalRenderer !== "undefined") {
    PharmoraUniversalRenderer.registerTypeConfig("Subject", subjectRenderConfig);
  }

  // Register the base renderer function inside the UES Entity Registry for backward compatibility
  if (typeof PharmoraEntityRegistry !== "undefined") {
    PharmoraEntityRegistry.registerRenderer("Subject", renderSubject);
  }

  window.PharmoraSubjectRenderer = {
    render: renderSubject,
    config: subjectRenderConfig
  };
})();
