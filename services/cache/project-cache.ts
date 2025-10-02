interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hits: number;
}

export class ProjectCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private readonly maxSize = 100;
  private readonly ttl = 24 * 60 * 60 * 1000;

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    entry.hits += 1;
    return entry.data;
  }

  set(key: string, data: T): void {
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }
    this.cache.set(key, { data, timestamp: Date.now(), hits: 0 });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  private evictLRU(): void {
    let minHits = Infinity;
    let evictKey: string | null = null;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.hits < minHits) {
        minHits = entry.hits;
        evictKey = key;
      }
    }
    if (evictKey) {
      this.cache.delete(evictKey);
    }
  }
}
