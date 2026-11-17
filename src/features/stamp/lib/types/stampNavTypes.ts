/** Message key under `stamp.header` for a header nav link label. */
type StampNavLabelKeyT = "catalog" | "faq" | "orders";

/** One text link in the Stamp header nav and mobile menu. */
export type StampNavItemT = {
  href: string;
  labelKey: StampNavLabelKeyT;
  /** Shown only to signed-in (non-anonymous) users. */
  registeredOnly: boolean;
};
