import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

/**
 * Find the cancel button on the screen, assuming an ID of "cancel-action".  If the ID is something else, a predicate can be passed as an
 * optional parameter.
 */
export function getCancelActionButton<T>(fixture: ComponentFixture<T>, predicate = By.css('#cancel-action')) {
    return fixture.debugElement.query(predicate);
}
