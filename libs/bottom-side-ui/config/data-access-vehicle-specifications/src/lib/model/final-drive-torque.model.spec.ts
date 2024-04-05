import { FinalDriveTorque } from './final-drive-torque.model';

describe('FinalDriveTorque', () => {
    it('should create an instance with default values', () => {
        const partSpec = new FinalDriveTorque();

        expect(partSpec.id).toBe(null);
        expect(partSpec.type).toBe('');
        expect(partSpec.fillPlugTorqueFtLbs).toBe('');
        expect(partSpec.drainPlugTorqueFtLbs).toBe('');
        expect(partSpec.notes).toStrictEqual([]);
    });
});
