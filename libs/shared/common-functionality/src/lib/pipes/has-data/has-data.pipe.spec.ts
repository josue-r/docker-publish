import { HasDataPipe } from './has-data.pipe';

describe('HasDataPipe', () => {
    let pipe: HasDataPipe;

    beforeEach(() => {
        pipe = new HasDataPipe();
    });

    it('should determine if an array has data', () => {
        expect(pipe.transform([0])).toBe(true);
        expect(pipe.transform(['value1', 'value2'])).toBe(true);
        expect(pipe.transform([])).toBe(false);
        expect(pipe.transform(null)).toBe(false);
        expect(pipe.transform(undefined)).toBe(false);
    });

    it('should determine if a set has data', () => {
        expect(pipe.transform(new Set([3]))).toBe(true);
        expect(pipe.transform(new Set(['abc', 'def']))).toBe(true);
        expect(pipe.transform(new Set())).toBe(false);
        expect(pipe.transform(null)).toBe(false);
        expect(pipe.transform(undefined)).toBe(false);
    });

    it('should determine if a map has data', () => {
        expect(pipe.transform(new Map([[5, { value: 3 }]]))).toBe(true);
        expect(
            pipe.transform(
                new Map([
                    ['key1', 4],
                    ['key2', 9],
                ])
            )
        ).toBe(true);
        expect(pipe.transform(new Map())).toBe(false);
        expect(pipe.transform(null)).toBe(false);
        expect(pipe.transform(undefined)).toBe(false);
    });

    it('should throw an error for an unsupported data type', () => {
        const expectedError = 'Unhandled value type passed to HasDataPipe';
        expect(() => pipe.transform('')).toThrowError(expectedError);
        expect(() => pipe.transform('test')).toThrowError(expectedError);
        expect(() => pipe.transform(5)).toThrowError(expectedError);
        expect(() => pipe.transform({ value: 3 })).toThrowError(expectedError);
        expect(() => pipe.transform({ length: 3 })).toThrowError(expectedError);
    });
});
