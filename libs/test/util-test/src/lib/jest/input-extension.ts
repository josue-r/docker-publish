import { DebugElement, Predicate } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { isRegExp, isString } from 'util';

// Update the jest.Matchers namespace to to declare the new functions
declare global {
    namespace jest {
        interface Matchers<R> {
            /**
             * Passes if the input is present or is not present if the optional `present===false`.
             *
             * This is most always combined with `findFormControlInput(...)`
             *
             * @param {boolean} [present] defaults to `true`
             * @returns {R} the object passed to jest.expect
             */
            toBeInputThatIsPresent(present?: boolean): R;

            /**
             * Passes if the input is present and is enabled or not enabled if the optional `enabled===false`.
             *
             * If the input is not present, the test fails regardless of the value of `enabled` and regardless of whether this call was
             * prefixed with `not.`.
             *
             * This is most always combined with `findFormControlInput(...)`
             *
             * @param {boolean} [enabled] defaults to `true`
             * @returns {R} the object passed to jest.expect
             * @memberof Matchers
             */
            toBeInputThatIsEnabled(enabled?: boolean): R;

            /**
             * Passes if the input is present and it's value matches the passed `value`.
             *
             * When expecting the value of a `mat-select`, this is testing the displayed string and not the "value".  For example, in
             * `<mat-option value="Y">Yes</mat-option>`, the `"Yes"` is tested as opposed to the `"Y"`.
             *
             * If the input is not present, the test fails regardless of whether this call was prefixed with `not.`.
             *
             * This is most always combined with `findFormControlInput(...)`
             *
             * @param {(string | RegExp | boolean)} value The expected value
             * @returns {R} the object passed to jest.expect
             * @memberof Matchers
             */
            toBeInputThatHasValue(value: string | RegExp | boolean): R;

            /**
             * Finds the `<mat-form-field>` parent of this input and checks to see if it has a child matching the `options.warningSelector`
             * and the `warning` parameter.
             *
             * This test passes if
             *  - The input is present
             *  - A `<mat-form-field>` is present within `options.maxDepth` (default of 5) steps up
             *  - An element is present matching the `options.warningSelector` (default css selector of `mat-hint.warning`)
             *  - The warning text (excluding leading/trailing whitespace) matches the `warning` parameter if passed
             * and fails otherwise.
             *
             * If the input is not present, the test fails regardless of whether this call was prefixed with `not.`.
             *
             * @param {(string | RegExp)} [warning] defaults to the RegExp of `.*` if you just want to see that the warning is present
             * @param {{ warningSelector?: Predicate<DebugElement>; maxDepth?: number }} [options] The selector for finding the hint and the
             *          max number of elements to travel up to find a mat-form-field before giving up.  The defaults for both of these are
             *          usually sufficient
             * @returns {R} the object passed to jest.expect
             * @memberof Matchers
             */
            toBeInputThatHasWarning(
                warning?: string | RegExp,
                options?: { warningSelector?: Predicate<DebugElement>; maxDepth?: number }
            ): R;
        }
    }
}

/**
 * Finds an input either matching the passed form control name or the id of the input.
 *
 * @export
 * @param {(ComponentFixture<any> | DebugElement)} source
 * @param {(string | { id: string })} formControl the `formControlName` on the input or the input's ID
 * @returns {DebugElement}
 */
// Note: It is vital that this file is in the same file as the namespace configuration, as importing this function also triggers the
//  namespace update and the expect.extend
export function findFormControlInput(
    source: ComponentFixture<any> | DebugElement,
    formControl: string | { id: string }
): DebugElement {
    if (source.constructor.name === 'DebugElement') {
        return _findFormControlInput(source as DebugElement, formControl);
    } else {
        return _findFormControlInput((source as ComponentFixture<any>).debugElement, formControl);
    }
}

/**
 *  Enables the input matchers after calling `expect(...)`
 *   - toBeInputThatIsPresent
 *   - toBeInputThatIsEnabled
 *   - toBeInputThatHasValue
 *   - toBeInputThatHasWarning
 */
