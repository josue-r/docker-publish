import { Observable } from 'rxjs';

export class CacheEntry<T> {
    constructor(
        /** The key of the element */
        public key: string,
        /** The cached value */
        public value: Observable<T>,
        /** The cache expires at this time. */
        public expirationTime?: number,
        /** The time that the cache was last read */
        public readTime = Date.now(),
        /** Count of total times this entry has been last read */
        public readCount = 1
    ) {}

    /** Returns true if expired */
    get expired(): boolean {
        return this.expirationTime && this.expirationTime < Date.now();
    }
}
