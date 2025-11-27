// Simple cache system for sharing App ID between components
export let CACHE: Cache

export class Cache {
  public readonly APP_ID_KEY = "APP_ID"
  public readonly KEYSHOP_PREF_KEY = "KEYSHOP_PREF"

  constructor() {
    
  }

  static init() {
    CACHE = new Cache();
    CACHE.setInitialValue(CACHE.KEYSHOP_PREF_KEY, true);
  }

  private cache: Partial<Record<string, any>> = {};
  private subscribers: Map<string, () => void> = new Map();

  setInitialValue(key: string, value: any) {
    if (typeof this.cache[key] === "undefined") {
      this.cache[key] = value;
    }
  }

  subscribe(id: string, callback: () => void): void {
    this.subscribers.set(id, callback);
  }

  unsubscribe(id: string): void {
    this.subscribers.delete(id);
  }

  notifySubscribers() {
    for (const callback of this.subscribers.values()) {
      callback();
    }
  }

  async loadValue(key: string) {
    if (Object.prototype.hasOwnProperty.call(this.cache, key)) {
      return this.cache[key];
    }
    return undefined;
  }

  async setValue(key: string, value: any) {
    const oldValue = await this.loadValue(key)
    if(oldValue !== value){
      this.cache[key] = value;
      this.notifySubscribers();
    }
  }
}

