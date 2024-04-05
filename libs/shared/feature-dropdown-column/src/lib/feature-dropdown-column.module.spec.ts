import { TestBed } from '@angular/core/testing';
import { FeatureDropdownColumnModule } from './feature-dropdown-column.module';

describe('FeatureDropdownColumnModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureDropdownColumnModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeatureDropdownColumnModule).toBeDefined();
    });
});
