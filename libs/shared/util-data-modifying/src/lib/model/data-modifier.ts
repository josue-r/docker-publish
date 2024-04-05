/**
 * Indicates a component is capable of modifying data in some way, provides a property
 * to determine if there are unsaved changes in the component.
 */
export interface DataModifier {
    readonly unsavedChanges: boolean;
    /** Optional function that returns a message that will be displayed when there are unsaved changes for the component. */
    unsavedChangesMessage?: () => string;
    /**
     * Optional function to reset a components form after confirming that the user wishes
     * to leave the page @see UnsavedChangesGuard#canDeactivate. This is used to prevent the
     * default browser window behavior of displaying a second unsaved changes message for `Leave Site?`.
     */
    resetComponentForm?: () => void;
}
