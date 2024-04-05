import { isEmptyInputValue } from './is-empty-input-value';

describe('isEmptyInputValue', () => {
    it('should return true if null passed', () => {
        expect(isEmptyInputValue(null)).toBeTruthy();
    });
    it('should return true if undefined passed', () => {
        expect(isEmptyInputValue(undefined)).toBeTruthy();
    });
    it('should return true if empty array passed', () => {
        expect(isEmptyInputValue([])).toBeTruthy();
    });
    it('should return true if empty string passed', () => {
        expect(isEmptyInputValue('')).toBeTruthy();
    });
    it('should return false if anything else passed', () => {
        expect(isEmptyInputValue(0)).toBeFalsy();
        expect(isEmptyInputValue(1)).toBeFalsy();
        expect(isEmptyInputValue({})).toBeFalsy();
    });
});
