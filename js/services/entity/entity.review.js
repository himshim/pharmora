/*
  Pharmora Universal Entity Review Wrapper Service
  v3.0.0
*/
(function() {
  async function approve(uuid, reviewer = "moderator") {
    if (typeof PharmoraEntityWorkflow === "undefined") return null;
    return await PharmoraEntityWorkflow.transitionTo(uuid, PharmoraEntityWorkflow.WorkflowStates.APPROVED, reviewer);
  }

  async function reject(uuid, reviewer = "moderator") {
    if (typeof PharmoraEntityWorkflow === "undefined") return null;
    return await PharmoraEntityWorkflow.transitionTo(uuid, PharmoraEntityWorkflow.WorkflowStates.REJECTED || "rejected", reviewer);
  }

  async function requestChanges(uuid, comments = "", reviewer = "moderator") {
    if (typeof PharmoraEntityWorkflow === "undefined") return null;
    return await PharmoraEntityWorkflow.transitionTo(uuid, PharmoraEntityWorkflow.WorkflowStates.NEEDS_CHANGES, reviewer, { comments });
  }

  async function publish(uuid, actor = "system") {
    if (typeof PharmoraEntityWorkflow === "undefined") return null;
    return await PharmoraEntityWorkflow.transitionTo(uuid, PharmoraEntityWorkflow.WorkflowStates.PUBLISHED, actor);
  }

  async function archive(uuid, actor = "system") {
    if (typeof PharmoraEntityWorkflow === "undefined") return null;
    return await PharmoraEntityWorkflow.transitionTo(uuid, PharmoraEntityWorkflow.WorkflowStates.ARCHIVED, actor);
  }

  async function restore(uuid, actor = "system") {
    if (typeof PharmoraEntityWorkflow === "undefined") return null;
    return await PharmoraEntityWorkflow.transitionTo(uuid, PharmoraEntityWorkflow.WorkflowStates.DRAFT, actor);
  }

  window.PharmoraEntityReview = {
    approve,
    reject,
    requestChanges,
    publish,
    archive,
    restore
  };
})();
