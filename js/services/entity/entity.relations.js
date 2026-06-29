/*
  Pharmora Universal Entity Relation Engine
  v2.0.0
*/
(function() {
  const InverseRelations = {
    "belongsTo": "hasMany",
    "hasMany": "belongsTo",
    "hasOne": "belongsTo",
    "manyToMany": "manyToMany",
    
    // Domain Specific Inverses
    "part_of_semester": "contains_subject",
    "contains_subject": "part_of_semester",
    "manufactured_by": "manufacturer_of",
    "manufacturer_of": "manufactured_by",
    "published_in": "published_article",
    "published_article": "published_in",
    "covers_subject": "covered_by_book",
    "covered_by_book": "covers_subject"
  };

  function getInverseRelation(relationType) {
    return InverseRelations[relationType] || `inverse_${relationType}`;
  }

  async function linkEntities(fromId, relationType, toId, metadata = {}, actor = "system") {
    if (typeof PharmoraEntityAPI === "undefined") {
      throw new Error("PharmoraEntityAPI is required for relations engine");
    }

    const fromEntity = await PharmoraEntityAPI.getEntity(fromId);
    const toEntity = await PharmoraEntityAPI.getEntity(toId);
    if (!fromEntity || !toEntity) {
      throw new Error("One or both entities for linking not found");
    }

    // Cycle check: Avoid linking an entity to itself or creating circular loops
    if (fromId === toId) {
      throw new Error("Cannot link entity to itself");
    }

    async function checkPathExists(startId, searchTargetId, visited = new Set()) {
      if (startId === searchTargetId) return true;
      if (visited.has(startId)) return false;
      visited.add(startId);
      
      const node = await PharmoraEntityAPI.getEntity(startId).catch(() => null);
      if (!node || !node.relations) return false;
      
      // Follow all outgoing children links
      const children = node.relations.filter(r => r.relationType === "hasMany" || r.relationType === "hasOne" || r.relationType === "contains_subject");
      for (const child of children) {
        if (await checkPathExists(child.targetUuid, searchTargetId, visited)) return true;
      }
      return false;
    }

    // If we are linking 'fromId' -> 'toId' as a child (hasMany), check if 'toId' is already an ancestor of 'fromId'
    if (relationType === 'hasMany' || relationType === 'hasOne' || relationType === 'contains_subject') {
      const isAncestor = await checkPathExists(toId, fromId);
      if (isAncestor) {
        throw new Error("Circular relationship detected: target is already an ancestor of the source");
      }
    }

    // Check if relation already exists to prevent duplicate links
    const alreadyExists = fromEntity.relations.some(r => 
      r.relationType === relationType && r.targetUuid === toId
    );
    if (alreadyExists) return false;

    const relMeta = {
      createdBy: actor,
      createdAt: new Date().toISOString(),
      verified: metadata.verified !== undefined ? metadata.verified : false,
      confidence: metadata.confidence !== undefined ? metadata.confidence : 1.0,
      source: metadata.source || "user"
    };

    // Update fromEntity
    const updatedFromRelations = [...fromEntity.relations, {
      relationType,
      targetUuid: toId,
      targetType: toEntity.type,
      metadata: relMeta
    }];
    await PharmoraEntityAPI.updateEntity(fromId, { relations: updatedFromRelations }, actor);

    // Update toEntity bidirectionally
    const invRelationType = getInverseRelation(relationType);
    const updatedToRelations = [...toEntity.relations, {
      relationType: invRelationType,
      targetUuid: fromId,
      targetType: fromEntity.type,
      metadata: relMeta
    }];
    await PharmoraEntityAPI.updateEntity(toId, { relations: updatedToRelations }, actor);

    return true;
  }

  async function unlinkEntities(fromId, relationType, toId, actor = "system") {
    const fromEntity = await PharmoraEntityAPI.getEntity(fromId);
    const toEntity = await PharmoraEntityAPI.getEntity(toId);
    if (!fromEntity || !toEntity) return false;

    const updatedFromRelations = fromEntity.relations.filter(r => 
      !(r.relationType === relationType && r.targetUuid === toId)
    );
    await PharmoraEntityAPI.updateEntity(fromId, { relations: updatedFromRelations }, actor);

    const invRelationType = getInverseRelation(relationType);
    const updatedToRelations = toEntity.relations.filter(r => 
      !(r.relationType === invRelationType && r.targetUuid === fromId)
    );
    await PharmoraEntityAPI.updateEntity(toId, { relations: updatedToRelations }, actor);

    return true;
  }

  async function getRelations(entityId) {
    const entity = await PharmoraEntityAPI.getEntity(entityId);
    return entity ? entity.relations : [];
  }

  async function getParents(entityId) {
    const relations = await getRelations(entityId);
    // General parents: relations classified as belongsTo
    return relations.filter(r => r.relationType === "belongsTo" || r.relationType === "part_of_semester" || r.relationType === "manufactured_by");
  }

  async function getChildren(entityId) {
    const relations = await getRelations(entityId);
    // General children: relations classified as hasMany or hasOne
    return relations.filter(r => r.relationType === "hasMany" || r.relationType === "hasOne" || r.relationType === "contains_subject" || r.relationType === "manufacturer_of");
  }

  async function getRelated(entityId, relationTypeOrTargetType) {
    const relations = await getRelations(entityId);
    return relations.filter(r => r.relationType === relationTypeOrTargetType || r.targetType === relationTypeOrTargetType);
  }

  async function getDeepRelated(entityId, targetType, visited = new Set()) {
    if (visited.has(entityId)) return [];
    visited.add(entityId);

    const relations = await getRelations(entityId).catch(() => []);
    let results = [];

    // Direct matches
    const direct = relations.filter(r => r.targetType === targetType);
    for (const r of direct) {
      const ent = await PharmoraEntityAPI.getEntity(r.targetUuid).catch(() => null);
      if (ent) results.push(ent);
    }

    // Traverse adjacent nodes recursively
    for (const r of relations) {
      if (r.targetType !== targetType) {
        const subResults = await getDeepRelated(r.targetUuid, targetType, visited);
        results.push(...subResults);
      }
    }

    // De-duplicate results by UUID
    const seen = new Set();
    return results.filter(e => {
      if (seen.has(e.uuid)) return false;
      seen.add(e.uuid);
      return true;
    });
  }

  window.PharmoraRelations = {
    linkEntities,
    unlinkEntities,
    getRelations,
    getParents,
    getChildren,
    getRelated,
    getDeepRelated,
    getInverseRelation
  };
})();
