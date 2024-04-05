import { TestBed } from '@angular/core/testing';
import { FeatureDefectiveProductModule } from './feature-defective-product.module';

describe('FeatureDefectiveProductModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureDefectiveProductModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeatureDefectiveProductModule).toBeDefined();
    });
});
