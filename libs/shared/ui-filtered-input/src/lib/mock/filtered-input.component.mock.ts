import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';

@Component({
    selector: 'vioc-angular-filtered-input',
    template: ``,
})
export class MockFilteredInputComponent {
    @Input() options: { code: string; description: string }[];
    @Input() valueControl: AbstractControl;
    @Input() editable: boolean;
    @Input() nullable: boolean;
    @Input() required: boolean;
    @Input() hintEnabled: boolean;
    @Input() multiple: boolean;
    @Input() hint: string;
    @Input() placeHolder: string;
    @Output() selectionChange = new EventEmitter<MatSelectChange>();
    @Output() openChangedEvent: EventEmitter<any> = new EventEmitter();
    @Output() selectedOptionEvent: EventEmitter<any> = new EventEmitter();
    @Input() tooltipEnabled = false;
    @Input() flexed = true;
    @Input() displayFn: (any) => string = (d: { code: string }) => d.code;
    @Input() compareWith = (o1: any, o2: any) => o1 === o2;
    @Input() valueFn = (value: any) => value;
}
