import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { SupabaseAuthProvider } from "./SupabaseAuthProvider";

type AuthListenerT = (event: string, session: { user: { id: string; is_anonymous?: boolean } } | null) => void;

const mocks = vi.hoisted(() => ({ listener: null as AuthListenerT | null }));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: (listener: AuthListenerT) => {
        mocks.listener = listener;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      },
    },
  }),
}));

function emit(event: string, user: { id: string; is_anonymous?: boolean } | null) {
  act(() => mocks.listener!(event, user ? { user } : null));
}

describe("SupabaseAuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    render(<SupabaseAuthProvider>{null}</SupabaseAuthProvider>);
  });

  afterEach(() => {
    mocks.listener = null;
  });

  it("keeps a guest's local cart when the guest logs in", () => {
    emit("SIGNED_IN", { id: "anon-1", is_anonymous: true });
    localStorage.setItem("local_cart", "items");

    emit("SIGNED_IN", { id: "user-1", is_anonymous: false });

    expect(localStorage.getItem("local_cart")).toBe("items");
  });

  it("clears private state on sign-out", () => {
    emit("SIGNED_IN", { id: "user-1", is_anonymous: false });
    localStorage.setItem("local_cart", "items");

    emit("SIGNED_OUT", null);

    expect(localStorage.getItem("local_cart")).toBeNull();
  });
});
