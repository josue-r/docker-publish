import { TestBed } from '@angular/core/testing';
import { DataModifier } from '../model/data-modifier';
import { UnsavedChangesGuard } from './unsaved-changes.guard';

describe('UnsavedChangesGuard', () => {
    let guard: UnsavedChangesGuard;
    const defaultUnsavedChangesMessage = 'You have unsaved changes, if you leave your changes will be lost.';
    const unsavedChanges: DataModifier = {
        unsavedChanges: true,
        unsavedChangesMessage: () => defaultUnsavedChangesMessage,
        resetComponentForm: () => jest.fn(),
    };
    const noUnsavedChanges: DataModifier = {
        unsavedChanges: false,
        unsavedChangesMessage: () => defaultUnsavedChangesMessage,
        resetComponentForm: () => jest.fn(),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [UnsavedChangesGuard],
        });
        guard = TestBed.inject(UnsavedChangesGuard);
    });

    it('should create', () => {
        expect(guard).toBeTruthy();
    });

    it('should return true if there are no unsaved changes', () => {
        expect(guard.canDeactivate(noUnsavedChanges)).toBe(true);
    });

    it('should return true if user confirms to continue', async () => {
        jest.spyOn(window, 'confirm').mockReturnValue(true);

        expect(guard.canDeactivate(unsavedChanges)).toBe(true);
        expect(guard.canDeactivate(unsavedChanges)).toBe(true);
        expect(window.confirm).toHaveBeenCalledWith(defaultUnsavedChangesMessage);
    });

    it('should return false if user does not choose to continue', () => {
        jest.spyOn(window, 'confirm').mockReturnValue(false);

        expect(guard.canDeactivate(unsavedChanges)).toBe(false);
        expect(window.confirm).toHaveBeenCalledWith(defaultUnsavedChangesMessage);
    });

    it('should trigger the resetComponentForm method', () => {
        jest.spyOn(window, 'confirm').mockReturnValue(true);
        jest.spyOn(unsavedChanges, 'resetComponentForm');

        expect(guard.canDeactivate(unsavedChanges)).toBe(true);
        expect(unsavedChanges.resetComponentForm).toHaveBeenCalled();
    });
});
