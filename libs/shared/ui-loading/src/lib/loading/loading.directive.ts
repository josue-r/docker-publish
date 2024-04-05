import { ComponentRef, Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { LoadingComponent } from './loading.component';

/**
 * A directive that displays a loading spinner on the page while waiting for data to load.
 *
 * @example
 * ````
 * <div *viocAngularLoading="dataLoaded; class: 'testClass'"></div>
 * ````
 */
@Directive({
    selector: '[viocAngularLoading]',
})
export class LoadingDirective implements OnInit {
    /**
     * Add an additional styling class to the loading div.
     */
    @Input() viocAngularLoadingClass = '';

    @Input() set viocAngularLoading(dataLoaded: boolean) {
        // Clearing the view removes the spinner once the data is loaded
        this.view.clear();
        if (!dataLoaded) {
            // Create and embed an instance of the loading component
            this.loadingComponent = this.view.createComponent(LoadingComponent);
        } else {
            // Embed the expected contents and output the dataLoaded
            // The second parameter to createEmbeddedView enables the directive to create a local variable
            // in the html (useful with the async pipe:
            // *viocUiLoading="dataToLoad | async; let loadedData")
            this.view.createEmbeddedView(this.templateRef, {
                $implicit: dataLoaded,
            });
        }
    }

    loadingComponent: ComponentRef<LoadingComponent>;

    constructor(private readonly templateRef: TemplateRef<any>, private readonly view: ViewContainerRef) {}

    ngOnInit(): void {
        if (this.loadingComponent) {
            this.loadingComponent.instance.additionalClass = this.viocAngularLoadingClass;
        }
    }
}
