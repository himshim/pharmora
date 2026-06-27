/*
  Pharmora Universal Entity Capabilities Service
  v2.0.0
*/
(function() {
  const CapabilityPermissions = {
    "read": ["content.read", "content.view"],
    "create": ["content.create", "content.submit"],
    "edit": ["content.edit", "content.update"],
    "delete": ["content.delete", "content.remove"],
    "archive": ["content.archive"],
    "publish": ["content.publish", "content.approve"],
    "review": ["content.review", "content.moderate"],
    "verify": ["content.verify", "verified.creator"],
    "comment": ["content.comment", "forum.reply"],
    "bookmark": ["content.bookmark"],
    "download": ["content.download"],
    "upload": ["content.upload"],
    "attach": ["content.attach"],
    "version": ["content.version"],
    "share": ["content.share"],
    "search": ["content.search"],
    "report": ["content.report"]
  };

  async function checkGlobalPermission(action) {
    if (typeof hasPermission !== "function") {
      const user = typeof currentUser === "function" ? currentUser() : null;
      if (!user) return false;
      return user.role === "admin" || user.role === "owner" || user.role === "moderator";
    }

    const perms = CapabilityPermissions[action] || [`content.${action}`];
    for (const perm of perms) {
      if (await hasPermission(perm)) {
        return true;
      }
    }
    return false;
  }

  async function can(entity, action) {
    if (!entity) return false;

    const user = typeof currentUser === "function" ? currentUser() : null;
    if (!user) return false;

    // 1. Owner bypass
    if (user.role === "owner") return true;

    // 2. Resource ownership check
    const isResourceOwner = 
      entity.owner === user.id || 
      entity.ownership?.ownerId === user.id ||
      entity.userId === user.id;

    if (isResourceOwner) {
      // Owner can read, edit, delete, version, share, archive their own content
      if (["read", "edit", "delete", "version", "share", "archive", "comment", "bookmark"].includes(action)) {
        return true;
      }
    }

    // 3. RBAC general permission check
    return await checkGlobalPermission(action);
  }

  async function canType(typeName, action) {
    const user = typeof currentUser === "function" ? currentUser() : null;
    if (!user) return false;
    if (user.role === "owner" || user.role === "admin") return true;

    return await checkGlobalPermission(action);
  }

  window.PharmoraCapabilities = {
    can,
    canType,
    CapabilityPermissions
  };
})();
