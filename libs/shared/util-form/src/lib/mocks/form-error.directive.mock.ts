import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { FormErrorMapping } from '../form-error/form-error-mapping';

/**
 * A mocked form error directive that simply displays a JSON.stringify of the errors passed
 * in for easier validation.
 */
@Directive({
    selector: '[viocAngularFormError]',
})
export class MockFormErrorDirective {
    @Input() set viocAngularFormError(errors: ValidationErrors) {
        this.view.clear();
        if (errors) {
            this.view.createEmbeddedView(this.templateRef, {
                $implicit: JSON.stringify(errors),
            });
        }
    }
    @Input() viocAngularFormErrorCustomErrorMapping: FormErrorMapping;

    constructor(private readonly templateRef: TemplateRef<any>, private readonly view: ViewContainerRef) {}
}
