import { TestBed } from '@angular/core/testing';
import { UiSlideToggleModule } from './slide-toggle.module';

describe('UiSlideToggleModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UiSlideToggleModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(UiSlideToggleModule).toBeDefined();
    });
});
