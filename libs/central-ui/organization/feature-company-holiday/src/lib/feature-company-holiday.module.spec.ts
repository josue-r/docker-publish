import { TestBed } from '@angular/core/testing';
import { FeatureCompanyHolidayModule } from './feature-company-holiday.module';

describe('FeatureCompanyHolidayModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureCompanyHolidayModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeatureCompanyHolidayModule).toBeDefined();
    });
});
