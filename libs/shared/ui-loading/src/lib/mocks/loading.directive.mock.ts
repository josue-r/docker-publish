import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

/**
 * Provides a limited functionality LoadingDirective with no extra dependencies to speed up testing. Instead of displaying
 * a component if the data is not loaded like the actual LoadingDirective, this simply doesn't display anything. Once data
 * is populated this will display the same as the regular loading directive.
 */
@Directive({
    selector: '[viocAngularLoading]',
})
export class MockLoadingDirective {
    constructor(private readonly templateRef: TemplateRef<any>, private readonly view: ViewContainerRef) {}

    private _dataLoaded: boolean;

    @Input() viocAngularLoadingClass;

    @Input() set viocAngularLoading(dataLoaded: boolean) {
        this._dataLoaded = dataLoaded;
        this.view.clear();
        if (dataLoaded) {
            this.view.createEmbeddedView(this.templateRef, {
                $implicit: dataLoaded,
            });
        }
    }
}
