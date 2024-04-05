import { WorkingBayServices } from './working-bay-services.model';

describe('WorkingBayServices', () => {
    it('should create an instance with default values', () => {
        const services = new WorkingBayServices();

        expect(services.id).toBe(null);
        expect(services.rootServiceCategory).toBe(null);
        expect(services.service).toBe(null);
        expect(services.products).toStrictEqual([]);
    });
});
