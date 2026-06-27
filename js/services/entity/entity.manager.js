/*
  Pharmora Universal Entity Manager Logic
  v2.0.0
*/
(function() {
  async function checkPermission(entity, action) {
    if (typeof canEntityAction === "function") {
      return await canEntityAction(entity, action);
    }
    // Fallback if permission service not loaded
    const user = typeof currentUser === "function" ? currentUser() : null;
    if (!user) return false;
    if (user.role === "admin" || user.role === "owner") return true;
    return entity?.owner === user.id;
  }

  async function getFilteredEntities(options = {}) {
    const list = await PharmoraEntityAPI.listEntities();
    
    let filtered = list.filter(entity => {
      if (options.type && entity.type !== options.type) return false;
      if (options.owner && entity.owner !== options.owner) return false;
      if (options.status && entity.status !== options.status) return false;
      if (options.visibility && entity.visibility !== options.visibility) return false;
      if (options.tags && options.tags.length > 0) {
        const hasTag = options.tags.every(t => entity.tags.includes(t));
        if (!hasTag) return false;
      }
      if (options.verification !== undefined) {
        if (entity.verification?.isVerified !== options.verification) return false;
      }
      return true;
    });

    // Sorting
    const sortBy = options.sortBy || "created";
    const order = options.sortOrder || "desc"; // desc or asc

    filtered.sort((a, b) => {
      let valA, valB;
      if (sortBy === "title") {
        valA = a.content?.title || a.content?.name || "";
        valB = b.content?.title || b.content?.name || "";
      } else if (sortBy === "created") {
        valA = new Date(a.timestamps?.created || 0).getTime();
        valB = new Date(b.timestamps?.created || 0).getTime();
      } else if (sortBy === "updated") {
        valA = new Date(a.timestamps?.updated || 0).getTime();
        valB = new Date(b.timestamps?.updated || 0).getTime();
      } else if (sortBy === "popularity") {
        valA = a.analytics?.views || 0;
        valB = b.analytics?.views || 0;
      }

      if (valA < valB) return order === "asc" ? -1 : 1;
      if (valA > valB) return order === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }

  async function duplicateEntity(uuid, actor = "system") {
    const existing = await PharmoraEntityAPI.getEntity(uuid);
    if (!existing) throw new Error("Entity not found to duplicate");

    const duplicateData = {
      type: existing.type,
      tags: [...existing.tags],
      visibility: existing.visibility,
      status: "draft",
      content: JSON.parse(JSON.stringify(existing.content || {})),
      relations: JSON.parse(JSON.stringify(existing.relations || {})),
      metadata: {
        ...JSON.parse(JSON.stringify(existing.metadata || {})),
        duplicatedFrom: uuid
      }
    };

    // Rename title/name in content
    if (duplicateData.content.title) {
      duplicateData.content.title = `${duplicateData.content.title} (Copy)`;
    } else if (duplicateData.content.name) {
      duplicateData.content.name = `${duplicateData.content.name} (Copy)`;
    }

    return await PharmoraEntityAPI.createEntity(duplicateData, actor);
  }

  async function archiveEntity(uuid, actor = "system") {
    const entity = await PharmoraEntityAPI.getEntity(uuid);
    if (!entity) return false;
    if (!(await checkPermission(entity, "edit"))) {
      throw new Error("Unauthorized to archive entity");
    }
    return await PharmoraEntityAPI.updateEntity(uuid, { status: "archived" }, actor);
  }

  async function publishEntity(uuid, actor = "system") {
    const entity = await PharmoraEntityAPI.getEntity(uuid);
    if (!entity) return false;
    if (!(await checkPermission(entity, "approve"))) {
      throw new Error("Unauthorized to publish entity");
    }
    return await PharmoraEntityAPI.updateEntity(uuid, { status: "approved" }, actor);
  }

  async function restoreEntity(uuid, actor = "system") {
    const entity = await PharmoraEntityAPI.getEntity(uuid);
    if (!entity) return false;
    if (!(await checkPermission(entity, "edit"))) {
      throw new Error("Unauthorized to restore entity");
    }
    return await PharmoraEntityAPI.updateEntity(uuid, { status: "draft" }, actor);
  }

  // Bulk Actions
  async function bulkPublish(uuids = [], actor = "system") {
    let successCount = 0;
    for (const uuid of uuids) {
      try {
        await publishEntity(uuid, actor);
        successCount++;
      } catch (e) {
        console.warn(`Bulk publish failed for ${uuid}:`, e);
      }
    }
    return successCount;
  }

  async function bulkArchive(uuids = [], actor = "system") {
    let successCount = 0;
    for (const uuid of uuids) {
      try {
        await archiveEntity(uuid, actor);
        successCount++;
      } catch (e) {
        console.warn(`Bulk archive failed for ${uuid}:`, e);
      }
    }
    return successCount;
  }

  async function bulkDelete(uuids = [], actor = "system") {
    let successCount = 0;
    for (const uuid of uuids) {
      try {
        const entity = await PharmoraEntityAPI.getEntity(uuid);
        if (entity && (await checkPermission(entity, "delete"))) {
          await PharmoraEntityAPI.deleteEntity(uuid, actor);
          successCount++;
        }
      } catch (e) {
        console.warn(`Bulk delete failed for ${uuid}:`, e);
      }
    }
    return successCount;
  }

  async function bulkExport(uuids = []) {
    const list = [];
    for (const uuid of uuids) {
      const entity = await PharmoraEntityAPI.getEntity(uuid);
      if (entity) {
        list.push(entity);
      }
    }
    return JSON.stringify(list, null, 2);
  }

  window.PharmoraEntityManager = {
    getFilteredEntities,
    duplicateEntity,
    archiveEntity,
    publishEntity,
    restoreEntity,
    bulkPublish,
    bulkArchive,
    bulkDelete,
    bulkExport,
    checkPermission
  };
})();
