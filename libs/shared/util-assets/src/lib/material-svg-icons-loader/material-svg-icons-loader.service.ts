import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { customIcons, CustomIcon } from './custom-icons';
/**
 * Service for loading custom SVG icons using Angular Material's MatIconRegistry and DomSanitizer.
 *
 * Usage:
 * You should inject this service in the application you want it:
 *
 * constructor(private svgIconsLoader: MaterialSvgIconsLoaderService) {
 *     svgIconsLoader.loadIcons();
 * }
 *
 * Then, you can use icons like:
 *
 * <mat-icon svgIcon="valvoline-logo" aria-label="Valvoline logo"></mat-icon>
 */
@Injectable({
    providedIn: 'root',
})
export class MaterialSvgIconsLoaderService {
    /**
     * Constructs the MaterialSvgIconsLoaderService.
     *
     * @param matIconRegistry - Angular Material's MatIconRegistry instance.
     * @param domSanitizer - Angular's DomSanitizer instance for security considerations.
     */
    constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {}

    /**
     * Loads custom SVG icons into the MatIconRegistry.
     * It iterates over a predefined list of custom icons and registers them.
     */
    loadIcons() {
        customIcons.forEach((icon: CustomIcon) => {
            this.matIconRegistry.addSvgIcon(icon.svg, this.domSanitizer.bypassSecurityTrustResourceUrl(icon.path));
        });
    }
}
