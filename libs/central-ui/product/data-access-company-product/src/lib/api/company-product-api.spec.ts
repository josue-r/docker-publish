import { CompanyProductApi } from './company-product-api';

describe('CompanyProductApi', () => {
    it('should create an instance', () => {
        expect(new CompanyProductApi(null, { http: undefined })).toBeTruthy();
    });
});
