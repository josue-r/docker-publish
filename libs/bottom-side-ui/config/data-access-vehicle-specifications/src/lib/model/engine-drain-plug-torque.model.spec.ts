import { EngineDrainPlugTorque } from './engine-drain-plug-torque.model';

describe('EngineDrainPlugTorque', () => {
    it('should create an instance with default values', () => {
        const partSpec = new EngineDrainPlugTorque();

        expect(partSpec.id).toBe(null);
        expect(partSpec.type).toBe('');
        expect(partSpec.torqueFtLbs).toBe('');
        expect(partSpec.notes).toStrictEqual([]);
    });
});
