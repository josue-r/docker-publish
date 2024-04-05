import { TestBed } from '@angular/core/testing';
import { UiFilteredInputModule } from './ui-filtered-input.module';

describe('UiFilteredInputModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UiFilteredInputModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(UiFilteredInputModule).toBeDefined();
    });
});
