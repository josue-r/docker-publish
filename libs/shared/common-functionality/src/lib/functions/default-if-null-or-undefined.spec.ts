import { defaultIfNullOrUndefined } from './default-if-null-or-undefined';

describe('defaultIfNullOrUndefined', () => {
    interface Obj {
        foo?: number;
        bar?: string;
    }

    it('should default if null', () => {
        const obj: Obj = { foo: null };
        defaultIfNullOrUndefined(obj, 'foo', 4);

        expect(obj.foo).toEqual(4);
    });
    it('should default if undefined', () => {
        const obj: Obj = {};
        defaultIfNullOrUndefined(obj, 'foo', 4);

        expect(obj.foo).toEqual(4);
    });
    it('should not default if set', () => {
        const obj: Obj = { foo: 0 }; // 0 intentionally set since it is a falsy value
        defaultIfNullOrUndefined(obj, 'foo', 4);

        expect(obj.foo).toEqual(0);
    });
});
