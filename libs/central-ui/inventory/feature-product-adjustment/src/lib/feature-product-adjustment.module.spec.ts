import { TestBed } from '@angular/core/testing';
import { FeatureProductAdjustmentModule } from './feature-product-adjustment.module';

describe('FeatureProductAdjustmentModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureProductAdjustmentModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeatureProductAdjustmentModule).toBeDefined();
    });
});
