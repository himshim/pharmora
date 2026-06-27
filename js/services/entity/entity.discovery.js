/*
  Pharmora Universal Discovery Engine
  v2.0.0
*/
(function() {
  async function getRecentlyUpdated(limit = 5) {
    if (typeof PharmoraEntityAPI === "undefined") return [];
    const list = await PharmoraEntityAPI.listEntities();
    return list
      .sort((a, b) => new Date(b.timestamps?.updated || 0).getTime() - new Date(a.timestamps?.updated || 0).getTime())
      .slice(0, limit);
  }

  async function getPopularEntities(limit = 5) {
    if (typeof PharmoraEntityAPI === "undefined") return [];
    const list = await PharmoraEntityAPI.listEntities();
    return list
      .sort((a, b) => (b.analytics?.views || 0) - (a.analytics?.views || 0))
      .slice(0, limit);
  }

  async function getSimilarEntities(entityId, limit = 5) {
    if (typeof PharmoraEntityAPI === "undefined") return [];
    const target = await PharmoraEntityAPI.getEntity(entityId);
    if (!target) return [];

    const list = await PharmoraEntityAPI.listEntities();
    const targetTags = new Set(target.tags || []);

    return list
      .filter(ent => ent.uuid !== entityId && ent.type === target.type)
      .map(ent => {
        const overlap = ent.tags.filter(t => targetTags.has(t)).length;
        return { ent, overlap };
      })
      .filter(item => item.overlap > 0)
      .sort((a, b) => b.overlap - a.overlap)
      .map(item => item.ent)
      .slice(0, limit);
  }

  async function getPrerequisitesChain(entityId) {
    if (typeof PharmoraRelations === "undefined") return [];
    // Traverse parent nodes upward (part_of_semester, belongsTo, etc.)
    const chain = [];
    let currentId = entityId;
    const visited = new Set([currentId]);

    while (currentId) {
      const parents = await PharmoraRelations.getParents(currentId);
      if (parents.length > 0) {
        const parentId = parents[0].targetUuid;
        if (!visited.has(parentId)) {
          visited.add(parentId);
          const parentEntity = await PharmoraEntityAPI.getEntity(parentId);
          if (parentEntity) {
            chain.push(parentEntity);
            currentId = parentId;
            continue;
          }
        }
      }
      break;
    }
    return chain.reverse();
  }

  async function getLearningPath(startId) {
    if (typeof PharmoraEntityGraph === "undefined") return [];
    // Compile learning path using graph BFS traversal downwards
    const path = [];
    await PharmoraEntityGraph.bfs(startId, (entity) => {
      path.push(entity);
      return true; // continue BFS
    });
    return path;
  }

  async function detectOrphans() {
    if (typeof PharmoraEntityAPI === "undefined") return [];
    const list = await PharmoraEntityAPI.listEntities();
    return list.filter(ent => !ent.relations || ent.relations.length === 0);
  }

  async function detectBrokenRelations() {
    if (typeof PharmoraEntityAPI === "undefined") return [];
    const list = await PharmoraEntityAPI.listEntities();
    const uuids = new Set(list.map(ent => ent.uuid));

    const broken = [];
    list.forEach(ent => {
      (ent.relations || []).forEach(rel => {
        if (!uuids.has(rel.targetUuid)) {
          broken.push({
            sourceUuid: ent.uuid,
            sourceType: ent.type,
            brokenTargetUuid: rel.targetUuid,
            relationType: rel.relationType
          });
        }
      });
    });
    return broken;
  }

  async function getRecommendedNext(entityId, limit = 3) {
    if (typeof PharmoraRelations === "undefined") return [];
    const parents = await PharmoraRelations.getParents(entityId);
    if (parents.length === 0) {
      // Fallback: 1-degree related
      if (typeof PharmoraEntityGraph !== "undefined") {
        return await PharmoraEntityGraph.getRelatedEntities(entityId, 1);
      }
      return [];
    }

    const parentUuid = parents[0].targetUuid;
    const parentRelationType = PharmoraRelations.getInverseRelation(parents[0].relationType);

    const parentEntity = await PharmoraEntityAPI.getEntity(parentUuid);
    if (!parentEntity) return [];

    // Filter siblings to only include nodes linked with the same parent-to-child relation type
    const siblings = (parentEntity.relations || [])
      .filter(rel => rel.targetUuid !== entityId && rel.relationType === parentRelationType)
      .slice(0, limit);

    const recommended = [];
    for (const sib of siblings) {
      const ent = await PharmoraEntityAPI.getEntity(sib.targetUuid);
      if (ent) recommended.push(ent);
    }
    return recommended;
  }

  window.PharmoraDiscoveryEngine = {
    getRecentlyUpdated,
    getPopularEntities,
    getSimilarEntities,
    getPrerequisitesChain,
    getLearningPath,
    detectOrphans,
    detectBrokenRelations,
    getRecommendedNext
  };
})();
