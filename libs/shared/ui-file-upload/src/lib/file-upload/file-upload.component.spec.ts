import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FileUploadComponent } from './file-upload.component';

describe('FileUploadComponent', () => {
    let component: FileUploadComponent;
    let fixture: ComponentFixture<FileUploadComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, MatIconModule],
            declarations: [FileUploadComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FileUploadComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('events', () => {
        const files = { item: () => ({ name: 'test', type: 'testType' }), length: 1 };

        beforeEach(() => jest.spyOn(component, 'onFileSelection').mockImplementation());

        describe('drop', () => {
            it('should call onFileSelection when a file is dropped', () => {
                const dropEvent = { preventDefault: jest.fn(), stopPropagation: jest.fn(), dataTransfer: { files } };

                fixture.debugElement.triggerEventHandler('drop', dropEvent);

                expect(component.onFileSelection).toHaveBeenCalledWith(files);
                expect(dropEvent.preventDefault).toHaveBeenCalled();
                expect(dropEvent.stopPropagation).toHaveBeenCalled();
            });
        });

        describe('input change', () => {
            it('should call onFileSelection when a file is selected via the file input', async () => {
                const changeEvent = { target: { files } };

                fixture.debugElement.query(By.css('#file-upload')).triggerEventHandler('change', changeEvent);

                expect(component.onFileSelection).toHaveBeenCalledWith(files);
            });
        });
    });

    describe('onFileSelection', () => {
        /** Building a fake `FileList` as an array of fake files to simplify the actual object. */
        const buildFiles = (fileTypes: string[]): FileList =>
            (fileTypes.map((fileType, idx) => ({ name: `test${idx}`, type: fileType })) as unknown) as FileList;

        beforeEach(() => {
            jest.spyOn(component.upload, 'emit');
            jest.spyOn(component.uploadFailure, 'emit');
        });

        describe.each`
            acceptedMediaTypes                   | uploadedFileTypes
            ${[]}                                | ${['application/pdf']}
            ${['application/pdf']}               | ${['application/pdf']}
            ${['application/pdf']}               | ${['application/pdf', 'application/pdf']}
            ${['application/pdf', 'text/plain']} | ${['application/pdf']}
        `('upload event', ({ acceptedMediaTypes, uploadedFileTypes }) => {
            it(`should emit when acceptedMediaTypes=${acceptedMediaTypes} & uploadedFileTypes=${uploadedFileTypes}`, () => {
                component.acceptedMediaTypes = acceptedMediaTypes;
                const files = buildFiles(uploadedFileTypes);
                component.onFileSelection(files);
                // Expect successful upload
                expect(component.upload.emit).toHaveBeenCalledWith(files);
            });
        });

        describe.each`
            acceptedMediaTypes                  | uploadedFileTypes
            ${['application/pdf']}              | ${['text/plain']}
            ${['application/pdf', 'image/png']} | ${['text/plain']}
            ${['application/pdf']}              | ${['application/pdf', 'text/plain']}
            ${['application/pdf']}              | ${['text/plain', 'text/plain']}
        `('uploadFailure event', ({ acceptedMediaTypes, uploadedFileTypes }) => {
            it(`should emit when acceptedMediaTypes=${acceptedMediaTypes} & uploadedFileTypes=${uploadedFileTypes}`, () => {
                component.acceptedMediaTypes = acceptedMediaTypes;
                const files = buildFiles(uploadedFileTypes);
                component.onFileSelection(files);
                // Expect upload to fail
                expect(component.uploadFailure.emit).toHaveBeenCalled();
            });
        });
    });
});
