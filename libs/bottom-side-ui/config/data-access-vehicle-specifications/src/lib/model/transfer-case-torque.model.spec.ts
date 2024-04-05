import { TransferCaseTorque } from './transfer-case-torque.model';

describe('TransferCaseTorque', () => {
    it('should create an instance with default values', () => {
        const partSpec = new TransferCaseTorque();

        expect(partSpec.id).toBe(null);
        expect(partSpec.type).toBe('');
        expect(partSpec.fillPlugTorqueFtLbs).toBe('');
        expect(partSpec.drainPlugTorqueFtLbs).toBe('');
        expect(partSpec.notes).toStrictEqual([]);
    });
});
