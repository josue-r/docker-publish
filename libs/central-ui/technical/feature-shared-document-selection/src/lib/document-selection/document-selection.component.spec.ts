import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonToggleGroupHarness } from '@angular/material/button-toggle/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatInputHarness } from '@angular/material/input/testing';
import { By, DomSanitizer } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DocumentFile } from '@vioc-angular/central-ui/technical/data-access-tsb';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { MockFileUploadComponent, UiFileUploadMockModule } from '@vioc-angular/shared/ui-file-upload';
import { InfoButtonComponent, UiInfoButtonModule } from '@vioc-angular/shared/ui-info-button';
import { UtilFormMockModule } from '@vioc-angular/shared/util-form';
import { DocumentSelectionComponent } from './document-selection.component';

describe('DocumentSelectionComponent', () => {
    let component: DocumentSelectionComponent;
    let fixture: ComponentFixture<DocumentSelectionComponent>;
    let loader: HarnessLoader;
    let sanitizer: DomSanitizer;

    const testDocumentFile: DocumentFile = {
        id: 2,
        fileName: 'Test Document.pdf',
        document: btoa('encoded-bytes'),
        mimeType: 'application/pdf',
    };

    const testObjectUrl = '/testObjectUrl';

    const testExternalLink = 'https://www.google.com';

    const initialize = (
        options: { documentFile?; externalLink?; documentDisplayWidth?; documentDisplayHeight?; info?; editable? } = {}
    ) => {
        Object.keys(options).forEach((option) => {
            const optionValue = options[option];
            if (typeof optionValue !== 'undefined') {
                component[option] = optionValue;
            }
        });
        fixture.detectChanges();
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                MatButtonToggleModule,
                MatButtonModule,
                ReactiveFormsModule,
                MatFormFieldModule,
                MatInputModule,
                MatIconModule,
                UiFileUploadMockModule,
                UiInfoButtonModule,
                UtilFormMockModule,
            ],
            declarations: [DocumentSelectionComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DocumentSelectionComponent);
        component = fixture.componentInstance;
        loader = TestbedHarnessEnvironment.loader(fixture);
        sanitizer = TestBed.inject(DomSanitizer);
        global.URL.createObjectURL = jest.fn(() => testObjectUrl);
    });

    it('should create', () => {
        initialize();
        expect(component).toBeTruthy();
    });

    describe.each`
        input                      | expected
        ${'documentFile'}          | ${new DocumentFile()}
        ${'externalLink'}          | ${null}
        ${'documentDisplayWidth'}  | ${'85%'}
        ${'documentDisplayHeight'} | ${'400px'}
        ${'maxWidth'}              | ${'950px'}
    `('input defaults', ({ input, expected }) => {
        it(`should default ${input} to ${expected}`, () => {
            initialize();
            expect(component[input]).toEqual(expected);
        });
    });

    describe('ngOnInit', () => {
        describe.each`
            externalLink        | documentFile        | target
            ${undefined}        | ${undefined}        | ${'documentFile'}
            ${undefined}        | ${testDocumentFile} | ${'documentFile'}
            ${testExternalLink} | ${undefined}        | ${'externalLink'}
        `('target', ({ externalLink, documentFile, target }) => {
            it(`should get defaulted to ${target} when externalLink=${externalLink} and documentFile=${documentFile}`, () => {
                initialize({ externalLink, documentFile });
                expect(component.target.value).toEqual(target);
            });
        });

        it('should set documentContentUrl if supplied with a documentFile', () => {
            initialize({ documentFile: testDocumentFile });
            const expectedUrl = sanitizer.bypassSecurityTrustResourceUrl(testObjectUrl);
            expect(component.documentContentUrl).toEqual(expectedUrl);
        });
    });

    describe('document', () => {
        describe('file-upload', () => {
            beforeEach(() => initialize());
            it('should be configured correctly', () => {
                const fileUploadComponent = fixture.debugElement
                    .query(By.directive(MockFileUploadComponent))
                    .injector.get(MockFileUploadComponent);
                expect(fileUploadComponent.acceptedMediaTypes).toEqual(component.acceptedMediaTypes);
                jest.spyOn(component, 'onFileUpload').mockImplementation();
                fileUploadComponent.upload.emit();
                expect(component.onFileUpload).toHaveBeenCalled();
                jest.spyOn(component, 'onFileUploadFailure').mockImplementation();
                fileUploadComponent.uploadFailure.emit();
                expect(component.onFileUpload).toHaveBeenCalled();
            });

            describe('onFileUpload', () => {
                it('should read the given file and update the document selection', async () => {
                    jest.spyOn(component.documentFileChange, 'emit');
                    const fileContents = 'Test file text';
                    const file = new File([fileContents], 'file.txt', { type: 'text/plain' });
                    const fileList = [file] as unknown as FileList;
                    await component.onFileUpload(fileList);
                    expect(component.documentFile.fileName).toEqual(file.name);
                    expect(component.documentFile.mimeType).toEqual(file.type);
                    expect(atob(component.documentFile.document)).toEqual(fileContents);
                    expect(component.documentFileChange.emit).toHaveBeenCalledWith(component.documentFile);
                    expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
                    const expectedContentUrl = sanitizer.bypassSecurityTrustResourceUrl(testObjectUrl);
                    expect(component.documentContentUrl).toEqual(expectedContentUrl);
                });

                it.each`
                    files
                    ${[] as unknown as FileList}
                    ${undefined}
                `(`should not attempt to read the file if one is not provided`, async ({ files }) => {
                    jest.spyOn(component.documentFileChange, 'emit');
                    await component.onFileUpload(files);
                    expect(component.documentFileChange.emit).not.toHaveBeenCalled();
                });
            });

            describe('onFileUploadFailure', () => {
                it('should display an error message', () => {
                    const messageFacade = TestBed.inject(MessageFacade);
                    jest.spyOn(messageFacade, 'addMessage');
                    component.onFileUploadFailure();
                    expect(messageFacade.addMessage).toHaveBeenCalledWith({
                        severity: 'error',
                        message: 'Invalid file type. Expecting: application/pdf',
                        hasTimeout: true,
                    });
                });
            });
        });

        it('should display an existing document if one is provided', () => {
            jest.spyOn(sanitizer, 'bypassSecurityTrustResourceUrl');
            initialize({ documentFile: testDocumentFile });
            const pdf = fixture.debugElement.query(By.css('#document'));
            expect(pdf).not.toBeNull();
            expect(sanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(testObjectUrl);
        });

        describe.each`
            documentFile                         | expectEmit
            ${testDocumentFile}                  | ${false}
            ${{ ...testDocumentFile, id: null }} | ${true}
        `('replace/remove document', ({ documentFile, expectEmit }) => {
            it(`should allow the user to ${expectEmit ? 'remove' : 'replace'} document data`, async () => {
                const emitSpy = jest.spyOn(component.documentFileChange, 'emit');
                initialize({ documentFile });
                expect(component.documentFile.document).not.toBeNull();
                const replaceDocumentBtn = await loader.getHarness(
                    MatButtonHarness.with({ selector: '.document-header .mat-mdc-icon-button' })
                );
                await replaceDocumentBtn.click();
                expect(component.documentFile.document).toBeNull();
                expect(component.documentFile.fileName).toBeNull();
                expect(component.documentFile.mimeType).toBeNull();
                expect(emitSpy).toHaveBeenCalledTimes(expectEmit ? 1 : 0);
                expect(component.documentContentUrl).toBeNull();
            });
        });

        it('should prevent the user from editing document data if not editable', () => {
            initialize({ documentFile: testDocumentFile, editable: false });
            expect(component.documentFile.document).not.toBeNull();
            expect(fixture.debugElement.query(By.css('.document-header button'))).toBeNull();
        });
    });

    describe('externalLink', () => {
        const getExternalLinkInput = async () =>
            await loader.getHarness(MatInputHarness.with({ selector: '#external-link' }));
        const getExternalLinkFormField = async () =>
            await loader.getHarness(MatFormFieldHarness.with({ selector: '.external-link-field' }));

        it('should allow the user to update an external link', async () => {
            jest.spyOn(component.externalLinkChange, 'emit');
            initialize({ externalLink: testExternalLink });
            const newLink = 'test.com';
            await (await getExternalLinkInput()).setValue(newLink); // Trigger value change subscription
            expect(component.externalLinkChange.emit).toHaveBeenCalledWith(newLink);
        });

        it('should display a warning if there are both document and external link values', async () => {
            initialize({ externalLink: testExternalLink, documentFile: testDocumentFile });
            expect(component.externalLinkControl.value).toEqual(testExternalLink);
            expect(component.documentFile).toEqual(testDocumentFile);
            const formField = await getExternalLinkFormField();
            expect(component.documentFile.fileName).toEqual(testDocumentFile.fileName);
            expect(await formField.getTextHints()).toEqual([
                "The attached document won't display at the store. The external link value will take precedence and must be cleared out in order to display the document.",
            ]);
        });

        it('should prevent the user from editing externalLink data if not editable', async () => {
            initialize({ externalLink: testExternalLink, editable: false });
            expect(component.externalLinkControl.value).not.toBeNull();
            expect(await (await getExternalLinkInput()).isDisabled()).toBeTruthy();
            expect.assertions(2);
        });

        it('should display an error for invalid externalUrl', async () => {
            initialize({ externalLink: testExternalLink });
            const error = { someError: true };
            component.externalLinkControl.setValidators(() => error);
            component.externalLinkControl.updateValueAndValidity();
            component.externalLinkControl.markAsTouched();
            expect(await (await getExternalLinkFormField()).getTextErrors()).toEqual([JSON.stringify(error)]);
        });

        it('should validate with url validator', () => {
            initialize({ externalLink: 'invalid url' });
            expect(component.externalLinkControl.getError('invalidUrl')).toBeTruthy();
        });
    });

    describe('target button group', () => {
        const getFileUploadElement = () => fixture.debugElement.query(By.directive(MockFileUploadComponent));
        const getExternalLinkInputElement = () => fixture.debugElement.query(By.css('#external-link'));
        const getTargetBtnGroup = async () =>
            await loader.getHarness(MatButtonToggleGroupHarness.with({ selector: '#target' }));

        it('should allow the user to switch between document and external link', async () => {
            initialize();
            await (await getTargetBtnGroup()).getToggles().then(async (toggles) => {
                expect(toggles.length).toEqual(2);
                await toggles[0].check(); // First toggle button is 'document'
                // Expect file upload, but not external link input
                expect(getFileUploadElement()).not.toBeNull();
                expect(getExternalLinkInputElement()).toBeNull();
                await toggles[1].check(); // Switch to 'externalLink'
                // Expect external link input, but not file upload
                expect(getFileUploadElement()).toBeNull();
                expect(getExternalLinkInputElement()).not.toBeNull();
            });
            expect.assertions(5);
        });

        describe.each`
            button            | buttonIndex
            ${'externalLink'} | ${1}
            ${'documentFile'} | ${0}
        `('disable logic', ({ button, buttonIndex }) => {
            it(`should disable ${button} if not editable and ${button} is null`, async () => {
                const modelOpts = { editable: false };
                modelOpts[button] = null;
                initialize(modelOpts);
                await (await getTargetBtnGroup()).getToggles().then(async (toggles) => {
                    expect(await toggles[buttonIndex].isDisabled()).toBeTruthy();
                });
                expect.assertions(1);
            });
        });
    });

    describe('info', () => {
        const getInfoButton = () => fixture.debugElement.query(By.directive(InfoButtonComponent));
        it('should render an info-button if info is provided', () => {
            const testInfo = 'test info';
            initialize({ info: testInfo });
            const infoButton = getInfoButton();
            expect(infoButton).not.toBeNull();
            expect(infoButton.injector.get(InfoButtonComponent).info).toEqual(testInfo);
        });

        it('should not render an info-button if info is not provided', () => {
            initialize({ info: null });
            expect(getInfoButton()).toBeNull();
        });
    });
});
