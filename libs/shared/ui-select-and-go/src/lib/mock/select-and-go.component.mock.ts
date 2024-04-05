import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'vioc-angular-select-and-go',
    template: `<ng-content></ng-content>`,
})
export class MockSelectAndGoComponent {
    @Input() goButtonDisplayed = true;
    @Input() goButtonDisabled = false;
    @Output() go = new EventEmitter();
}
