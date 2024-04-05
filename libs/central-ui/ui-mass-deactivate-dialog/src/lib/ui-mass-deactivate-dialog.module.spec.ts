import { TestBed } from '@angular/core/testing';
import { UiMassDeactivateDialogModule } from './ui-mass-deactivate-dialog.module';

describe('UiMassDeactivateDialogModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UiMassDeactivateDialogModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(UiMassDeactivateDialogModule).toBeDefined();
    });
});
