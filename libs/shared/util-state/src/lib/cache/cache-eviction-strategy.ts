import { CacheEntry } from './cache-entry';

/** Prioritizes cache entry where the ones that should evict first are at the end of the array.. */
export abstract class CacheEvictionStrategy {
    /**
     *  Prioritize the entries such that the ones at the bottom of the array should be evicted first. This is usually done via Array.sort().
     *
     * @template T
     * @param {CacheEntry<T>[]} entries
     * @memberof CacheEvictionStrategy
     */
    abstract prioritize<T>(entries: CacheEntry<T>[]): void;
}
