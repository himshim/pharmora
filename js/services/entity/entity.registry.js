/*
  Pharmora Universal Entity Registry
  v2.0.0
*/
(function() {
  const registries = {
    types: new Map(),
    schemas: new Map(),
    renderers: new Map(),
    validators: new Map(),
    hooks: new Map()
  };

  function registerType(name, meta = {}) {
    registries.types.set(name, {
      name,
      registeredAt: new Date().toISOString(),
      ...meta
    });
    return true;
  }

  function registerSchema(typeName, schemaJson) {
    registries.schemas.set(typeName, schemaJson);
    return true;
  }

  function registerRenderer(typeName, rendererFn) {
    registries.renderers.set(typeName, rendererFn);
    return true;
  }

  function registerValidator(typeName, validatorFn) {
    registries.validators.set(typeName, validatorFn);
    return true;
  }

  function registerHook(typeName, hookName, hookFn) {
    if (!registries.hooks.has(typeName)) {
      registries.hooks.set(typeName, new Map());
    }
    const typeHooks = registries.hooks.get(typeName);
    if (!typeHooks.has(hookName)) {
      typeHooks.set(hookName, []);
    }
    typeHooks.get(hookName).push(hookFn);
    return true;
  }

  function getSchema(typeName) {
    return registries.schemas.get(typeName) || null;
  }

  function getRenderer(typeName) {
    return registries.renderers.get(typeName) || null;
  }

  function getValidator(typeName) {
    return registries.validators.get(typeName) || null;
  }

  function getHooks(typeName, hookName) {
    return registries.hooks.get(typeName)?.get(hookName) || [];
  }

  async function triggerHooks(typeName, hookName, entity, ...args) {
    const hooks = getHooks(typeName, hookName);
    for (const hook of hooks) {
      const result = await hook(entity, ...args);
      if (result === false) {
        throw new Error(`Hook ${hookName} failed validation on entity type ${typeName}`);
      }
    }
  }

  function getRegisteredTypes() {
    return Array.from(registries.types.keys());
  }

  window.PharmoraEntityRegistry = {
    registerType,
    registerSchema,
    registerRenderer,
    registerValidator,
    registerHook,
    getSchema,
    getRenderer,
    getValidator,
    getHooks,
    triggerHooks,
    getRegisteredTypes
  };
})();
