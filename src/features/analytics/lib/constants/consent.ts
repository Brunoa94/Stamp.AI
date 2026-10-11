/** localStorage key of the visitor's analytics consent decision. */
export const CONSENT_STORAGE_KEY = "stamp_consent";

/** Bump when the consent text changes materially: earlier decisions are asked again. */
export const CONSENT_VERSION = 1;

/** Dispatched on window whenever the decision changes in this tab. */
export const CONSENT_UPDATED_EVENT = "stamp:consent-updated";

/** Dispatched by "Cookie settings" to show the banner again. */
export const CONSENT_OPEN_EVENT = "stamp:consent-open";
