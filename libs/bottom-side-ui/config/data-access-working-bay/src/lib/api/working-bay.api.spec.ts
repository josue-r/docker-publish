import { of } from 'rxjs';
import { WorkingBayApi } from './working-bay.api';
import { ApiConfig } from '@vioc-angular/shared/util-api';
import { HttpClient } from '@angular/common/http';

describe('WorkingBayApi', () => {
    let api: WorkingBayApi;

    beforeEach(() => {
        const gateway = 'http://localhost:4200';
        const httpMock = {
            get: jest.fn(() => of()),
        } as Partial<HttpClient> as jest.Mocked<HttpClient>;
        const config: ApiConfig = { http: httpMock };
        api = new WorkingBayApi(gateway, config);
    });

    it('should create an instance', () => {
        expect(api).toBeTruthy();
    });

    it('should call get with correct arguments for getWorkingBayStatusByNumber', () => {
        const bayNumber = '1';
        const getSpy = jest.spyOn(api, 'get').mockReturnValue(of({}));

        api.getWorkingBayStatusByNumber(bayNumber);

        expect(getSpy).toHaveBeenCalledWith([bayNumber]);
    });

    it('should call get with correct arguments for getWorkingBayServicesByNumberAndRootServiceCategoryCode', () => {
        const bayNumber = '1';
        const rootServiceCategoryCode = 'OC';
        const getSpy = jest.spyOn(api, 'get').mockReturnValue(of({}));

        api.getWorkingBayServicesByNumberAndRootServiceCategoryCode(bayNumber, rootServiceCategoryCode);

        expect(getSpy).toHaveBeenCalledWith([bayNumber, 'services', rootServiceCategoryCode]);
    });

    it('should call get with correct arguments for getBooleanAttributeByNumberAndType', () => {
        const bayNumber = '1';
        const attributeType = 'OIL_EVAC_ICON_DISPLAYED';
        const getSpy = jest.spyOn(api, 'get').mockReturnValue(of(true));

        api.getBooleanAttributeByNumberAndType(bayNumber, attributeType);

        expect(getSpy).toHaveBeenCalledWith([bayNumber, 'attributes', attributeType, 'boolean']);
    });
});
