import { CarSystemApi } from '../api/car-system-api';

describe('CarSystemApi', () => {
    const api = new CarSystemApi(null, { http: undefined });
    it('should create an instance', () => {
        expect(api).toBeTruthy();
    });

    describe('findActive', () => {
        it('should call out the base api', () => {
            jest.spyOn(api, 'get').mockImplementation();
            api.findActive();
            expect(api.get).toHaveBeenCalled();
        });
    });
});
