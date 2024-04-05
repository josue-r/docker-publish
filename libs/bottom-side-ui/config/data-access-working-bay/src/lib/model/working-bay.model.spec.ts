import { WorkingBay } from './working-bay.model';

describe('WorkingBay', () => {
    it('should create an instance with default values', () => {
        const vehicleSpec = new WorkingBay();

        expect(vehicleSpec.id).toBe(null);
        expect(vehicleSpec.bayNumber).toBe(null);
        expect(vehicleSpec.bayType).toBe(null);
    });
});
