import { throwIfAlreadyLoaded } from './module-import-guard';

describe('throwIfAlreadyLoaded', () => {
    it('should throw error if already loaded', () => {
        expect(() => throwIfAlreadyLoaded({}, 'TestModule')).toThrowError(
            'TestModule has already been loaded. Import non-shared modules in the AppModule only.'
        );
    });

    it('should not throw error if not already loaded', () => {
        expect(() => throwIfAlreadyLoaded(undefined, 'TestModule')).not.toThrowError();
    });
});
