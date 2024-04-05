# Central Style Guide

When in doubt, check https://material.io/design/.

## Colors

-   <p style="color: #fff; background: #009cd9">Primary: #009cd9 / rgb(0,156,217)</p>
-   <p style="color: #000; background: #ffffff">Secondary: #ffffff / rgb(255,255,255)</p>
-   <p style="color: #000; background: #e0e0e0">Accent: #e0e0e0 / rgb(224,224,224)</p>
-   <p style="color: #fff; background: #e1261c">Error: #e1261c / rgb(225,38,28)</p>
-   <p style="color: #fff; background: #ff8c00">Warning: #ff8c00 / rgb(255,140,0)</p>
    These are the most common colors used in the Central app. The Error and Warning colors are reserved for only error or warning messages/indicators.

## Buttons

1. Raised:

![image](https://user-images.githubusercontent.com/76065875/169550710-4d93973b-ac84-41ec-8341-62dd9e4cd6d4.png)

There should ideally only be one button of this type per page. This should be reserved for the button performing the main action of a page. 2. Flat Outlined Red `color="warn"`:

![image](https://user-images.githubusercontent.com/76065875/169550743-6aeb76a7-d74a-4dba-b470-44bb9cf82cf4.png)

These should be reserved for destructive actions that cannot be undone (such as deletes) and should not be common. 3. Flat Outlined Blue `color="primary"`:

![image](https://user-images.githubusercontent.com/76065875/169550758-a9e18158-2539-4eb2-82eb-9a022d816665.png)

These buttons should be considered medium emphasis and are to be used for any secondary actions. There can be multiple of these. 4. Flat Outlined Black:

![image](https://user-images.githubusercontent.com/76065875/169550783-0ea8783e-5aa3-47a8-96c0-82bfbefe50fd.png)

These buttons should be considered low emphasis and are to be used for dismissive actions (cancel, close, etc.). There shouldn’t need to be many of these per page, but there can be multiple. 5. Add/Remove:

![image](https://user-images.githubusercontent.com/76065875/169550806-10243b22-4586-4b28-9f49-50093e46eba9.png)

When using these, it should be clear what they are adding and removing. This means that in general, they will be left-aligned which will place them underneath the header of whatever item it is that is being added/removed.

When aligning multiple buttons in the same row, they should be ordered from lowest to highest emphasis with the lowest emphasis buttons on the left and the highest on the right:

![image](https://user-images.githubusercontent.com/76065875/169550852-4ec3252a-6451-40d2-b3c3-53299cb0fd1c.png)

## Spacing and Alignment

Flex CSS styling handles the majority of the spacing and alignment for our pages. Flex allows elements to automatically adjust widths to fill available space.

![image](https://user-images.githubusercontent.com/76065875/169550866-f2b8c262-0abf-413f-bf75-812612cd836c.png)

```html
<div class="page">
    <div class="section">
        <span class="header">Header</span>
        <div class="flex-container">
            <mat-form-field class="flex-item">
                <input matInput placeholder="input1" />
            </mat-form-field>
            <mat-form-field class="flex-item">
                <input matInput placeholder="input2" />
            </mat-form-field>
        </div>
    </div>
    <div class="section">
        <span class="header">Header 2</span>
        <div class="flex-container">
            <div class="spacer"></div>
            <mat-form-field class="flex-item">
                <input matInput placeholder="input3" />
            </mat-form-field>
        </div>
    </div>
</div>
```

-   The “page” class is a wrapper of the page content.
-   The “section” class is meant to logically separate the page content into more specific sections.
-   The “header” class within a section provides a header/description for the section.
-   The “flex-container” class separates each section into rows. It adds “display: flex” and other alignment styling.
-   The “flex-item” within a “flex-container” class acts as a column for the row and lets an element fill all available space. It adds “flex: 1” styling.
-   The “spacer” class acts the same as “flex-item” but is meant only to create empty space in order help align items with the previous rows.
    -   “large” and “small” classes can be used in combination with “flex-item” and “spacer” to cause an element to reserve twice or half as much space compared to other flex elements.

## Hints and Warnings

-   Hints:
    Hints are meant to help explain a field to a user. Rather than always showing this text and to reduce clutter, there is a tooltip icon component that enables hint text display on hover or click.

![image](https://user-images.githubusercontent.com/76065875/169550902-e848767b-cfc6-4c20-ab5e-bc7bde6f209d.png)

```html
<vioc-angular-info-button info="Hint text goes here"></vioc-angular-info-button>
```

-   Warnings:
    The typical use case for a warning is to inform the user that while what is entered isn’t wrong (no validation error), it is likely not a correct value/configuration.

![image](https://user-images.githubusercontent.com/76065875/169550936-966e6c32-5eb7-4f58-a4c2-964ee66df5ad.png)

```html
<mat-hint id="safetyFactorOverrideWarning" class="warning" *ngIf="showSafetyFactorWarning">
    This should usually be a value greater than 1. If you are wanting 50%, enter "50" instead of "0.5"
</mat-hint>
```

## Dialogs

<p style="color: #fff; background: #111820">Dialog Header: #111820 / rgb(17,24,32)</p>

-   Dialog’s are disruptive by design and should be used as sparingly as possible. If used too much or too frivolously, dialogs can distract the user from their task or train users to automatically dismiss them.
-   Content should be small enough to avoid scrolling. If scrolling is required, the header should be fixed to the top of the dialog and the action buttons should be fixed to the bottom of the dialog while the middle is scrollable.
-   Buttons should be placed right-aligned at the bottom of the dialog. Following the same lowest to highest priority ordering outlined in the buttons section.

## Search Page Configuration

The search pages are largely handled by the `SearchPageComponent`.

```html
<vioc-angular-search-page
    #searchPage
    [entityType]="'CompanyProduct'"
    [searchPageFacade]="companyProductFacade"
    [columns]="columns"
    [routePathVariables]="toPathVariables"
>
</vioc-angular-search-page>
```

-   \#searchPage declares a variable for the SearchPageComponent. It is needed to help the parent class (DataModifyingComponent) we use for search pages determine if the data is dirty to warn the user before navigating away that changes will be lost.
-   [entityType] determines what form validation the grid view will use for each row.
-   [searchPageFacade] provides the component with what it will use to perform its searches.
-   [columns] will determine which fields can be searched by, which fields get displayed by default or are displayable at all, whether they are editable in the grid view, etc.
-   [routePathVariables] sets up the navigation variables needed to go from the search page to a row specific view/edit page. This will depend on the edit page url configuration and will typically be an id or code value.

Most of the configuration for a search page will be in setting up the columns. There are a lot of configuration options available in the Column class, but a column will include at least:

-   name: The column header.
-   apiFieldPath: The path to the field/object of the column. This can be nested within another entity (which will make it non-editable in grid-view).
-   type: The javascript datatype that the field represents.

When a column is a foreign key, that almost always means it will be represented by an object. There are some predefined “Dropdowns” defined for many of these such as common codes, stores, services, categories. They will setup the column with things like the API endpoint to pull down options for the field to be searched by, how the field should be displayed, hints, etc.

## Sample Edit Page

![image](https://user-images.githubusercontent.com/76065875/169550958-f3757f24-459b-4528-b0a5-c2f863d7707a.png)

## Sample Search Page

![image](https://user-images.githubusercontent.com/76065875/169550971-bc28487c-2403-4502-b8e4-282281b81fdf.png)
