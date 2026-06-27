/*
  Pharmora Universal Entity Relation Graph Traverser
  v2.0.0
*/
(function() {
  // Helper to load all entities into a local map for traversal efficiency
  async function buildAdjacencyMap() {
    const list = await PharmoraEntityAPI.listEntities();
    const map = new Map();
    list.forEach(ent => {
      map.set(ent.uuid, {
        entity: ent,
        edges: ent.relations.map(r => r.targetUuid)
      });
    });
    return map;
  }

  // Breadth-First Search (BFS)
  async function bfs(startId, visitFn) {
    const map = await buildAdjacencyMap();
    if (!map.has(startId)) return;

    const queue = [startId];
    const visited = new Set([startId]);

    while (queue.length > 0) {
      const currentId = queue.shift();
      const node = map.get(currentId);
      
      const proceed = await visitFn(node.entity);
      if (proceed === false) break;

      for (const edge of node.edges) {
        if (!visited.has(edge) && map.has(edge)) {
          visited.add(edge);
          queue.push(edge);
        }
      }
    }
  }

  // Depth-First Search (DFS)
  async function dfs(startId, visitFn) {
    const map = await buildAdjacencyMap();
    if (!map.has(startId)) return;

    const visited = new Set();

    async function traverse(currentId) {
      visited.add(currentId);
      const node = map.get(currentId);
      
      const proceed = await visitFn(node.entity);
      if (proceed === false) return false;

      for (const edge of node.edges) {
        if (!visited.has(edge) && map.has(edge)) {
          const keepGoing = await traverse(edge);
          if (keepGoing === false) return false;
        }
      }
      return true;
    }

    await traverse(startId);
  }

  // Shortest Path (using BFS back-pointer path construction)
  async function findShortestPath(startId, endId) {
    const map = await buildAdjacencyMap();
    if (!map.has(startId) || !map.has(endId)) return null;

    const queue = [startId];
    const visited = new Set([startId]);
    const parentMap = new Map(); // toId -> fromId

    let found = false;

    while (queue.length > 0) {
      const currentId = queue.shift();
      if (currentId === endId) {
        found = true;
        break;
      }

      const node = map.get(currentId);
      for (const edge of node.edges) {
        if (!visited.has(edge) && map.has(edge)) {
          visited.add(edge);
          parentMap.set(edge, currentId);
          queue.push(edge);
        }
      }
    }

    if (!found) return null;

    // Build path
    const path = [];
    let step = endId;
    while (step !== undefined) {
      path.push(map.get(step).entity);
      step = parentMap.get(step);
    }
    return path.reverse();
  }

  // Retrieve k-degree related entities (neighborhood lookup)
  async function getRelatedEntities(entityId, degrees = 1) {
    const map = await buildAdjacencyMap();
    if (!map.has(entityId)) return [];

    let currentLevel = new Set([entityId]);
    const visited = new Set([entityId]);

    for (let d = 0; d < degrees; d++) {
      const nextLevel = new Set();
      for (const id of currentLevel) {
        const node = map.get(id);
        if (node) {
          for (const edge of node.edges) {
            if (!visited.has(edge) && map.has(edge)) {
              visited.add(edge);
              nextLevel.add(edge);
            }
          }
        }
      }
      currentLevel = nextLevel;
      if (currentLevel.size === 0) break;
    }

    // Convert visited IDs back to entities, excluding the start entity
    visited.delete(entityId);
    return Array.from(visited).map(id => map.get(id).entity);
  }

  window.PharmoraEntityGraph = {
    bfs,
    dfs,
    findShortestPath,
    getRelatedEntities
  };
})();
