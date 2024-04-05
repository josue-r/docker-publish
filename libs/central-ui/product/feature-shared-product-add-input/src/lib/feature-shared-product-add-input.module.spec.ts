import { TestBed } from '@angular/core/testing';
import { FeatureSharedProductAddInputModule } from './feature-shared-product-add-input.module';

describe('FeatureSharedProductAddInputModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureSharedProductAddInputModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeatureSharedProductAddInputModule).toBeDefined();
    });
});
