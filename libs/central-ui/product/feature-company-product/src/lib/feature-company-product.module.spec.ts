import { TestBed } from '@angular/core/testing';
import { FeatureCompanyProductModule } from './feature-company-product.module';

describe('FeatureCompanyProductModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureCompanyProductModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeatureCompanyProductModule).toBeDefined();
    });
});
