export class CacheConfig {
    /**
     * The maximum size of the cache.  Defaults to unlimited.
     */
    maxSize?: number;

    /**
     * The maximum duration in seconds of elements in the cache.  Defaults to unlimited (no expiration)
     */
    expirationSeconds?: number;

    /**
     * The strategy for removing the elements from the cache when the maxSize is reached. Has no impact if maxSize is not set.
     *
     * - lru - Least Recently Used is evicted first
     * - lfu - Least Frequently Used is evicted first
     * - fifo - First in, first out.
     *
     * @type {('lru' | 'lfu' | 'fifo')}
     * @memberof CacheConfig
     */
    evictionStrategy?: 'lru' | 'lfu' | 'fifo' = 'lfu';
}
