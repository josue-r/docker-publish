import { CabinAirFilter } from './cabin-air-filter.model';
describe('CabinAirFilter', () => {
    it('should create an instance', () => {
        expect(new CabinAirFilter()).toBeTruthy();
    });

    it('should create an instance with default values', () => {
        const cabinAirFilter = new CabinAirFilter();

        expect(cabinAirFilter.id).toBe(null);
        expect(cabinAirFilter.type).toBe('');
        expect(cabinAirFilter.qualifier).toBe('');
        expect(cabinAirFilter.part).toBe('');
        expect(cabinAirFilter.notes).toStrictEqual([]);
    });
});
