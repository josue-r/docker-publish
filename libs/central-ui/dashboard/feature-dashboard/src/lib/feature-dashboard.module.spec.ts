import { TestBed } from '@angular/core/testing';
import { FeatureDashboardModule } from './feature-dashboard.module';

describe('FeatureDashboardModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureDashboardModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeatureDashboardModule).toBeDefined();
    });
});
