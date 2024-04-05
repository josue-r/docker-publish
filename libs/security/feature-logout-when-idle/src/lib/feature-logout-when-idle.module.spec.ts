import { TestBed } from '@angular/core/testing';
import { FeatureLogoutWhenIdleModule } from './feature-logout-when-idle.module';

describe('FeatureLogoutWhenIdleModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureLogoutWhenIdleModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeatureLogoutWhenIdleModule).toBeDefined();
    });
});
