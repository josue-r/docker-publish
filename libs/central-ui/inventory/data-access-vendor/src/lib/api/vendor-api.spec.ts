import { VendorApi } from './vendor-api';

describe('VendorApi', () => {
    const api = new VendorApi(null, { http: null });

    beforeEach(() => {
        jest.clearAllMocks();
        api.get = jest.fn();
    });

    it('should create an instance', () => {
        expect(new VendorApi(null, { http: undefined })).toBeTruthy();
    });

    describe('findAllAccessibleActive', () => {
        it('delegate to the get method', () => {
            const path = 'all';
            api.findAllAccessibleActive();
            expect(api.get).toHaveBeenCalledWith([path]);
        });
    });
});
