import { TestBed } from '@angular/core/testing';
import { UiAddRemoveButtonModule } from './ui-add-remove-button.module';

describe('UiAddRemoveButtonModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UiAddRemoveButtonModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(UiAddRemoveButtonModule).toBeDefined();
    });
});
