// Mock NativeEventEmitter for web compatibility
class MockNativeEventEmitter {
  constructor() {
    this.listeners = new Map();
  }

  addListener(eventType, listener) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(listener);
    
    return {
      remove: () => {
        const eventListeners = this.listeners.get(eventType);
        if (eventListeners) {
          eventListeners.delete(listener);
        }
      }
    };
  }

  removeAllListeners(eventType) {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }

  removeSubscription(subscription) {
    if (subscription && subscription.remove) {
      subscription.remove();
    }
  }

  emit(eventType, ...args) {
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.warn('Error in event listener:', error);
        }
      });
    }
  }
}

module.exports = MockNativeEventEmitter;