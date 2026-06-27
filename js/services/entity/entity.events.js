/*
  Pharmora Universal Entity Events
  v2.0.0
*/
(function() {
  const listeners = new Map();

  const EventTypes = {
    EntityCreated: "EntityCreated",
    EntityUpdated: "EntityUpdated",
    EntityDeleted: "EntityDeleted",
    EntityPublished: "EntityPublished"
  };

  function subscribe(eventType, callback) {
    if (!listeners.has(eventType)) {
      listeners.set(eventType, new Set());
    }
    listeners.get(eventType).add(callback);
    return () => unsubscribe(eventType, callback);
  }

  function unsubscribe(eventType, callback) {
    if (listeners.has(eventType)) {
      listeners.get(eventType).delete(callback);
    }
  }

  async function emit(eventType, data) {
    if (!listeners.has(eventType)) return;
    const targets = Array.from(listeners.get(eventType));
    for (const callback of targets) {
      try {
        await callback(data);
      } catch (err) {
        console.error(`Error in event listener for ${eventType}:`, err);
      }
    }
  }

  window.PharmoraEntityEvents = {
    EventTypes,
    subscribe,
    unsubscribe,
    emit
  };
})();
