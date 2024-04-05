import { TestBed } from '@angular/core/testing';
import { FeatureSharedStoreSelectionModule } from './feature-shared-store-selection.module';

describe('FeatureSharedStoreSelectionModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureSharedStoreSelectionModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeatureSharedStoreSelectionModule).toBeDefined();
    });
});
