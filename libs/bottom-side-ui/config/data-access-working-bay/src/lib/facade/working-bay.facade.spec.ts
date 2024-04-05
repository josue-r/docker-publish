import { TestBed } from '@angular/core/testing';
import { WorkingBayFacade } from './working-bay.facade';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('WorkingBayFacade', () => {
    let facade: WorkingBayFacade;
    let httpMock: HttpTestingController;
    const gateway = 'http://localhost:4200';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [WorkingBayFacade, { provide: GATEWAY_TOKEN, useValue: gateway }],
        });

        facade = TestBed.inject(WorkingBayFacade);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(facade).toBeTruthy();
    });

    it('should call api with correct arguments for getWorkingBayStatusByNumber', () => {
        const bayNumber = '1';
        const expectedUrl = `${gateway}/v1/working-bays/${bayNumber}`;

        facade.getWorkingBayStatusByNumber(bayNumber).subscribe();

        const req = httpMock.expectOne(expectedUrl);
        expect(req.request.method).toBe('GET');
        req.flush({});
    });

    it('should call api with correct arguments for getWorkingBayServicesByNumberAndRootServiceCategoryCode', () => {
        const bayNumber = '1';
        const rootServiceCategoryCode = 'OC';
        const expectedUrl = `${gateway}/v1/working-bays/${bayNumber}/services/${rootServiceCategoryCode}`;

        facade.getWorkingBayServicesByNumberAndRootServiceCategoryCode(bayNumber, rootServiceCategoryCode).subscribe();

        const req = httpMock.expectOne(expectedUrl);
        expect(req.request.method).toBe('GET');
        req.flush({});
    });

    it('should call api with correct arguments for getBooleanAttributeByNumberAndType', () => {
        const bayNumber = '1';
        const attributeType = 'OIL_EVAC_ICON_DISPLAYED';
        const expectedUrl = `${gateway}/v1/working-bays/${bayNumber}/attributes/${attributeType}/boolean`;

        facade.getBooleanAttributeByNumberAndType(bayNumber, attributeType).subscribe();

        const req = httpMock.expectOne(expectedUrl);
        expect(req.request.method).toBe('GET');
        req.flush({});
    });
});
