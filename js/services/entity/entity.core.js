/*
  Pharmora Universal Entity Core
  v2.0.0
*/
(function() {
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function generateSlug(text) {
    if (!text) return '';
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  }

  class BaseEntity {
    constructor(data = {}) {
      this.id = data.id || null;
      this.uuid = data.uuid || generateUUID();
      this.publicId = data.publicId || `ENT-${Math.floor(100000 + Math.random() * 900000)}`;
      this.type = data.type || 'generic';
      this.slug = data.slug || generateSlug(data.title || data.name || this.publicId);
      this.owner = data.owner || null;
      this.contributors = Array.isArray(data.contributors) ? data.contributors : [];
      
      this.timestamps = {
        created: data.timestamps?.created || new Date().toISOString(),
        updated: data.timestamps?.updated || new Date().toISOString(),
        published: data.timestamps?.published || null
      };

      this.version = data.version || 1;
      this.visibility = data.visibility || 'public';
      this.status = data.status || 'draft';
      this.tags = Array.isArray(data.tags) ? data.tags : [];
      this.metadata = data.metadata || {};
      this.content = data.content || {};
      this.relations = Array.isArray(data.relations) ? data.relations : [];
      
      this.verification = {
        isVerified: data.verification?.isVerified || false,
        verifiedBy: data.verification?.verifiedBy || null,
        verifiedAt: data.verification?.verifiedAt || null
      };

      this.permissions = data.permissions || {
        roles: {},
        users: {}
      };

      this.analytics = {
        views: data.analytics?.views || 0,
        references: data.analytics?.references || 0,
        score: data.analytics?.score || 0.0
      };

      this.auditTrail = Array.isArray(data.auditTrail) ? data.auditTrail : [];
    }

    addAuditLog(action, actor, changes = null) {
      let safeChanges = null;
      if (changes) {
        try {
          // De-circularize: extract only flat diff or specific key changes
          safeChanges = JSON.parse(JSON.stringify(changes, (key, value) => {
            if (value && typeof value === 'object' && value.constructor && value.constructor.name === 'BaseEntity') {
              return { uuid: value.uuid, type: value.type, publicId: value.publicId };
            }
            if (key === 'auditTrail' || key === 'versions') return undefined;
            return value;
          }));
        } catch (e) {
          safeChanges = { serializationError: e.message };
        }
      }
      this.auditTrail.push({
        action,
        actor,
        timestamp: new Date().toISOString(),
        changes: safeChanges
      });
      this.timestamps.updated = new Date().toISOString();
    }
  }

  window.PharmoraEntityCore = {
    BaseEntity,
    generateUUID,
    generateSlug
  };
})();
