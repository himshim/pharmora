/*
  Pharmora Universal Search Indexer
  v3.0.0
*/
(function() {
  let searchIndex = [];

  async function buildIndex() {
    if (typeof PharmoraEntityAPI === "undefined") {
      console.warn("PharmoraEntityAPI is required to build the UES search index.");
      return [];
    }

    try {
      const entities = await PharmoraEntityAPI.listEntities();
      const compiled = [];

      for (const ent of entities) {
        // Retrieve dynamic UES render config to resolve correct fields
        let config = {};
        if (typeof PharmoraUniversalRenderer !== "undefined") {
          config = PharmoraUniversalRenderer.getTypeConfig(ent.type) || PharmoraUniversalRenderer.getAutoConfig(ent);
        }
        
        const resolve = (path) => {
          if (!path) return "";
          return path.split(".").reduce((acc, part) => acc && acc[part] !== undefined ? acc[part] : "", ent);
        };

        const title = resolve(config.titleField) || ent.content?.title || ent.content?.name || ent.content?.genericName || "Untitled";
        const subtitle = resolve(config.subtitleField) || ent.content?.subtitle || ent.content?.chemicalClass || ent.content?.course || "";
        const badge = resolve(config.badgeField) || ent.content?.code || ent.content?.shortName || ent.content?.icd10Code || "";
        const description = resolve(config.descriptionField) || ent.content?.description || ent.content?.rationale || "";
        
        // Compile all content object values for deep text indexing
        const contentValues = [];
        if (ent.content && typeof ent.content === 'object') {
          Object.values(ent.content).forEach(v => {
            if (Array.isArray(v)) contentValues.push(...v);
            else if (v !== null && v !== undefined) contentValues.push(v);
          });
        }

        // Compile search keywords for matching
        const keywords = [
          title,
          subtitle,
          badge,
          description,
          ent.type,
          ent.slug,
          ent.publicId,
          ...(ent.tags || []),
          ...contentValues
        ].filter(Boolean).map(s => s.toString().toLowerCase());

        compiled.push({
          uuid: ent.uuid,
          publicId: ent.publicId,
          type: ent.type,
          title,
          subtitle,
          badge,
          description,
          tags: ent.tags || [],
          status: ent.status,
          visibility: ent.visibility || "public",
          owner: ent.owner,
          popularity: ent.analytics?.views || 0,
          recentActivity: new Date(ent.timestamps?.updated || 0).getTime(),
          relationCount: ent.relations?.length || 0,
          permissions: ent.permissions || { roles: {}, users: {} },
          keywords,
          rawEntity: ent
        });
      }

      searchIndex = compiled;
      console.log(`[Search Index] Index built successfully with ${searchIndex.length} items.`);
      return searchIndex;
    } catch (e) {
      console.error("[Search Index] Failed to build index:", e);
      return [];
    }
  }

  function getIndex() {
    return searchIndex;
  }

  window.PharmoraSearchIndex = {
    buildIndex,
    getIndex
  };
})();
