/**
 * High-performance client-side cache utility for Study Kit
 * Caches AI generations (quizzes, summaries, flashcards) in memory and sessionStorage
 * to ensure 0ms instantaneous loads on repeated requests.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresInMs: number;
}

class ClientCache {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL = 1000 * 60 * 60 * 24; // 24 hours

  private generateKey(prefix: string, payload: any): string {
    if (typeof payload === 'string') {
      return `${prefix}:${payload}`;
    }
    try {
      // Deterministic sorted string
      const str = JSON.stringify(payload, Object.keys(payload).sort());
      // Simple fast hash
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
      }
      return `${prefix}:${Math.abs(hash)}`;
    } catch {
      return `${prefix}:${Date.now()}`;
    }
  }

  public get<T>(prefix: string, params: any): T | null {
    const key = this.generateKey(prefix, params);
    const now = Date.now();

    // 1. Check in-memory cache first (0ms)
    if (this.memoryCache.has(key)) {
      const entry = this.memoryCache.get(key)!;
      if (now - entry.timestamp < entry.expiresInMs) {
        return entry.data as T;
      }
      this.memoryCache.delete(key);
    }

    // 2. Check sessionStorage
    try {
      const stored = sessionStorage.getItem(`studykit_cache_${key}`);
      if (stored) {
        const parsed: CacheEntry<T> = JSON.parse(stored);
        if (now - parsed.timestamp < parsed.expiresInMs) {
          // Promote to memory
          this.memoryCache.set(key, parsed);
          return parsed.data;
        }
        sessionStorage.removeItem(`studykit_cache_${key}`);
      }
    } catch {
      // ignore storage errors
    }

    return null;
  }

  public set<T>(prefix: string, params: any, data: T, ttlMs = this.defaultTTL): void {
    const key = this.generateKey(prefix, params);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresInMs: ttlMs,
    };

    // Store in memory
    this.memoryCache.set(key, entry);

    // Limit memory size
    if (this.memoryCache.size > 150) {
      const firstKey = this.memoryCache.keys().next().value;
      if (firstKey) this.memoryCache.delete(firstKey);
    }

    // Store in sessionStorage
    try {
      sessionStorage.setItem(`studykit_cache_${key}`, JSON.stringify(entry));
    } catch {
      // ignore quota exceeded
    }
  }

  public clear(): void {
    this.memoryCache.clear();
    try {
      const keys = Object.keys(sessionStorage);
      for (const k of keys) {
        if (k.startsWith('studykit_cache_')) {
          sessionStorage.removeItem(k);
        }
      }
    } catch {
      // ignore
    }
  }
}

export const studyCache = new ClientCache();
