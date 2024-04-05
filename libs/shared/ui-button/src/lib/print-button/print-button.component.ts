import { Component } from '@angular/core';

@Component({
    selector: 'vioc-angular-print-button',
    template: `
        <button mat-icon-button color="primary" class="print-button not-printable" (click)="print()"
            ><mat-icon>print</mat-icon>
        </button>
    `,
})
export class PrintButtonComponent {
    print(): void {
        window.print();
    }
}
