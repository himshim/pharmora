/*
  Pharmora Universal Entity Migration Engine
  v2.0.0
*/
(function() {
  const migrationLogs = [];

  function validateMigration(legacyRecord, migratedEntity) {
    const errors = [];
    if (!migratedEntity.uuid) errors.push("Missing target UUID");
    if (!migratedEntity.type) errors.push("Missing target Entity Type");
    
    // Check mapping integrity (e.g. content fields matching legacy keys)
    const content = migratedEntity.content || {};
    for (const [key, value] of Object.entries(legacyRecord)) {
      if (["id", "type", "createdAt", "updatedAt"].includes(key)) continue;
      if (content[key] === undefined) {
        // Warning: field wasn't mapped into entity content
        errors.push(`Field warning: legacy field '${key}' is missing in target content`);
      }
    }

    return {
      valid: errors.filter(e => !e.startsWith("Field warning")).length === 0,
      errors
    };
  }

  async function migrateEntity(legacyRecord, targetType, options = {}) {
    const dryRun = options.dryRun || false;
    const actor = options.actor || "migration_system";

    const mappedData = {
      type: targetType,
      tags: legacyRecord.tags || legacyRecord.category ? [legacyRecord.category] : [],
      status: legacyRecord.status || "approved",
      content: {
        ...legacyRecord
      },
      timestamps: {
        created: legacyRecord.createdAt || legacyRecord.date || new Date().toISOString(),
        updated: legacyRecord.updatedAt || new Date().toISOString(),
        published: legacyRecord.publishedAt || null
      }
    };

    // Strip legacy meta fields from content block
    delete mappedData.content.id;
    delete mappedData.content.type;
    delete mappedData.content.tags;
    delete mappedData.content.createdAt;
    delete mappedData.content.updatedAt;

    const dummyEntity = new PharmoraEntityCore.BaseEntity(mappedData);
    const val = validateMigration(legacyRecord, dummyEntity);

    const logEntry = {
      timestamp: new Date().toISOString(),
      legacyId: legacyRecord.id,
      targetType,
      dryRun,
      success: val.valid,
      errors: val.errors
    };

    if (!dryRun && val.valid) {
      try {
        const created = await PharmoraEntityAPI.createEntity(mappedData, actor);
        logEntry.migratedUuid = created.uuid;
        migrationLogs.push(logEntry);
        return created;
      } catch (err) {
        logEntry.success = false;
        logEntry.errors.push(err.message);
        migrationLogs.push(logEntry);
        throw err;
      }
    }

    migrationLogs.push(logEntry);
    return dummyEntity;
  }

  async function rollbackMigration(targetType, uuid, actor = "migration_system") {
    if (typeof PharmoraEntityAPI !== "undefined") {
      await PharmoraEntityAPI.deleteEntity(uuid, actor);
      
      const logIdx = migrationLogs.findIndex(l => l.migratedUuid === uuid);
      if (logIdx !== -1) {
        migrationLogs[logIdx].rolledBack = true;
        migrationLogs[logIdx].rolledBackAt = new Date().toISOString();
      }
      return true;
    }
    return false;
  }

  function getMigrationReport() {
    const total = migrationLogs.length;
    const successful = migrationLogs.filter(l => l.success && !l.dryRun).length;
    const failed = migrationLogs.filter(l => !l.success).length;
    const dryRunCount = migrationLogs.filter(l => l.dryRun).length;

    return {
      summary: {
        total,
        successful,
        failed,
        dryRuns: dryRunCount
      },
      details: [...migrationLogs]
    };
  }

  window.PharmoraMigrationEngine = {
    migrateEntity,
    rollbackMigration,
    validateMigration,
    getMigrationReport,
    getLogs: () => migrationLogs
  };
})();
