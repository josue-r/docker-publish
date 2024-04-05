import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

/**
 * Find the apply button on the screen, assuming an ID of "apply-action".  If the ID is something else, a predicate can be passed as an
 * optional parameter.
 */
export function getApplyActionButton<T>(fixture: ComponentFixture<T>, predicate = By.css('#apply-action')) {
    return fixture.debugElement.query(predicate);
}