export function enableJestInputExtension() {
    // Does nothing.  All we need is for this file to be loaded.
}

/**
 * Implementations of the methods added to the namespace.
 */
export const inputExtensions = {
    toBeInputThatIsPresent(received, expectPresent = true): { pass: boolean; message: () => string } {
        validateDebugElement(received);
        const isPresent = received != null;
        return {
            pass: (isPresent && expectPresent) || (!isPresent && !expectPresent),
            message: () => `${describeInput(received)} should ${expectPresent ? '' : 'not '}be present`,
        };
    },
    toBeInputThatIsEnabled(received, expectEnabled = true): { pass: boolean; message: () => string } {
        validateDebugElement(received);
        if (!received) {
            // If called with `.not.`, the result of `pass` will be flipped.
            // This should always fail the test, so called with `.not.`, return true so that it is flipped to false, triggering failure
            // If not called with `.not`, isNot is undefined, hince the `!!`.
            return { pass: !!this.isNot, message: () => 'No DebugElement found' };
        }
        const enabled = isEnabled(received);
        return {
            pass: (enabled && expectEnabled) || (!enabled && !expectEnabled),
            message: () => {
                return `${describeInput(received, 'enabled')} should ${expectEnabled ? '' : 'not '}be enabled`;
            },
        };
    },
    toBeInputThatHasValue(received, expected: string | RegExp | boolean): { pass: boolean; message: () => string } {
        validateDebugElement(received);
        if (!received) {
            // If called with `.not.`, the result of `pass` will be flipped.
            // This should always fail the test, so called with `.not.`, return true so that it is flipped to false, triggering failure
            // If not called with `.not`, isNot is undefined, hince the `!!`.
            return { pass: !!this.isNot, message: () => 'No DebugElement found' };
        }
        const value = getInputValue(received);
        if (isRegExp(expected)) {
            if (expected.test(value)) {
                return {
                    pass: true,
                    message: () =>
                        `expected "${value}" in ${describeInput(received, 'value')} not to match ${expected}`,
                };
            } else {
                return {
                    pass: false,
                    message: () => `expected "${value}" in ${describeInput(received, 'value')} to match ${expected}`,
                };
            }
        } else {
            if (expected === value) {
                return {
                    pass: true,
                    message: () =>
                        `expected "${value}" in ${describeInput(received, 'value')} not to be equal "${expected}"`,
                };
            } else {
                return {
                    pass: false,
                    message: () =>
                        `expected "${value}" in ${describeInput(received, 'value')} to be equal "${expected}"`,
                };
            }
        }
    },
    toBeInputThatHasWarning(
        received,
        expectedWarning: string | RegExp = /.*/,
        options = { warningSelector: By.css('mat-hint.warning'), maxDepth: 5 }
    ) {
        validateDebugElement(received);
        if (!received) {
            // If called with `.not.`, the result of `pass` will be flipped.
            // This should always fail the test, so called with `.not.`, return true so that it is flipped to false, triggering failure
            // If not called with `.not`, isNot is undefined, hince the `!!`.
            return { pass: !!this.isNot, message: () => 'No DebugElement found' };
        }

        let matFormField: DebugElement = received;
        // find the parent mat-form-field. Warning should be a direct child of that

        // Default maxDepth to 5
        const maxDepth = options.maxDepth || 5;
        const foundTags = [];
        let depth = 0;
        while (matFormField.name !== 'mat-form-field') {
            foundTags.push(matFormField.name);
            if (depth++ > maxDepth) {
                // should always fail test if no enclosing mat-form-field
                return {
                    pass: !!this.isNot,
                    message: () =>
                        `Could not find a "mat-form-field" after looking ${maxDepth} levels up. Found: ${foundTags.join(
                            ' < '
                        )}`,
                };
            }
            matFormField = matFormField.parent;
            if (!matFormField) {
                // should always fail test if no enclosing mat-form-field
                return {
                    pass: !!this.isNot,
                    message: () =>
                        `Could not find a "mat-form-field" after looking ${depth} levels up. Found: ${foundTags.join(
                            ' < '
                        )}`,
                };
            }
        }

        // Default warningSelector to "mat-hint.warning"
        const warningSelector = options.warningSelector || By.css('mat-hint.warning');
        const warningHint = matFormField.query(warningSelector);
        if (!warningHint) {
            return {
                pass: false,
                message: () => `Could not find a "warning" element on ${describeInput(received)}`,
            };
        }
        // Trim to remove any whitespace html adds
        const actualWarning: string = warningHint.nativeElement.textContent.trim();
        if (isRegExp(expectedWarning)) {
            if (expectedWarning.test(actualWarning)) {
                return {
                    pass: true,
                    message: () =>
                        `expected "${actualWarning}" in ${describeInput(
                            warningHint
                        )} not to match "${expectedWarning}"`,
                };
            } else {
                return {
                    pass: false,
                    message: () =>
                        `expected "${actualWarning}" in ${describeInput(warningHint)} to match "${expectedWarning}"`,
                };
            }
        } else {
            if (expectedWarning === actualWarning) {
                return {
                    pass: true,
                    message: () =>
                        `expected "${actualWarning}" in ${describeInput(
                            warningHint
                        )} not to be equal "${expectedWarning}"`,
                };
            } else {
                return {
                    pass: false,
                    message: () =>
                        `expected "${actualWarning}" in ${describeInput(warningHint)} to be equal "${expectedWarning}"`,
                };
            }
        }
    },
};

