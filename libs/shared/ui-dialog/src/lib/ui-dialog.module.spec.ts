import { TestBed } from '@angular/core/testing';
import { UiDialogModule } from './ui-dialog.module';

describe('UiDialogModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UiDialogModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(UiDialogModule).toBeDefined();
    });
});
