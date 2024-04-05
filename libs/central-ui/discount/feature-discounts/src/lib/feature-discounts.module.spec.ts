import { TestBed } from '@angular/core/testing';
import { FeatureDiscountsModule } from './feature-discounts.module';

describe('FeatureDiscountModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureDiscountsModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeatureDiscountsModule).toBeDefined();
    });
});
