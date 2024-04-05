import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

/**
 * Find the Add Like button on the screen, assuming an ID of "add-like-action".  If the ID is something else, a predicate can be passed as an
 * optional parameter.
 */
export function getAddLikeActionButton<T>(fixture: ComponentFixture<T>, predicate = By.css('#add-like-action')) {
    return fixture.debugElement.query(predicate);
}
