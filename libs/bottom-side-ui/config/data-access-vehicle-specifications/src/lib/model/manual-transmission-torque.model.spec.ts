import { ManualTransmissionTorque } from './manual-transmission-torque.model';

describe('ManualTransmissionTorque', () => {
    it('should create an instance with default values', () => {
        const partSpec = new ManualTransmissionTorque();

        expect(partSpec.id).toBeNull();
        expect(partSpec.type).toBe('');
        expect(partSpec.fillPlugTorqueFtLbs).toBe('');
        expect(partSpec.drainPlugTorqueFtLbs).toBe('');
        expect(partSpec.notes).toStrictEqual([]);
    });
});
