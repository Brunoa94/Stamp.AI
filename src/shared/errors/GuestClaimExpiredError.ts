/**
 * A guest's bag could not be moved to their account because their products
 * can no longer be claimed (the anonymous token expired or was never saved).
 */
export class GuestClaimExpiredError extends Error {
  constructor() {
    super("The guest's products can no longer be claimed");
    this.name = "GuestClaimExpiredError";
  }
}
