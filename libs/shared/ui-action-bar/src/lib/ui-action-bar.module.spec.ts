import { TestBed } from '@angular/core/testing';
import { UiActionBarModule } from './ui-action-bar.module';

describe('UiActionBarModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UiActionBarModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(UiActionBarModule).toBeDefined();
    });
});
