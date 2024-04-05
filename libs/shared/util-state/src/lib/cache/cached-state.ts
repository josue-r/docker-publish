import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { CacheConfig } from './cache-config';
import { CacheEntry } from './cache-entry';
import { CacheEvictionStrategy } from './cache-eviction-strategy';

export class CachedState<T> {
    private cache: CacheEntry<T>[] = [];
    private maxSize: number;
    private expirationSeconds: number;
    private evictionStrategy: CacheEvictionStrategy;

    constructor(config?: CacheConfig) {
        this.maxSize = config && config.maxSize; // default to unlimited size
        this.expirationSeconds = config && config.expirationSeconds; // default to no expiration

        const evictionStrategyAsString = (config && config.evictionStrategy) || 'lru';
        switch (evictionStrategyAsString) {
            case 'lru': {
                this.evictionStrategy = new Lru();
                break;
            }
            case 'lfu': {
                this.evictionStrategy = new Lfu();
                break;
            }
            case 'fifo': {
                this.evictionStrategy = new Fifo();
                break;
            }
            default:
                throw Error(`unhandled eviction strategy: "${evictionStrategyAsString}"`);
        }
    }

    /**
     * Fetch the cache entry for the specified key or null if not found or expired.
     *
     * @private
     * @param {string} key
     * @returns
     * @memberof Cache
     */
    private getCacheEntry(key: string): CacheEntry<T> {
        const entryIndex = this.cache.findIndex((cache) => cache.key === key);
        if (entryIndex < 0) {
            // -1 if not found
            return null;
        }
        const cacheEntry = this.cache[entryIndex];
        if (cacheEntry.expired) {
            this.cache.splice(entryIndex, 1);
            return null;
        }
        return cacheEntry;
    }

    /**
     * Fetches the cached value. If the value exists and is not expired, return it.  Otherwise, return null.
     *
     * @param {string} key
     * @returns {Observable<T>}
     * @memberof Cache
     */
    get(key: string): Observable<T> {
        const cacheEntry = this.getCacheEntry(key);
        if (!cacheEntry) {
            return null;
        } else {
            cacheEntry.readCount++;
            cacheEntry.readTime = Date.now();
            this.evictionStrategy.prioritize(this.cache);
        }
        return cacheEntry.value;
    }

    /**
     * Puts the passed value in the cache.
     *
     * If the entry already exists, it is replaced
     *
     * If the maximum size is exceeded, elements will be removed based on expiration and evictionStrategy.
     *
     * @param {string} key
     * @param {Observable<T>} value
     * @memberof Cache
     */
    put(key: string, value: Observable<T>): Observable<T> {
        // remove current entry if present
        const entryIndex = this.cache.findIndex((cache) => cache.key === key);
        if (entryIndex >= 0) {
            this.cache.splice(entryIndex, 1);
        }

        // Add the new values
        const expirationTime = this.expirationSeconds ? Date.now() + this.expirationSeconds * 1000 : undefined;
        const replayableValue = value.pipe(shareReplay());
        this.cache.unshift(new CacheEntry(key, replayableValue, expirationTime));
        this.evictionStrategy.prioritize(this.cache);

        // Enforce max size
        if (this.cache.length > this.maxSize) {
            // attempt to remove expired entries
            this.cache = this.cache.filter((e) => !e.expired);
            // if still too big, trim the array
            if (this.cache.length > this.maxSize) {
                this.cache.length = this.maxSize;
            }
        }
        return replayableValue;
    }

    /** Clears all items from the cache */
    clear(): void {
        this.cache.length = 0;
    }

    /** The number of elements in the cache. */
    get length() {
        return this.cache.filter((e) => !e.expired).length;
    }

    /** All of the keys elements in the cache, prioritized by eviction strategy. */
    get keys() {
        return this.cache.filter((e) => !e.expired).map((e) => e.key);
    }

    /** Removes the requestd key from the cache if present.  Does nothing if not present. */
    remove(key: string): void {
        const entryIndex = this.cache.findIndex((cache) => cache.key === key);
        if (entryIndex >= 0) {
            this.cache.splice(entryIndex, 1);
        }
    }
}

/**
 * The Least Recently Used entry is evicted first.
 */
class Lru extends CacheEvictionStrategy {
    prioritize<T>(entries: CacheEntry<T>[]): void {
        entries.sort((a, b) => b.readTime - a.readTime);
    }
}

/**
 * The Least Fequently Used entry is evicted first.
 */
class Lfu extends CacheEvictionStrategy {
    prioritize<T>(entries: CacheEntry<T>[]): void {
        entries.sort((a, b) => b.readCount - a.readCount);
    }
}
/**
 * First-In-First-Out: The oldest entry is evicted first.
 */
class Fifo extends CacheEvictionStrategy {
    prioritize<T>(entries: CacheEntry<T>[]): void {
        // Assumes tha the Cache always adds to front of list
    }
}
