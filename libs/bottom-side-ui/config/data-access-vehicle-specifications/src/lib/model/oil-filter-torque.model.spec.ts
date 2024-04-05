import { OilFilterTorque } from './oil-filter-torque.model';

describe('OilFilterTorque', () => {
    it('should create an instance with default values', () => {
        const partSpec = new OilFilterTorque();

        expect(partSpec.id).toBe(null);
        expect(partSpec.qualifier).toBe('');
        expect(partSpec.torque_f).toBe('');
        expect(partSpec.torque_n).toBe('');
        expect(partSpec.type).toBe('');
        expect(partSpec.oilFilterProcedure).toStrictEqual([]);
        expect(partSpec.oilFilterType).toStrictEqual([]);
        expect(partSpec.notes).toStrictEqual([]);
    });
});
