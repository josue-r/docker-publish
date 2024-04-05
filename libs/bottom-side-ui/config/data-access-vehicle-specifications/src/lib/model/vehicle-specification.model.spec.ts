import { VehicleSpecification } from './vehicle-specification.model';

describe('VehicleSpecification', () => {
    it('should create an instance with default values', () => {
        const vehicleSpec = new VehicleSpecification();

        expect(vehicleSpec.id).toBe(null);
        expect(vehicleSpec.engine).toBe('');
        expect(vehicleSpec.model).toBe('');
        expect(vehicleSpec.description).toBe('');
        expect(vehicleSpec.makeName).toBe('');
        expect(vehicleSpec.vehicleToEngineConfigId).toBeUndefined();
        expect(vehicleSpec.displayText).toBe('');
        expect(vehicleSpec.year).toBeUndefined();
    });
});
