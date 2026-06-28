/*
  Pharmora Universal Search Ranking Engine
  v3.0.0
*/
(function() {
  function computeRelevanceScore(indexItem, query, userRole = "guest") {
    const q = query.toLowerCase().trim();
    let score = 0;

    const titleLower = indexItem.title.toLowerCase();
    
    // 1. Exact Title Match (highest weighting)
    if (titleLower === q) {
      score += 1000;
    } else if (titleLower.startsWith(q)) {
      score += 500;
    } else if (titleLower.includes(q)) {
      score += 200;
    }

    // 2. Alias Match
    const aliases = indexItem.rawEntity?.content?.aliases || [];
    aliases.forEach(alias => {
      const aLower = alias.toLowerCase();
      if (aLower === q) score += 400;
      else if (aLower.includes(q)) score += 100;
    });

    // 3. Tags Match
    indexItem.tags.forEach(tag => {
      if (tag.toLowerCase() === q) {
        score += 150;
      }
    });

    // 4. Keyword matches count
    indexItem.keywords.forEach(kw => {
      if (kw.includes(q)) {
        score += 10;
      }
    });

    // Only apply behavioral and metadata boosts if there is a baseline text match
    if (score > 0) {
      // 5. Popularity weighting (views)
      score += (indexItem.popularity * 0.1);

      // 6. Recent activity weighting
      const ageMs = Date.now() - indexItem.recentActivity;
      const ageDays = ageMs / (1000 * 60 * 60 * 24);
      if (ageDays < 7) {
        score += 50; // Active in last week
      } else if (ageDays < 30) {
        score += 20; // Active in last month
      }

      // 7. Relation count weighting (richer content nodes ranked higher)
      score += (indexItem.relationCount * 5);

      // 8. User role relevance weighting
      if (userRole === "student" || userRole === "educator") {
        // Academic priority
        const academicTypes = ["Subject", "Course", "Semester", "Unit", "Topic", "Practical", "QuestionBank", "MCQ", "Resource"];
        if (academicTypes.includes(indexItem.type)) {
          score += 30;
        }
      } else if (userRole === "professional") {
        // Clinical priority
        const clinicalTypes = ["Drug", "Brand", "Manufacturer", "Disease", "Mechanism", "TherapeuticClass", "PharmacologicalClass", "DosageForm", "Excipient", "AdverseEffect", "Interaction", "Contraindication"];
        if (clinicalTypes.includes(indexItem.type)) {
          score += 30;
        }
      }
    }

    return score;
  }

  window.PharmoraSearchRanking = {
    computeRelevanceScore
  };
})();
