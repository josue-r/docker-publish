import { CompanyServiceApi } from './company-service-api';

describe('CompanyServiceApi', () => {
    const api = new CompanyServiceApi(null, { http: null });

    beforeEach(() => {
        jest.clearAllMocks();
        api.get = jest.fn();
    });

    it('should create', () => {
        // just makes sure it comples
        expect(new CompanyServiceApi('gateway', { http: null })).toBeTruthy();
    });

    describe('findByCompanyAndServiceCode', () => {
        it('should delegate to the get method', () => {
            const companyCode = 'test-company';
            const serviceCode = 'test-srv-code';
            api.findByCompanyAndServiceCode(companyCode, serviceCode);
            expect(api.get).toHaveBeenCalledWith([], { companyCode, serviceCode });
        });
    });

    describe('previewMassAdd', () => {
        it('should delegate to the post method', () => {
            api.post = jest.fn();
            const companyIds = [1, 2];
            const serviceIds = [4, 6, 7];
            api.previewMassAdd(companyIds, serviceIds);
            expect(api.post).toHaveBeenCalledWith(['mass-add-preview'], { companyIds, serviceIds });
        });
    });
});
