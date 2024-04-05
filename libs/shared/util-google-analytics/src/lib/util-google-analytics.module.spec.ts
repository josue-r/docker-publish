import { TestBed } from '@angular/core/testing';
import { UtilGoogleAnalyticsModule } from './util-google-analytics.module';

describe('UtilGoogleAnalyticsModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UtilGoogleAnalyticsModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(UtilGoogleAnalyticsModule).toBeDefined();
    });
});
