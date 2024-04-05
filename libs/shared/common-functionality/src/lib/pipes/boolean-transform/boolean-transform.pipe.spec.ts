import { BooleanTransformPipe } from './boolean-transform.pipe';

describe('BooleanTransformPipe', () => {
    const pipe = new BooleanTransformPipe();
    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should return Y when boolean field value is true', () => {
        expect(pipe.transform(true)).toBe('Y');
    });

    it('should return N when boolean field value is false', () => {
        expect(pipe.transform(false)).toBe('N');
    });

    it('should not trasnform non boolean field values', () => {
        expect(pipe.transform(undefined)).toBe(undefined);
    });
});
