import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

/**
 * Find an element that matches the given css.
 */
export function findByCss<T>(fixture: ComponentFixture<T>, css: string): DebugElement {
    return fixture.debugElement.query(By.css(css));
}

/**
 * Find elements that matches the given css.
 */
export function findAllByCss<T>(fixture: ComponentFixture<T>, css: string): DebugElement[] {
    return fixture.debugElement.queryAll(By.css(css));
}
