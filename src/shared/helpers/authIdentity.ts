type AuthIdentityT = { id: string; is_anonymous?: boolean };

/**
 * A user counts as registered only when they have a session that is not an
 * anonymous (guest) session. Guests with an anonymous session can create
 * products and pay, but are treated as logged out everywhere else.
 */
export function isRegisteredUser(
  user: AuthIdentityT | null | undefined,
): boolean {
  return !!user && !user.is_anonymous;
}
