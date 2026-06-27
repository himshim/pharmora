/*
  Pharmora Universal Entity Schema Engine
  v2.0.0
*/
(function() {
  const baseSchema = {
    type: "object",
    required: ["uuid", "publicId", "type", "slug", "status", "version"],
    properties: {
      uuid: { type: "string", pattern: "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$" },
      publicId: { type: "string" },
      type: { type: "string" },
      slug: { type: "string" },
      status: { type: "string", enum: ["draft", "pending_review", "approved", "rejected", "archived"] },
      version: { type: "integer" },
      owner: { type: ["string", "null"] },
      contributors: { type: "array", items: { type: "string" } },
      timestamps: {
        type: "object",
        required: ["created", "updated"],
        properties: {
          created: { type: "string" },
          updated: { type: "string" },
          published: { type: ["string", "null"] }
        }
      },
      visibility: { type: "string", enum: ["public", "private", "unlisted", "restricted"] },
      tags: { type: "array", items: { type: "string" } },
      metadata: { type: "object" },
      content: { type: "object" },
      relations: { type: "array" },
      verification: { type: "object" },
      permissions: { type: "object" },
      analytics: { type: "object" },
      auditTrail: { type: "array" }
    }
  };

  function mergeSchema(entitySchema) {
    if (!entitySchema) return baseSchema;
    
    const merged = JSON.parse(JSON.stringify(baseSchema));
    
    // Merge required fields
    if (Array.isArray(entitySchema.required)) {
      merged.required = Array.from(new Set([...merged.required, ...entitySchema.required]));
    }

    // Merge content properties
    if (entitySchema.properties?.content) {
      merged.properties.content = {
        type: "object",
        required: entitySchema.properties.content.required || [],
        properties: {
          ...merged.properties.content.properties,
          ...entitySchema.properties.content.properties
        }
      };
    }
    
    return merged;
  }

  function validate(entity, typeSchema = null) {
    const schema = mergeSchema(typeSchema);
    const errors = [];

    // Required fields check
    if (schema.required) {
      for (const req of schema.required) {
        if (entity[req] === undefined || entity[req] === null) {
          errors.push(`Missing required field: ${req}`);
        }
      }
    }

    // Status enum check
    if (entity.status && schema.properties.status.enum) {
      if (!schema.properties.status.enum.includes(entity.status)) {
        errors.push(`Invalid status value: ${entity.status}`);
      }
    }

    // Content specific validation
    if (schema.properties.content && schema.properties.content.properties) {
      const content = entity.content || {};
      const contentSchema = schema.properties.content;
      
      if (contentSchema.required) {
        for (const req of contentSchema.required) {
          if (content[req] === undefined || content[req] === null) {
            errors.push(`Missing required content field: content.${req}`);
          }
        }
      }

      for (const [key, propSpec] of Object.entries(contentSchema.properties || {})) {
        if (content[key] !== undefined && content[key] !== null) {
          if (propSpec.type === "string" && typeof content[key] !== "string") {
            errors.push(`Field content.${key} must be a string`);
          } else if (propSpec.type === "integer" && !Number.isInteger(content[key])) {
            errors.push(`Field content.${key} must be an integer`);
          } else if (propSpec.type === "number" && typeof content[key] !== "number") {
            errors.push(`Field content.${key} must be a number`);
          } else if (propSpec.type === "boolean" && typeof content[key] !== "boolean") {
            errors.push(`Field content.${key} must be a boolean`);
          } else if (propSpec.type === "array" && !Array.isArray(content[key])) {
            errors.push(`Field content.${key} must be an array`);
          }
        }
      }
    }

    // Extensible custom validator registered in Registry
    if (entity.type && typeof PharmoraEntityRegistry !== "undefined") {
      const customValidator = PharmoraEntityRegistry.getValidator(entity.type);
      if (customValidator) {
        const customErrors = customValidator(entity);
        if (Array.isArray(customErrors)) {
          errors.push(...customErrors);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  window.PharmoraEntitySchema = {
    getBaseSchema: () => JSON.parse(JSON.stringify(baseSchema)),
    mergeSchema,
    validate
  };
})();
