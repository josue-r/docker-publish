import { ChangeDetectorRef } from '@angular/core';
import { isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { modelTypeKey } from './model-type-key';

export class FormFactoryOptions {
    /**
     * Allows us to do different things based on scope. For example, different behavior for GRID view. The GRID scope is set automatically
     * by the grid component
     */
    scope?: 'GRID' | string;

    /** If a form needs to trigger change detection, the change detector for the applicable component should be passed here.  The
     * grid component will automatically pass this. */
    changeDetector?: ChangeDetectorRef;

    [key: string]: any;

    /**
     * Helper method to validate that all of the specified keys are set in the options.
     */
    static validateRequiredOptions(
        options: FormFactoryOptions,
        ...requiredOptions: (keyof FormFactoryOptions | string)[]
    ): void {
        requiredOptions.forEach((requiredOption) => {
            if (isNullOrUndefined(options[requiredOption])) {
                throw new Error(
                    `The "${requiredOption}" option must be passed to the FormFactory for ${options[modelTypeKey]}`
                );
            }
        });
    }
}
