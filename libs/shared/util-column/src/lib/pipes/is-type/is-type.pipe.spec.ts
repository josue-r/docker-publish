import { Column } from '../../models/column';
import { CustomType, EnumType, ObjectType } from '../../models/column-type';
import { IsTypePipe } from './is-type.pipe';

describe('IsTypePipe', () => {
    let pipe: IsTypePipe;

    beforeEach(() => {
        pipe = new IsTypePipe();
    });

    it('should compare basic types', () => {
        const columnWithAType = Column.of({ name: 'testColumn', apiFieldPath: 'test', type: 'currency' });
        expect(pipe.transform(columnWithAType.type, 'currency')).toBe(true);
        expect(pipe.transform('boolean', 'boolean')).toBe(true);
        expect(pipe.transform('boolean', 'string')).toBe(false);
        expect(pipe.transform('decimal', columnWithAType.type)).toBe(false);
    });

    it('should compare object types', () => {
        const objectType = { entityType: 'Category' };
        expect(pipe.transform(objectType, { entityType: 'Category' })).toBe(true);
        expect(pipe.transform(objectType, { entityType: 'Category', miscData: 'data' } as ObjectType)).toBe(true);
        expect(pipe.transform(objectType, { entityType: 'Service' })).toBe(false);
        expect(pipe.transform('string', objectType)).toBe(false);
        expect(pipe.transform(objectType, { enum: 'pricingStrategy' })).toBe(false);
    });

    it('should compare enum types', () => {
        const enumType = { enum: 'pricingStrategy' };
        expect(pipe.transform(enumType, { enum: 'pricingStrategy' })).toBe(true);
        expect(pipe.transform(enumType, { enum: 'pricingStrategy', miscData: 'data' } as EnumType)).toBe(true);
        expect(pipe.transform(enumType, { enum: 'logLevel' })).toBe(false);
        expect(pipe.transform('string', enumType)).toBe(false);
        expect(pipe.transform(enumType, { entityType: 'Category' })).toBe(false);
    });

    it('should compare custom types', () => {
        const customType = { customType: 'vehicleYear', inputType: 'integer' };
        expect(pipe.transform(customType, { customType: 'vehicleYear', inputType: 'integer' })).toBe(true);
        expect(
            pipe.transform(customType, {
                customType: 'vehicleYear',
                inputType: 'integer',
                miscData: 'data',
            } as CustomType)
        ).toBe(true);
        expect(pipe.transform(customType, { customType: 'logLevel', inputType: 'integer' })).toBe(false);
        expect(pipe.transform('string', customType)).toBe(false);
        expect(pipe.transform(customType, { customType: 'Category', inputType: 'integer' })).toBe(false);
    });
});
