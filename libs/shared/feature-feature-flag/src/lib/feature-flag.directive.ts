import { ChangeDetectorRef, Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { Loggers } from '@vioc-angular/shared/common-logging';
import { FeatureFlagFacade } from '@vioc-angular/shared/data-access-feature-flag';
import { ReplaySubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Directive({
    selector: '[viocAngularFeatureFlag]',
})
export class FeatureFlagDirective implements OnInit, OnDestroy {
    private readonly logger = Loggers.get('feature-feature-flags', 'FeatureFlagDirective');

    @Input() viocAngularFeatureFlag: string;

    private readonly _destroyed = new ReplaySubject(1);

    constructor(
        private readonly templateRef: TemplateRef<any>,
        private readonly view: ViewContainerRef,
        private readonly featureFlagFacade: FeatureFlagFacade,
        private readonly changeDetector: ChangeDetectorRef
    ) {}

    ngOnInit() {
        if (!this.viocAngularFeatureFlag || !this.viocAngularFeatureFlag.match(/^[^\.]+\.[^\.]+\.[^\.]+$/)) {
            throw new Error(
                `Feature Flags should be in the format of "<domain>.<screen>.<item>". Received: "${this.viocAngularFeatureFlag}"`
            );
        }
        this.featureFlagFacade
            .isEnabled(this.viocAngularFeatureFlag)
            .pipe(tap(() => this.view.clear()))
            .subscribe(
                (enabled) => {
                    if (enabled) {
                        this.view.createEmbeddedView(this.templateRef);
                        this.changeDetector.markForCheck();
                    }
                },
                (error) => {
                    this.logger.error('Error checking for feature flag', this.viocAngularFeatureFlag, error);
                }
            );
    }

    ngOnDestroy(): void {
        this._destroyed.next();
    }
}
