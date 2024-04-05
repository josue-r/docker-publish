import { TestBed } from '@angular/core/testing';
import { FeatureSharedServiceSelectionModule } from './feature-shared-service-selection.module';

describe('FeatureSharedServiceSelectionModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureSharedServiceSelectionModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeatureSharedServiceSelectionModule).toBeDefined();
    });
});
