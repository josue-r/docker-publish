import { isNullOrUndefined } from './is-null-or-undefined';

describe('IsNullOrUndefined', () => {
    it('should return true if null passed', () => {
        expect(isNullOrUndefined(null)).toBeTruthy();
    });
    it('should return true if undefined passed', () => {
        expect(isNullOrUndefined(undefined)).toBeTruthy();
    });
    it('should return false if anything else passed', () => {
        expect(isNullOrUndefined(0)).toBeFalsy();
        expect(isNullOrUndefined(1)).toBeFalsy();
        expect(isNullOrUndefined({})).toBeFalsy();
        expect(isNullOrUndefined([])).toBeFalsy();
        expect(isNullOrUndefined('')).toBeFalsy();
    });
});