// Apply the implementation for the methods declared in the jest namespace.
expect.extend(inputExtensions);

/** Gets the inputs value based on the input type implementation. */
function getInputValue(input: DebugElement): any {
    if (input.name === 'input' || input.name === 'textarea') {
        return input.nativeElement.value;
    } else if (input.name === 'mat-checkbox') {
        return input.componentInstance.checked;
    } else if (input.name === 'mat-select') {
        return input.componentInstance.triggerValue;
    } else {
        throw Error(`unsupported input type: ${input}`);
    }
}

/** Determines if the element is enabled based on the input type implementation. */
function isEnabled(input: DebugElement) {
    if (input.name === 'input' || input.name === 'textarea') {
        return !input.nativeElement.disabled;
    } else if (input.name.startsWith('mat-')) {
        return !input.componentInstance.disabled;
    } else {
        throw new Error(`Unhandled type: ${this.input.name}`);
    }
}

/** Formats the `DebugElement` with enough information to show in test failure output. */
export function describeInput(debugElement: DebugElement, ...attributes: ('enabled' | 'value')[]): string {
    if (!debugElement) {
        return 'Input[null]';
    }

    const details: string[] = [];
    if (debugElement.attributes.formControlName) {
        details.push(`formControlName="${debugElement.attributes.formControlName}"`);
    }
    details.push(`id="${debugElement.nativeElement.id}"`);
    details.push(`tag="${debugElement.name}"`);
    attributes.forEach((attribute) => {
        switch (attribute) {
            case 'enabled':
                details.push(`enabled="${isEnabled(debugElement)}"`);
                break;
            case 'value':
                details.push(`value="${getInputValue(debugElement)}"`);
                break;
            default:
                break;
        }
    });
    return `Input[${details.join(', ')}]`;
}

/** Finds the form control input that is a child od the debug element. */
function _findFormControlInput(debugElement: DebugElement, formControl: string | { id: string }): DebugElement {
    const attributeSelector = isString(formControl) ? `formControlName=${formControl}` : `id=${formControl.id}`;
    const supportedTags = ['input', 'mat-checkbox', 'mat-select', 'textarea'];
    const cssSelector = supportedTags.map((tag) => `${tag}[${attributeSelector}]`).join(', ');
    return debugElement.query(By.css(cssSelector));
}

