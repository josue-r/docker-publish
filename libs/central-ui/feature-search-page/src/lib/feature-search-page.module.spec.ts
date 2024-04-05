import { TestBed } from '@angular/core/testing';
import { FeatureSearchPageModule } from './feature-search-page.module';

describe('FeatureSearchPageModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureSearchPageModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeatureSearchPageModule).toBeDefined();
    });
});
