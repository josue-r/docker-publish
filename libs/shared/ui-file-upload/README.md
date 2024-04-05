# shared-ui-file-upload

This library was generated with [Nx](https://nx.dev).

```
ng g @nx/angular:library ui-file-upload --directory shared --simpleModuleName --tags="scope:shared,type:ui" --style=sass
```

## Purpose

This is a library to facilitate file uploading via drag & drop or by browsing through the file explorer. This will emit a `FileList` containing `File` references. Any files will still need their content to be read via a `readFile` call available in the common-functionality library.

## Usage

```
<vioc-angular-file-upload
    [acceptedMediaTypes]="['application/pdf']"
    (upload)="onFileUpload($event)"
    (uploadFailure)="onFileUploadFailure()"
    [multiple]="true"
></vioc-angular-file-upload>
```

## Running unit tests

Run `nx test shared-ui-file-upload` to execute the unit tests.
