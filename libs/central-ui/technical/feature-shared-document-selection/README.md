# central-ui-technical-feature-shared-document-selection

This library was generated with [Nx](https://nx.dev).

```
ng g @nx/angular:library feature-shared-document-selection  --directory central-ui/technical --simpleModuleName --tags="scope:central-ui,type:feature-shared" --style=sass
```

## Purpose

This is a library to facilitate document file and external link configurations for TSBs and Alerts.

## Usage

```
<vioc-angular-document-selection
    [documentFile]="tsb.documentFile"
    [externalLink]="tsb.externalLink"
    (documentFileChange)="onDocumentFileChange(documentFile)"
    (externalLinkChange)="onExternalLinkChange(externalLink)"
></vioc-angular-document-selection>
```

## Running unit tests

Run `nx test central-ui-technical-feature-shared-document-selection` to execute the unit tests.
