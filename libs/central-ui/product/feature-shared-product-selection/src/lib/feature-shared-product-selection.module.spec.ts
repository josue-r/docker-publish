import { TestBed } from '@angular/core/testing';
import { FeatureSharedProductSelectionModule } from './feature-shared-product-selection.module';

describe('FeatureSharedProductSelectionModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureSharedProductSelectionModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeatureSharedProductSelectionModule).toBeDefined();
    });
});
