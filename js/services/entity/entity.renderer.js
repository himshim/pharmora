/*
  Pharmora Universal Entity Renderer Engine
  v2.0.0
*/
(function() {
  const plugins = new Map();
  const typeRenderers = new Map();
  const typeConfigs = new Map();

  function registerPlugin(name, pluginFn) {
    plugins.set(name, pluginFn);
  }

  function registerTypeRenderer(typeName, viewType, renderFn) {
    if (!typeRenderers.has(typeName)) {
      typeRenderers.set(typeName, new Map());
    }
    typeRenderers.get(typeName).set(viewType, renderFn);
  }

  function getTypeRenderer(typeName, viewType) {
    return typeRenderers.get(typeName)?.get(viewType) || null;
  }

  function registerTypeConfig(typeName, config) {
    typeConfigs.set(typeName, config);
  }

  function getTypeConfig(typeName) {
    return typeConfigs.get(typeName) || null;
  }

  // Resolve dot notation for nested objects
  function resolveField(obj, path) {
    if (!obj || !path) return "";
    if (typeof path === "function") return path(obj);
    return path.split(".").reduce((acc, part) => acc && acc[part] !== undefined ? acc[part] : "", obj);
  }

  function getAutoConfig(entity) {
    const content = entity.content || {};
    const keys = Object.keys(content);

    const titleField = keys.find(k => ["title", "name", "label"].includes(k.toLowerCase())) || "";
    const subtitleField = keys.find(k => ["course", "category", "type", "semester"].includes(k.toLowerCase())) || "";
    const badgeField = keys.find(k => ["code", "id", "sku", "shortName"].includes(k.toLowerCase())) || "";
    const descriptionField = keys.find(k => ["description", "body", "summary", "about"].includes(k.toLowerCase())) || "";

    return {
      titleField: titleField ? `content.${titleField}` : "",
      subtitleField: subtitleField ? `content.${subtitleField}` : "",
      badgeField: badgeField ? `content.${badgeField}` : "",
      descriptionField: descriptionField ? `content.${descriptionField}` : "",
      metadataFields: []
    };
  }

  function render(entity, viewType = "card", customConfig = null) {
    if (!entity) return "<div>No entity to render</div>";

    // 1. Check for specific registered custom type renderer (which outputs fully customized HTML)
    const customRenderer = getTypeRenderer(entity.type, viewType);
    if (customRenderer) {
      return customRenderer(entity, customConfig);
    }

    // 2. Fetch config (explicit, registered type-config, or auto-discovered)
    const config = customConfig || getTypeConfig(entity.type) || getAutoConfig(entity);

    // 3. Fallback to Universal Render Layouts
    switch (viewType) {
      case "card":
        if (typeof PharmoraUniversalCard !== "undefined") {
          return PharmoraUniversalCard.render(entity, config);
        }
        break;
      case "page":
        if (typeof PharmoraUniversalPage !== "undefined") {
          return PharmoraUniversalPage.render(entity, config);
        }
        break;
      case "list":
        if (typeof PharmoraUniversalList !== "undefined") {
          return PharmoraUniversalList.render([entity], config);
        }
        break;
      case "table":
        if (typeof PharmoraUniversalTable !== "undefined") {
          return PharmoraUniversalTable.render([entity], config);
        }
        break;
    }

    return `<div class="universal-entity-render font-size: 0.9rem;">
      <strong>${entity.type}</strong>: ${entity.uuid}
    </div>`;
  }

  window.PharmoraUniversalRenderer = {
    registerPlugin,
    registerTypeRenderer,
    getTypeRenderer,
    registerTypeConfig,
    getTypeConfig,
    resolveField,
    getAutoConfig,
    render
  };
})();
