import { of } from 'rxjs';
import { ParameterState } from './parameter.state';

describe('ParameterState', () => {
    let state: ParameterState;
    beforeEach(() => {
        state = new ParameterState();
    });

    it('should create an instance', () => {
        expect(state).toBeTruthy();
    });

    describe('findSystemParameterValue', () => {
        it('should return undefined if not cached', () => {
            expect(state.findSystemParameterValue('TEST_PARAM')).toBeNull();
        });

        it('should return an observable if cached', () => {
            // put something in cache
            state['findCachedSystemParameterValue'].put('TEST_PARAM', of('test'));

            expect(state.findSystemParameterValue('TEST_PARAM')).toBeDefined();
        });
    });

    describe('findCompanyParameterValue', () => {
        it('should return undefined if not cached', () => {
            expect(state.findCompanyParameterValue('TEST_PARAM', '111')).toBeNull();
        });

        it('should return an observable if cached', async () => {
            // put something in cache
            state['findCachedCompanyParameterValue'].put('TEST_PARAM.111', of('test'));

            const result = await state.findCompanyParameterValue('TEST_PARAM', '111').toPromise();
            expect(result).toBe('test');
        });
    });

    describe('findStoreParameterValue', () => {
        it('should return undefined if not cached', () => {
            expect(state.findStoreParameterValue('TEST_PARAM', '111')).toBeNull();
        });

        it('should return an observable if cached', () => {
            // put something in cache
            state['findCachedStoreParameterValue'].put('TEST_PARAM', of('test'));

            expect(state.findStoreParameterValue('TEST_PARAM', '111')).toBeDefined();
        });
    });

    describe('cacheSystemParameter', () => {
        it('should cache and return observable based on the key', async () => {
            state.cacheSystemParameter(of('test'), 'TEST_PARAM').toPromise();

            // should return null when the key doesn't exist
            expect(state.findSystemParameterValue('TEST_PARAM2')).toBeNull();
            expect(state.findCompanyParameterValue('TEST_PARAM', '111')).toBeNull();
            expect(state.findStoreParameterValue('TEST_PARAM', '111')).toBeNull();
            const result = await state.findSystemParameterValue('TEST_PARAM').toPromise();
            expect(result).toBe('test');
        });
    });

    describe('cacheCompanyParameter', () => {
        it('should cache and return observable based on the key', async () => {
            state.cacheCompanyParameter(of('test'), 'TEST_PARAM', '111').toPromise();

            // should return null when the key doesn't exist
            expect(state.findSystemParameterValue('TEST_PARAM')).toBeNull();
            expect(state.findCompanyParameterValue('TEST_PARAM', '123')).toBeNull();
            expect(state.findStoreParameterValue('TEST_PARAM', '111')).toBeNull();
            const result = await state.findCompanyParameterValue('TEST_PARAM', '111').toPromise();
            expect(result).toBe('test');
        });
    });

    describe('cacheStoreParameter', () => {
        it('should cache and return observable based on the key', async () => {
            state.cacheStoreParameter(of('test'), 'TEST_PARAM', '111').toPromise();

            // should return null when the key doesn't exist
            expect(state.findSystemParameterValue('TEST_PARAM')).toBeNull();
            expect(state.findCompanyParameterValue('TEST_PARAM', '111')).toBeNull();
            expect(state.findStoreParameterValue('TEST_PARAM', '123')).toBeNull();
            const result = await state.findStoreParameterValue('TEST_PARAM', '111').toPromise();
            expect(result).toBe('test');
        });
    });
});
