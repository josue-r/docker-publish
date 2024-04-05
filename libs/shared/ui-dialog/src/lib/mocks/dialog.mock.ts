import { of } from 'rxjs';

export class MockDialog {
    open(): void {}
    close(): void {}
    afterClosed() {
        return of(true);
    }
}
