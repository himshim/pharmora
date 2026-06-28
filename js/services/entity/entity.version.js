/*
  Pharmora Universal Entity Versioning Service
  v3.0.0
*/
(function() {
  function createSnapshot(entity, actor = "system") {
    if (!entity.metadata) entity.metadata = {};
    if (!entity.metadata.versions) entity.metadata.versions = [];

    const snapshot = {
      version: entity.version,
      content: JSON.parse(JSON.stringify(entity.content || {})),
      metadata: {
        actor,
        timestamp: new Date().toISOString()
      }
    };

    entity.metadata.versions.push(snapshot);
    return entity;
  }

  async function rollbackVersion(uuid, versionNumber, actor = "system") {
    if (typeof PharmoraEntityAPI === "undefined") return null;
    
    const entity = await PharmoraEntityAPI.getEntity(uuid);
    if (!entity) throw new Error("Entity not found for rollback");

    const versions = entity.metadata?.versions || [];
    const target = versions.find(v => v.version === versionNumber);
    if (!target) throw new Error(`Version ${versionNumber} not found`);

    // Update content and version indicator
    const rolledBackData = {
      content: target.content,
      version: entity.version + 1,
      timestamps: {
        ...entity.timestamps,
        updated: new Date().toISOString()
      }
    };

    // Log audit trail
    entity.addAuditLog("rollback", actor, { rolledBackTo: versionNumber });
    rolledBackData.auditTrail = entity.auditTrail;

    // Create a new snapshot of this rolled back version
    const updatedEntity = await PharmoraEntityAPI.updateEntity(uuid, rolledBackData, actor);
    
    // Create new snapshot
    const finalEntity = await PharmoraEntityAPI.getEntity(uuid);
    createSnapshot(finalEntity, actor);
    await PharmoraEntityAPI.updateEntity(uuid, { metadata: finalEntity.metadata }, actor);

    return finalEntity;
  }

  function compareVersions(entity, v1Number, v2Number) {
    const versions = entity.metadata?.versions || [];
    const v1 = versions.find(v => v.version === v1Number);
    const v2 = versions.find(v => v.version === v2Number);

    if (!v1 || !v2) return null;

    const diff = {
      added: {},
      removed: {},
      modified: {}
    };

    const keys1 = Object.keys(v1.content || {});
    const keys2 = Object.keys(v2.content || {});

    // Removed or Modified
    keys1.forEach(k => {
      if (!(k in v2.content)) {
        diff.removed[k] = v1.content[k];
      } else if (JSON.stringify(v1.content[k]) !== JSON.stringify(v2.content[k])) {
        diff.modified[k] = {
          from: v1.content[k],
          to: v2.content[k]
        };
      }
    });

    // Added
    keys2.forEach(k => {
      if (!(k in v1.content)) {
        diff.added[k] = v2.content[k];
      }
    });

    return diff;
  }

  window.PharmoraEntityVersioning = {
    createSnapshot,
    rollbackVersion,
    compareVersions
  };
})();
