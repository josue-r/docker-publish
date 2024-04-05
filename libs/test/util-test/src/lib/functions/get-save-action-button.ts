import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

/**
 * Find the save button on the screen, assuming an ID of "save-action".  If the ID is something else, a predicate can be passed as an
 * optional parameter.
 */
export function getSaveActionButton<T>(fixture: ComponentFixture<T>, predicate = By.css('#save-action')) {
    return fixture.debugElement.query(predicate);
}
