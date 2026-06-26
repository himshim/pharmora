/*
 Pharmora Dynamic Schema Engine
 v2.1

 Universal form renderer for:
 - Contributions
 - Entity editor
 - Admin editor
 - Profile extensions

 Public API (unchanged since v1):
   PharmoraSchema.register(type, schema)
   PharmoraSchema.getSchema(type)
   PharmoraSchema.render(type, target, existing)
   PharmoraSchema.collect(target)
   PharmoraSchema.validate(type, data)

 v2.0 additions (all opt-in via field properties):
 - Extended validation: required, requiredIf, min, max, pattern, email, url,
   and a custom validate(value, data) callback per field
 - Default values via field.default
 - Conditional fields: visibleIf(data), requiredIf(data), disabledIf(data)
 - Structured validation errors: [{ field, message }] instead of strings
 - Modular field renderers: new field types are added to a lookup table
   instead of growing createField()'s if/else chain

 v2.1 additions:
 - field.description / field.help are rendered as supporting text around
   the input (no-op if a field doesn't set them)
 - field.group (or field.section) groups consecutive fields into a
   <fieldset> with a <legend> (no-op if a field doesn't set it, so existing
   ungrouped schemas render exactly as before)
*/

(function () {

  const schemas = {};

  /* ======================
     REGISTER SCHEMA
  ====================== */

  function register(type, schema) {
    schemas[type] = {
      version: schema.version || 1,
      fields: schema.fields || []
    };
  }

  /* ======================
     GET SCHEMA
  ====================== */

  function getSchema(type) {
    return schemas[type] || null;
  }

  /* ======================
     SHARED HELPERS
  ====================== */

  function isEmpty(value) {
    return value === undefined || value === null || value === "";
  }

  // visibleIf / requiredIf / disabledIf are plain functions that receive
  // the current form data and return a boolean. Any error inside a
  // condition is logged and treated as "true" so a broken condition fails
  // open (visible/required) rather than silently hiding data from the user.
  function evaluateCondition(condition, data) {
    if (typeof condition !== "function") {
      return true;
    }
    try {
      return !!condition(data);
    } catch (e) {
      console.warn("Condition evaluation failed", e);
      return true;
    }
  }

  function isFieldVisible(field, data) {
    if (typeof field.visibleIf !== "function") return true;
    return evaluateCondition(field.visibleIf, data);
  }

  function isFieldRequired(field, data) {
    if (field.required) return true;
    if (typeof field.requiredIf === "function") {
      return evaluateCondition(field.requiredIf, data);
    }
    return false;
  }

  function isFieldDisabled(field, data) {
    if (typeof field.disabledIf !== "function") return false;
    return evaluateCondition(field.disabledIf, data);
  }

  /* ======================
     FIELD RENDERERS

     Each renderer takes (field, value) and returns an input element,
     or a Promise resolving to one (e.g. "reference", which loads records
     asynchronously).

     To support a new field type, add an entry to `fieldRenderers` below.
     createField() never needs to change.
  ====================== */

  function renderTextareaField(field, value) {
    const input = document.createElement("textarea");
    input.value = value || "";
    return input;
  }

  function renderSelectField(field, value) {
    const input = document.createElement("select");

    (field.options || []).forEach(opt => {
      const option = document.createElement("option");
      option.value = opt.value !== undefined ? opt.value : opt;
      option.textContent = opt.label !== undefined ? opt.label : opt;

      if (option.value === value) {
        option.selected = true;
      }

      input.appendChild(option);
    });

    return input;
  }

  async function renderReferenceField(field, value) {
    const input = document.createElement("select");

    const empty = document.createElement("option");
    empty.textContent = "Select";
    empty.value = "";
    input.appendChild(empty);

    if (typeof getRecords === "function") {
      try {
        const records = await getRecords(field.collection);

        records.forEach(item => {
          const option = document.createElement("option");
          option.value = item.id;
          option.textContent = item.name || item.title || item.label || item.id;

          if (item.id === value) {
            option.selected = true;
          }

          input.appendChild(option);
        });
      } catch (e) {
        console.warn("Reference failed", field.collection);
      }
    }

    return input;
  }

  function renderDefaultField(field, value) {
    const input = document.createElement("input");
    input.type = field.type || "text";
    input.value = value || "";
    return input;
  }

  // Lookup table of type -> renderer. Add new field types here.
  const fieldRenderers = {
    textarea: renderTextareaField,
    select: renderSelectField,
    reference: renderReferenceField
  };

  /* ======================
     CREATE FIELD
  ====================== */

  async function createField(field, value, formData) {
    const wrap = document.createElement("div");
    wrap.className = "form-group";
    wrap.dataset.fieldKey = field.key;

    const label = document.createElement("label");
    wrap.appendChild(label);

    if (field.description) {
      const description = document.createElement("p");
      description.className = "field-description";
      description.textContent = field.description;
      wrap.appendChild(description);
    }

    const initialValue = !isEmpty(value)
      ? value
      : (field.default !== undefined ? field.default : "");

    const renderer = fieldRenderers[field.type] || renderDefaultField;
    const input = await renderer(field, initialValue);

    input.dataset.field = field.key;

    if (field.placeholder) {
      input.placeholder = field.placeholder;
    }

    wrap.appendChild(input);

    if (field.help) {
      const help = document.createElement("small");
      help.className = "field-help";
      help.textContent = field.help;
      wrap.appendChild(help);
    }

    applyConditionalState(field, wrap, input, formData || {});

    return wrap;
  }

  /* ======================
     CONDITIONAL FIELDS

     field.visibleIf(data)  -> show/hide the field's wrapper
     field.requiredIf(data) -> dynamically mark the field required
     field.disabledIf(data) -> enable/disable the input

     State is recalculated on every input/change inside the form so
     fields can react live to each other.
  ====================== */

  function applyConditionalState(field, wrap, input, data) {
    const visible = isFieldVisible(field, data);
    wrap.style.display = visible ? "" : "none";
    wrap.dataset.visible = visible ? "true" : "false";

    input.disabled = isFieldDisabled(field, data);

    const required = isFieldRequired(field, data);
    input.dataset.required = required ? "true" : "false";

    const label = wrap.querySelector("label");
    if (label) {
      label.textContent = field.label + (required ? " *" : "");
    }
  }

  function hasConditionalFields(schema) {
    return schema.fields.some(field =>
      field.visibleIf || field.requiredIf || field.disabledIf
    );
  }

  function wireConditionalBehavior(schema, container, fieldElements) {
    if (!hasConditionalFields(schema)) return;

    const refresh = () => {
      const data = collect(container);

      schema.fields.forEach(field => {
        const wrap = fieldElements.get(field.key);
        const input = wrap && wrap.querySelector("[data-field]");

        if (wrap && input) {
          applyConditionalState(field, wrap, input, data);
        }
      });
    };

    container.addEventListener("input", refresh);
    container.addEventListener("change", refresh);

    // Re-evaluate once immediately so default values that satisfy/violate
    // a condition are reflected before the user touches anything.
    refresh();
  }

  /* ======================
     FIELD GROUPING

     field.group (or field.section) groups consecutive fields into a
     <fieldset>/<legend>. Fields without a group are appended directly
     to the container, exactly like before — so schemas that don't use
     grouping render unchanged.
  ====================== */

  function createGroupContainer(groupName) {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "form-group-section";

    const legend = document.createElement("legend");
    legend.textContent = groupName;
    fieldset.appendChild(legend);

    return fieldset;
  }

  /* ======================
     RENDER FORM
  ====================== */

  async function render(type, target, existing = {}) {
    const schema = getSchema(type);
    const container = typeof target === "string"
      ? document.getElementById(target)
      : target;

    if (!schema || !container) return;

    container.innerHTML = "";

    const fieldElements = new Map();
    let currentGroupName = null;
    let currentGroupContainer = container;

    for (const field of schema.fields) {
      const element = await createField(field, existing[field.key], existing);
      fieldElements.set(field.key, element);

      const groupName = field.group || field.section || null;

      if (groupName) {
        if (groupName !== currentGroupName) {
          currentGroupContainer = createGroupContainer(groupName);
          container.appendChild(currentGroupContainer);
          currentGroupName = groupName;
        }
      } else {
        currentGroupContainer = container;
        currentGroupName = null;
      }

      currentGroupContainer.appendChild(element);
    }

    wireConditionalBehavior(schema, container, fieldElements);
  }

  /* ======================
     COLLECT DATA
  ====================== */

  function collect(target) {
    const container = typeof target === "string"
      ? document.getElementById(target)
      : target;

    const data = {};

    container.querySelectorAll("[data-field]").forEach(el => {
      const wrap = el.closest("[data-field-key]");

      // Fields hidden by a visibleIf condition don't contribute data.
      if (wrap && wrap.dataset.visible === "false") return;

      data[el.dataset.field] = el.value;
    });

    return data;
  }

  /* ======================
     VALIDATION

     Per-field options supported:
       required, requiredIf(data)   -> presence
       visibleIf(data)              -> hidden fields are skipped entirely
       min, max                     -> numeric bounds for type:"number",
                                        otherwise string length
       pattern                      -> RegExp or regex string
       email / type:"email"
       url   / type:"url"
       validate(value, data)        -> return true/undefined (valid),
                                        false (invalid, generic message),
                                        or a string (invalid, used as message)

     Returns: [{ field, message }, ...]
  ====================== */

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function checkMinMax(field, value, errors) {
    const isNumberField = field.type === "number";
    const numericValue = Number(value);

    if (isNumberField && Number.isNaN(numericValue)) return;

    const comparable = isNumberField ? numericValue : String(value).length;

    if (field.min !== undefined && comparable < field.min) {
      errors.push({
        field: field.key,
        message: isNumberField
          ? field.label + " must be at least " + field.min
          : field.label + " must be at least " + field.min + " characters"
      });
    }

    if (field.max !== undefined && comparable > field.max) {
      errors.push({
        field: field.key,
        message: isNumberField
          ? field.label + " must be at most " + field.max
          : field.label + " must be at most " + field.max + " characters"
      });
    }
  }

  function checkPattern(field, value, errors) {
    if (!field.pattern) return;

    const regex = field.pattern instanceof RegExp
      ? field.pattern
      : new RegExp(field.pattern);

    if (!regex.test(String(value))) {
      errors.push({ field: field.key, message: field.label + " is invalid" });
    }
  }

  function checkEmail(field, value, errors) {
    if (field.type !== "email" && !field.email) return;

    if (!EMAIL_PATTERN.test(String(value))) {
      errors.push({ field: field.key, message: field.label + " must be a valid email address" });
    }
  }

  function checkUrl(field, value, errors) {
    if (field.type !== "url" && !field.url) return;

    try {
      new URL(String(value));
    } catch (e) {
      errors.push({ field: field.key, message: field.label + " must be a valid URL" });
    }
  }

  function checkCustom(field, value, data, errors) {
    if (typeof field.validate !== "function") return;

    let result;
    try {
      result = field.validate(value, data);
    } catch (e) {
      console.warn("Custom validator failed for field", field.key, e);
      return;
    }

    if (result === true || result === undefined || result === null) return;

    errors.push({
      field: field.key,
      message: typeof result === "string" ? result : field.label + " is invalid"
    });
  }

  function validate(type, data) {
    const schema = getSchema(type);
    const errors = [];

    if (!schema) return errors;

    schema.fields.forEach(field => {
      // A field hidden by its own visibleIf condition isn't part of the
      // submission, so it's skipped entirely (no required/format checks).
      if (!isFieldVisible(field, data)) return;

      const value = data[field.key];
      const required = isFieldRequired(field, data);

      if (required && isEmpty(value)) {
        errors.push({ field: field.key, message: field.label + " is required" });
        return;
      }

      if (isEmpty(value)) return;

      checkMinMax(field, value, errors);
      checkPattern(field, value, errors);
      checkEmail(field, value, errors);
      checkUrl(field, value, errors);
      checkCustom(field, value, data, errors);
    });

    return errors;
  }

  /* ======================
     EXPORT
  ====================== */

  window.PharmoraSchema = {
    register,
    getSchema,
    render,
    collect,
    validate
  };

  console.log("✓ Pharmora Schema Engine Ready");

})();