/**
 * Validate that the passed argument is a `DebugElement` and not some other type of object.
 *
 * @param {*} received
 */
function validateDebugElement(received) {
    if (received && (!received.constructor || !received.constructor.name.startsWith('DebugElement'))) {
        throw Error(`Expected a DebugElement but received: ${received.constructor.name}:${received}`);
    }
}

class InputMatcher {
    constructor(private input: DebugElement, private isNot = false) {}

    /** Delegate to the jest.Expect, negating if required */
    private expect(input): jest.Matchers<any> {
        if (this.isNot) {
            return expect(input).not;
        } else {
            return expect(input);
        }
    }

    /**
     *  Passes if the input is present or is not present if the optional `present===false`.
     *
     * @param {boolean} [present=true]
     * @returns {InputMatcher}
     * @memberof InputMatcher
     */
    toBePresent(present = true): InputMatcher {
        this.expect(this.input).toBeInputThatIsPresent(present);
        return new InputMatcher(this.input);
    }

    /**
     * Passes if the input is present and it's value matches the passed `value`.
     *
     * When expecting the value of a `mat-select`, this is testing the displayed string and not the "value".  For example, in
     * `<mat-option value="Y">Yes</mat-option>`, the `"Yes"` is tested as opposed to the `"Y"`.
     *
     * If the input is not present, the test fails regardless of whether this call was prefixed with `not.`.
     *
     * @param {(string | RegExp | boolean)} value
     * @returns {InputMatcher}
     * @memberof InputMatcher
     */
    toHaveValue(value: string | RegExp | boolean): InputMatcher {
        this.expect(this.input).toBeInputThatHasValue(value);
        return new InputMatcher(this.input);
    }

    /**
     * Finds the `<mat-form-field>` parent of this input and checks to see if it has a child matching the `options.warningSelector`
     * and the `warning` parameter.
     *
     * This test passes if
     *  - The input is present
     *  - A `<mat-form-field>` is present within `options.maxDepth` (default of 5) steps up
     *  - An element is present matching the `options.warningSelector` (default css selector of `mat-hint.warning`)
     *  - The warning text (excluding leading/trailing whitespace) matches the `warning` parameter if passed
     * and fails otherwise.
     *
     * If the input is not present, the test fails regardless of whether this call was prefixed with `not.`.
     *
     * @param {(string | RegExp)} [warning] defaults to the RegExp of `.*` if you just want to see that the warning is present
     * @param {{ warningSelector?: Predicate<DebugElement>; maxDepth?: number }} [options] The selector for finding the hint and the
     *          max number of elements to travel up to find a mat-form-field before giving up.  The defaults for both of these are
     *          usually sufficient
     * @returns {InputMatcher}
     * @memberof InputMatcher
     */
    toHaveWarning(
        warning?: string | RegExp,
        options?: { warningSelector?: Predicate<DebugElement>; maxDepth?: number }
    ): InputMatcher {
        this.expect(this.input).toBeInputThatHasWarning(warning, options);
        return new InputMatcher(this.input);
    }

    /**
     * Passes if the input is present and is enabled or not enabled if the optional `enabled===false`.
     *
     * If the input is not present, the test fails regardless of the value of `enabled` and regardless of whether this call was
     * prefixed with `not.`.
     *
     * @param {boolean} [enabled=true]
     * @returns {InputMatcher}
     * @memberof InputMatcher
     */
    toBeEnabled(enabled = true): InputMatcher {
        this.expect(this.input).toBeInputThatIsEnabled(enabled);
        return new InputMatcher(this.input);
    }

    /**
     * Negates the next matcher call.  After that call, this is reset.
     *
     * @readonly
     * @memberof InputMatcher
     */
    get not() {
        return new InputMatcher(this.input, true);
    }
}

/** Wraps the jest input extensions into a fluent, chainable call chain.*/
export function expectInput(source: ComponentFixture<any> | DebugElement, formControl: string | { id: string }) {
    return new InputMatcher(findFormControlInput(source, formControl));
}
