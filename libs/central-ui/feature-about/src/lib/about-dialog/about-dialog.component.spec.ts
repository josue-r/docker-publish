import { DialogComponent } from '@vioc-angular/shared/ui-dialog';
import { AboutDialogComponent } from './about-dialog.component';

describe('AboutDialogComponent', () => {
    it('should create delegate to the dialog on "open()"', () => {
        const component = new AboutDialogComponent();
        component.dialog = {
            open: () => {},
        } as DialogComponent;
        jest.spyOn(component.dialog, 'open');

        component.open();

        expect(component.dialog.open).toHaveBeenCalled();
    });
    it('should create delegate to the dialog on "close()"', () => {
        const component = new AboutDialogComponent();
        component.dialog = {
            close: () => {},
        } as DialogComponent;
        jest.spyOn(component.dialog, 'close');

        component.close();

        expect(component.dialog.close).toHaveBeenCalled();
    });
});
