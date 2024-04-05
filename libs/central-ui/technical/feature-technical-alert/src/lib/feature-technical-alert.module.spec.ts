import { TestBed } from '@angular/core/testing';
import { FeatureTechnicalAlertModule } from './feature-technical-alert.module';

describe('FeatureTechnicalAlertModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureTechnicalAlertModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeatureTechnicalAlertModule).toBeDefined();
    });
});
