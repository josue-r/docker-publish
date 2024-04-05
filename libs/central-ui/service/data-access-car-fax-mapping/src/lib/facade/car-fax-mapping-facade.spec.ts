import { CarFaxMappingApi } from './../api/car-fax-mapping-api';
import { CarFaxMappingFacade } from '../facade/car-fax-mapping-facade';

describe('CarServiceFacade', () => {
    const facade = new CarFaxMappingFacade(null, null);
    const api: CarFaxMappingApi = facade['api'];

    describe('getServiceNames', () => {
        it('should delegate to the API', () => {
            jest.spyOn(api, 'getServiceNames').mockImplementation();
            facade.getServiceNames();
            expect(api.getServiceNames).toHaveBeenCalled();
        });
    });
});
