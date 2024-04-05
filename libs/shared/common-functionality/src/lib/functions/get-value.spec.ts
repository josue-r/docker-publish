import { getValue } from './get-value';

describe('getValue', () => {
    it('should return a string value if the propertyPath points to a string', () => {
        const value = 'areaCode';
        expect(getValue({ store: { area: { code: value } } }, 'store.area.code')).toEqual(value);
    });
    it('should return an object value if the propertyPath points to an object', () => {
        const value = { code: 'areaCode' };
        expect(getValue({ store: { area: value } }, 'store.area')).toEqual(value);
    });
    it('should return null if property path points to null field', () => {
        expect(getValue({ store: { area: null } }, 'store.area')).toBeNull();
    });
    it('should return undefined if property path points to an undefined field', () => {
        expect(getValue({ store: { area: undefined } }, 'store.area')).toBeUndefined();
    });
    it('should return null if attempting to get a property off of a null field', () => {
        expect(getValue({ store: { area: null } }, 'store.area.code')).toBeNull();
    });
    it('should return undefined if attempting to get a property off of an undefined field', () => {
        expect(getValue({ store: { area: undefined } }, 'store.area.code')).toBeUndefined();
        expect(getValue({ store: { area: undefined } }, 'store.company')).toBeUndefined();
    });
});
