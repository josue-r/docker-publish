import { CarFaxMappingApi } from '../api/car-fax-mapping-api';

describe('CarFaxMappingApi', () => {
    const api = new CarFaxMappingApi(null, { http: undefined });

    it('should create an instance', () => {
        expect(api).toBeTruthy();
    });

    describe('getServiceNames', () => {
        it('should call out the base api', () => {
            jest.spyOn(api, 'get').mockImplementation();
            api.getServiceNames();
            expect(api.get).toHaveBeenCalledWith(['service-names']);
        });
    });
});
