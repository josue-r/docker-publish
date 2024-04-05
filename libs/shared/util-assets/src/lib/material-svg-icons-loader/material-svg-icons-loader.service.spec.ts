import { TestBed } from '@angular/core/testing';

import { MaterialSvgIconsLoaderService } from './material-svg-icons-loader.service';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { customIcons, CustomIcon } from './custom-icons';

describe('MaterialSvgIconsLoaderService', () => {
    let service: MaterialSvgIconsLoaderService;
    let matIconRegistryMock: jest.Mocked<MatIconRegistry>;
    let domSanitizerMock: jest.Mocked<DomSanitizer>;

    beforeEach(() => {
        matIconRegistryMock = {
            addSvgIcon: jest.fn(),
        } as unknown as jest.Mocked<MatIconRegistry>;

        domSanitizerMock = {
            bypassSecurityTrustResourceUrl: jest.fn((path: string) => path),
        } as unknown as jest.Mocked<DomSanitizer>;

        TestBed.configureTestingModule({
            providers: [
                MaterialSvgIconsLoaderService,
                { provide: MatIconRegistry, useValue: matIconRegistryMock },
                { provide: DomSanitizer, useValue: domSanitizerMock },
            ],
        });

        service = TestBed.inject(MaterialSvgIconsLoaderService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should add custom SVG icons to MatIconRegistry', () => {
        // Act: Call the loadIcons method
        service.loadIcons();

        // Assert: Expect MatIconRegistry's addSvgIcon to be called with the custom icon details
        customIcons.forEach((icon: CustomIcon) => {
            expect(matIconRegistryMock.addSvgIcon).toHaveBeenCalledWith(icon.svg, icon.path);
        });
    });
});
