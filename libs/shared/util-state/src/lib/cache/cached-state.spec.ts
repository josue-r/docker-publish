import { defer, EMPTY, of } from 'rxjs';
import { CacheEntry } from './cache-entry';
import { CachedState } from './cached-state';

describe('CachedState', () => {
    describe('get', () => {
        it('should return null if entry not present and no initializer passed', () => {
            const cache = new CachedState<string>();

            const value = cache.get('key1');

            expect(value).toBeNull();
        });

        it('should return the cached value if it is present', async () => {
            const cache = new CachedState<string>();
            cache.put('key1', of('value1'));

            jest.spyOn(cache['evictionStrategy'], 'prioritize');
            expect(await cache.get('key1').toPromise()).toEqual('value1');
            // should reprioritize on read
            expect(cache['evictionStrategy'].prioritize).toHaveBeenCalledTimes(1);
        });

        it('should remove expired entries', async () => {
            const cache = new CachedState<string>();
            cache['cache'].push(new CacheEntry('key1', of('value1'), /*expiration*/ 1));
            cache['cache'].push(new CacheEntry('key2', of('value2'), /*expiration*/ undefined));
            expect(cache['cache'].map((e) => e.key)).toEqual(['key1', 'key2']); // all keys including expired
            expect(cache.keys).toEqual(['key2']); // exclude expired

            expect(cache.get('key1')).toBeNull();

            expect(cache['cache'].map((e) => e.key)).toEqual(['key2']); // all keys including expired
            expect(cache.keys).toEqual(['key2']);
        });
    });

    describe('put', () => {
        it('should put element in the cache', async () => {
            const cache = new CachedState<string>({ evictionStrategy: 'fifo' });
            jest.spyOn(cache['evictionStrategy'], 'prioritize');

            cache.put('key1', of('value1'));
            cache.put('key2', of('value2'));
            cache.put('key3', of('value3'));

            // should reprioritize on put
            expect(cache['evictionStrategy'].prioritize).toHaveBeenCalledTimes(3);
            expect(cache.keys).toEqual(['key3', 'key2', 'key1']);
            expect(await cache.get('key1').toPromise()).toEqual('value1');
            expect(await cache.get('key2').toPromise()).toEqual('value2');
            expect(await cache.get('key3').toPromise()).toEqual('value3');
        });

        it('should track expiration if applicable', async () => {
            const cache = new CachedState<string>({ expirationSeconds: 60 });
            jest.spyOn(Date, 'now').mockReturnValue(100_000);

            cache.put('key1', of('value1'));

            const entry = cache['cache'].filter((e) => e.key === 'key1')[0];
            expect(entry.expirationTime).toEqual(160_000);
        });

        it('should put make the observable replayable', async () => {
            // Everytime this executes, it will return a new values
            let index = 0;
            const nonReplayable = defer(() => Promise.resolve(`${index++}`));
            // verify that it is not replayable
            expect(await nonReplayable.toPromise()).toEqual('0');
            expect(await nonReplayable.toPromise()).toEqual('1');

            // cache
            const cache = new CachedState<string>();
            cache.put('key1', nonReplayable);

            // verify the cached one is replayable
            expect(await cache.get('key1').toPromise()).toEqual('2');
            expect(await cache.get('key1').toPromise()).toEqual('2');
            expect(await cache.get('key1').toPromise()).toEqual('2');
        });

        it('should remove expired enties before trimming the cache to support max size ', async () => {
            const cache = new CachedState<string>({ maxSize: 2, evictionStrategy: 'fifo' });
            cache['cache'].push(new CacheEntry('key1', of('value1'), 200));
            cache['cache'].push(new CacheEntry('key2', of('value2'), 100)); //expired
            expect(cache['cache'].map((e) => e.key)).toEqual(['key1', 'key2']); // all keys including expired

            jest.spyOn(Date, 'now').mockReturnValue(150); // key2 should be expired now
            cache.put('key3', of('value3'));

            expect(cache['cache'].map((e) => e.key)).toEqual(['key3', 'key1']); // all keys including expired
        });

        it('should trim the cache to support max size if no expired entities', async () => {
            const cache = new CachedState<string>({ maxSize: 2, evictionStrategy: 'fifo' });
            cache.put('key1', of('value1')); //oldest
            cache.put('key2', of('value2')); // newest

            expect(cache.keys).toEqual(['key2', 'key1']);

            cache.put('key3', of('value3')); // bumps key1 due to max size
            expect(cache.keys).toEqual(['key3', 'key2']);
        });

        it('should replace the current value if one is present', async () => {
            const cache = new CachedState<string>();
            cache.put('key1', of('value1'));
            cache.put('key2', of('value2'));

            expect(cache.keys).toEqual(['key2', 'key1']);
            expect(await cache.get('key1').toPromise()).toEqual('value1');

            cache.put('key2', of('VALUE2'));
            expect(cache.keys).toEqual(['key2', 'key1']);
            expect(await cache.get('key2').toPromise()).toEqual('VALUE2');
        });
    });

    describe('clear', () => {
        it('should remove all entries from cache', () => {
            const cache = new CachedState<string>();
            cache.put('key1', EMPTY);
            cache.put('key2', EMPTY);

            cache.clear();

            expect(cache).toHaveLength(0);
            expect(cache.get('key1')).toBeNull();
            expect(cache.get('key2')).toBeNull();
        });
    });
    describe('remove', () => {
        it('should remove only the requested key from the cache', () => {
            const cache = new CachedState<string>();
            cache.put('key1', EMPTY);
            cache.put('key2', EMPTY);
            expect(cache).toHaveLength(2);

            cache.remove('key2');

            expect(cache.get('key1')).not.toBeNull();
            expect(cache.get('key2')).toBeNull();
            expect(cache).toHaveLength(1);
        });

        it('should do nothing if request element does not exist', () => {
            const cache = new CachedState<string>();
            cache.put('key1', EMPTY);
            expect(cache).toHaveLength(1);

            cache.remove('key2');

            expect(cache.get('key1')).not.toBeNull();
            expect(cache).toHaveLength(1);
        });
    });

    it.each`
        strategy  | puts       | gets             | expectedKeys | description
        ${'fifo'} | ${'a,b,c'} | ${'a,b,c'}       | ${'c,b,a'}   | ${'get in same order as inserted'}
        ${'fifo'} | ${'a,b,c'} | ${'c,b,a'}       | ${'c,b,a'}   | ${' get in revers order as inserted'}
        ${'lfu'}  | ${'a,b,c'} | ${'c,b,a'}       | ${'c,b,a'}   | ${'all used once, defer to fifo'}
        ${'lfu'}  | ${'a,b,c'} | ${'c,b,a,a,a,b'} | ${'a,b,c'}   | ${'a called 3 times, b called twice, c once'}
        ${'lru'}  | ${'a,b,c'} | ${'c,b,a'}       | ${'a,b,c'}   | ${'a fetched most recently, then b, then c'}
        ${'lru'}  | ${'a,b,c'} | ${'c,b,a,a,a,b'} | ${'b,a,c'}   | ${'b fetched most recently, then a, then c'}
    `(
        'should keep the entries prioritized for $strategy puts=$puts gets=$gets expected=$expectedKeys',
        async ({ strategy, puts, gets, expectedKeys }) => {
            // makes read time distinct for each call to Date.now()
            let currentTime = 10_000;
            jest.spyOn(Date, 'now').mockImplementation(() => (currentTime += 10));

            const cache = new CachedState({ evictionStrategy: strategy });
            // put elements in cache in order
            (puts as string).split(',').forEach((key) => cache.put(key, EMPTY));

            // get elements from cache
            const keysToRead = (gets as string).split(',');
            keysToRead.forEach((key) => {
                cache.get(key);
            });

            // verify the expected keys are in order
            expect(cache.keys).toEqual((expectedKeys as string).split(','));
        }
    );
});
