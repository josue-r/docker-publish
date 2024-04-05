import { TestBed } from '@angular/core/testing';
import { FeatureCompanyServiceModule } from './feature-company-service.module';

describe('FeatureCompanyServiceModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureCompanyServiceModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeatureCompanyServiceModule).toBeDefined();
    });
});
