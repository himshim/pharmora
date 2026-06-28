/*
  Pharmora Universal Entity Workflow Engine
  v3.0.0
*/
(function() {
  const WorkflowStates = {
    DRAFT: "draft",
    PENDING_REVIEW: "pending_review",
    NEEDS_CHANGES: "needs_changes",
    APPROVED: "approved",
    PUBLISHED: "published",
    SCHEDULED: "scheduled",
    ARCHIVED: "archived",
    DELETED: "deleted"
  };

  async function transitionTo(uuid, targetStatus, actor = "system", metadata = {}) {
    if (typeof PharmoraEntityAPI === "undefined") return null;

    const entity = await PharmoraEntityAPI.getEntity(uuid);
    if (!entity) throw new Error("Entity not found for workflow transition");

    const previousStatus = entity.status;
    if (previousStatus === targetStatus) return entity;

    // Validate Capabilities
    if (typeof PharmoraCapabilities !== "undefined") {
      let capAction = "edit";
      if ([WorkflowStates.APPROVED, WorkflowStates.PUBLISHED].includes(targetStatus)) {
        capAction = "publish";
      } else if (targetStatus === WorkflowStates.DELETED) {
        capAction = "delete";
      } else if (targetStatus === WorkflowStates.ARCHIVED) {
        capAction = "archive";
      }
      const isAllowed = await PharmoraCapabilities.can(entity, capAction);
      if (!isAllowed) {
        throw new Error(`Unauthorized: User cannot perform '${capAction}' on entity ${entity.type}`);
      }
    }

    // Capture changes for audit
    const changes = {
      status: { from: previousStatus, to: targetStatus },
      ...metadata
    };

    // Update status and version snapshot
    const updateData = {
      status: targetStatus,
      version: entity.version + 1,
      timestamps: {
        ...entity.timestamps,
        updated: new Date().toISOString()
      }
    };

    if (targetStatus === WorkflowStates.PUBLISHED) {
      updateData.timestamps.published = new Date().toISOString();
    }

    // Set reviewer if transition is from review
    if (targetStatus === WorkflowStates.APPROVED || targetStatus === WorkflowStates.NEEDS_CHANGES) {
      if (!entity.metadata) entity.metadata = {};
      entity.metadata.reviewer = actor;
      entity.metadata.reviewedAt = new Date().toISOString();
      updateData.metadata = entity.metadata;
    }

    // Log audit entry
    entity.addAuditLog("transition", actor, changes);
    updateData.auditTrail = entity.auditTrail;

    // Trigger snapshot creation
    if (typeof PharmoraEntityVersioning !== "undefined") {
      PharmoraEntityVersioning.createSnapshot(entity, actor);
      updateData.metadata = {
        ...(entity.metadata || {}),
        versions: entity.metadata?.versions || []
      };
    }

    // Write updates to DB
    const updated = await PharmoraEntityAPI.updateEntity(uuid, updateData, actor);

    // Trigger dynamic notifications
    if (typeof PharmoraNotify !== "undefined" && entity.owner) {
      await PharmoraNotify.send(entity.owner, {
        title: `Workflow transition: ${entity.type}`,
        message: `Your contribution "${entity.content?.title || entity.content?.name || entity.publicId}" has transitioned to ${targetStatus}.`,
        type: targetStatus === "approved" || targetStatus === "published" ? "success" : "info"
      });
    }

    // Trigger Entity Events
    if (typeof PharmoraEntityEvents !== "undefined") {
      if (targetStatus === WorkflowStates.PUBLISHED) {
        await PharmoraEntityEvents.emit(PharmoraEntityEvents.EventTypes.EntityPublished, updated);
      } else {
        await PharmoraEntityEvents.emit(PharmoraEntityEvents.EventTypes.EntityUpdated, updated);
      }
    }

    return updated;
  }

  window.PharmoraEntityWorkflow = {
    WorkflowStates,
    transitionTo
  };
})();
