import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
    selector: 'vioc-angular-select-and-go',
    templateUrl: './select-and-go.component.html',
})
export class SelectAndGoComponent implements OnInit {
    @ViewChild('selectAndGoWrapper', { static: true }) contentWrapper: ElementRef;

    @Input() goButtonDisplayed = true;

    @Input() goButtonDisabled = false;

    @Output() go = new EventEmitter();

    ngOnInit(): void {
        // Verify the content passed in. This logic can be removed if deemed unnecessary.
        const childNodes = [...this.contentWrapper.nativeElement.childNodes]
            .map((node: Node) => node.nodeName)
            // Filter out comments
            .filter((nodeName: string) => nodeName !== '#comment');
        if (childNodes.length === 0) {
            throw new Error('Expected at least one VIOC-ANGULAR-FILTERED-INPUT');
        }
        // Should only be vioc-angular-filtered-inputs
        childNodes.forEach((nodeName) => {
            if (nodeName !== 'VIOC-ANGULAR-FILTERED-INPUT') {
                throw new Error(`Expected only VIOC-ANGULAR-FILTERED-INPUT but received a ${nodeName}`);
            }
        });
    }
}
