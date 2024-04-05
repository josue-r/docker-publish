import { Part } from './part.model';

describe('Part', () => {
    it('should create an instance with default values', () => {
        const partSpec = new Part();

        expect(partSpec.id).toBe(null);
        expect(partSpec.part).toBe('');
        expect(partSpec.notes).toStrictEqual([]);
        expect(partSpec.qualifier).toBe('');
        expect(partSpec.type).toBe('');
    });
});
