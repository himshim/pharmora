/*
  Pharmora Universal Entity API
  v2.0.0
*/
(function() {
  const collectionName = "entities";

  async function createEntity(entityData, actor = "system") {
    // 1. Get Schema if any
    const typeSchema = typeof PharmoraEntityRegistry !== "undefined" 
      ? PharmoraEntityRegistry.getSchema(entityData.type) 
      : null;

    // 2. Instantiate core properties using BaseEntity constructor
    const coreEntity = new PharmoraEntityCore.BaseEntity(entityData);
    
    // 3. Validation
    const valResult = PharmoraEntitySchema.validate(coreEntity, typeSchema);
    if (!valResult.valid) {
      throw new Error(`Validation failed: ${valResult.errors.join("; ")}`);
    }

    // 4. Trigger beforeCreate hook
    if (typeof PharmoraEntityRegistry !== "undefined") {
      await PharmoraEntityRegistry.triggerHooks(coreEntity.type, "beforeCreate", coreEntity);
    }

    // 5. Add audit log
    coreEntity.addAuditLog("create", actor);

    // 6. DB write using underlying database engine
    const record = await window.createRecord(collectionName, coreEntity);
    coreEntity.id = record.id;

    // 7. Trigger afterCreate hook
    if (typeof PharmoraEntityRegistry !== "undefined") {
      await PharmoraEntityRegistry.triggerHooks(coreEntity.type, "afterCreate", coreEntity);
    }

    // 8. Emit Created Event
    if (typeof PharmoraEntityEvents !== "undefined") {
      await PharmoraEntityEvents.emit(PharmoraEntityEvents.EventTypes.EntityCreated, coreEntity);
    }

    return coreEntity;
  }

  async function getEntity(uuid) {
    const records = await window.getRecords(collectionName, { uuid });
    if (!records || records.length === 0) {
      return null;
    }
    return new PharmoraEntityCore.BaseEntity(records[0]);
  }

  async function updateEntity(uuid, updates, actor = "system") {
    const existing = await getEntity(uuid);
    if (!existing) {
      throw new Error(`Entity not found: ${uuid}`);
    }

    const nextData = {
      ...existing,
      ...updates,
      content: { ...existing.content, ...updates.content },
      metadata: { ...existing.metadata, ...updates.metadata },
      timestamps: {
        ...existing.timestamps,
        updated: new Date().toISOString()
      },
      version: existing.version + 1
    };

    const typeSchema = typeof PharmoraEntityRegistry !== "undefined"
      ? PharmoraEntityRegistry.getSchema(nextData.type)
      : null;

    const coreEntity = new PharmoraEntityCore.BaseEntity(nextData);

    // Validate
    const valResult = PharmoraEntitySchema.validate(coreEntity, typeSchema);
    if (!valResult.valid) {
      throw new Error(`Validation failed: ${valResult.errors.join("; ")}`);
    }

    // Hook
    if (typeof PharmoraEntityRegistry !== "undefined") {
      await PharmoraEntityRegistry.triggerHooks(coreEntity.type, "beforeUpdate", coreEntity);
    }

    // Audit log
    coreEntity.addAuditLog("update", actor, updates);

    // DB update
    const internalId = nextData.id;
    await window.updateRecord(collectionName, internalId, coreEntity);

    // Hook
    if (typeof PharmoraEntityRegistry !== "undefined") {
      await PharmoraEntityRegistry.triggerHooks(coreEntity.type, "afterUpdate", coreEntity);
    }

    // Emit Updated
    if (typeof PharmoraEntityEvents !== "undefined") {
      await PharmoraEntityEvents.emit(PharmoraEntityEvents.EventTypes.EntityUpdated, coreEntity);
    }

    // Handle published transitions
    if (updates.status === "approved" && existing.status !== "approved") {
      if (typeof PharmoraEntityEvents !== "undefined") {
        await PharmoraEntityEvents.emit(PharmoraEntityEvents.EventTypes.EntityPublished, coreEntity);
      }
    }

    return coreEntity;
  }

  async function deleteEntity(uuid, actor = "system") {
    const existing = await getEntity(uuid);
    if (!existing) {
      throw new Error(`Entity not found: ${uuid}`);
    }

    // Hook
    if (typeof PharmoraEntityRegistry !== "undefined") {
      await PharmoraEntityRegistry.triggerHooks(existing.type, "beforeDelete", existing);
    }

    // DB removal
    const internalId = existing.id;
    await window.deleteRecord(collectionName, internalId);

    // Emit Deleted
    if (typeof PharmoraEntityEvents !== "undefined") {
      await PharmoraEntityEvents.emit(PharmoraEntityEvents.EventTypes.EntityDeleted, existing);
    }

    return true;
  }

  async function listEntities(filters = {}) {
    const records = await window.getRecords(collectionName, filters);
    return records.map(r => new PharmoraEntityCore.BaseEntity(r));
  }

  window.PharmoraEntityAPI = {
    createEntity,
    getEntity,
    updateEntity,
    deleteEntity,
    listEntities
  };
})();
